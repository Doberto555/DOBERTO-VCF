require('../lib/runtime-secrets');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim();
const supabase = createClient(SUPABASE_URL || 'https://example.supabase.co', SERVICE_KEY || 'missing');

function send(res, status, data) {
  res.status(status).setHeader('Cache-Control', 'no-store');
  return res.json(data);
}

function bearer(req) {
  const value = String(req.headers.authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

function verifyAdmin(req, res) {
  try {
    return jwt.verify(bearer(req), JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'doberto-vcf',
      audience: 'doberto-vcf-admin'
    });
  } catch (_) {
    send(res, 401, { code: 'admin_required', error: 'Sesyon admin lan pa valid.' });
    return null;
  }
}

function memberState(row, nowMs) {
  if (row.vip_plan_code === 'lifetime') return 'lifetime';
  const expiryMs = row.vip_expires_at ? new Date(row.vip_expires_at).getTime() : 0;
  if (!expiryMs || expiryMs <= nowMs) return 'expired';
  if (expiryMs <= nowMs + 7 * 24 * 60 * 60 * 1000) return 'expiring';
  return 'active';
}

module.exports = async function handler(req, res) {
  if (!verifyAdmin(req, res)) return;
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });

  try {
    const page = Math.max(1, Number.parseInt(req.query?.page || '1', 10) || 1);
    const pageSize = Math.min(50, Math.max(5, Number.parseInt(req.query?.pageSize || '20', 10) || 20));
    const filter = ['all', 'active', 'lifetime', 'expiring', 'expired'].includes(String(req.query?.filter || 'all').toLowerCase())
      ? String(req.query?.filter || 'all').toLowerCase()
      : 'all';
    const search = String(req.query?.search || '').trim().slice(0, 120);
    const now = new Date();
    const nowIso = now.toISOString();
    const sevenDaysIso = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from('app_users')
      .select('id,email,display_name,avatar_url,plan,vip_plan_code,vip_started_at,vip_expires_at,last_login_at', { count: 'exact' })
      .eq('plan', 'vip');

    if (search) {
      const safe = search.replace(/[,%()]/g, ' ').replace(/\s+/g, ' ').trim();
      if (safe) query = query.or(`display_name.ilike.%${safe}%,email.ilike.%${safe}%`);
    }

    if (filter === 'lifetime') {
      query = query.eq('vip_plan_code', 'lifetime');
    } else if (filter === 'active') {
      query = query.neq('vip_plan_code', 'lifetime').gt('vip_expires_at', sevenDaysIso);
    } else if (filter === 'expiring') {
      query = query.neq('vip_plan_code', 'lifetime').gt('vip_expires_at', nowIso).lte('vip_expires_at', sevenDaysIso);
    } else if (filter === 'expired') {
      query = query.neq('vip_plan_code', 'lifetime').or(`vip_expires_at.is.null,vip_expires_at.lte.${nowIso}`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data: users, error, count } = await query
      .order('vip_started_at', { ascending: false, nullsFirst: false })
      .range(from, to);
    if (error) throw error;

    const userIds = (users || []).map(x => x.id);
    let connections = [];
    if (userIds.length) {
      const result = await supabase
        .from('google_connections')
        .select('user_id,refresh_token_enc,access_token_enc,auto_sync,last_synced_at,last_error,next_sync_at')
        .in('user_id', userIds);
      if (result.error) throw result.error;
      connections = result.data || [];
    }
    const connectionMap = new Map(connections.map(x => [x.user_id, x]));
    const nowMs = now.getTime();

    const members = (users || []).map(row => {
      const c = connectionMap.get(row.id);
      const expiryMs = row.vip_expires_at ? new Date(row.vip_expires_at).getTime() : 0;
      const daysRemaining = row.vip_plan_code === 'lifetime' ? null : Math.max(0, Math.ceil((expiryMs - nowMs) / 86400000));
      return {
        id: row.id,
        email: row.email || '',
        displayName: row.display_name || '',
        avatarUrl: row.avatar_url || '',
        planCode: row.vip_plan_code || '',
        vipStartedAt: row.vip_started_at || null,
        vipExpiresAt: row.vip_plan_code === 'lifetime' ? null : (row.vip_expires_at || null),
        lastLoginAt: row.last_login_at || null,
        state: memberState(row, nowMs),
        daysRemaining,
        contactsConnected: Boolean(c && (c.refresh_token_enc || c.access_token_enc)),
        autoSync: Boolean(c?.auto_sync),
        lastSyncedAt: c?.last_synced_at || null,
        nextSyncAt: c?.next_sync_at || null,
        hasSyncError: Boolean(c?.last_error)
      };
    });

    return send(res, 200, {
      ok: true,
      members,
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / pageSize))
    });
  } catch (error) {
    console.error('[VIP admin members]', error);
    return send(res, 500, { error: 'Nou pa ka chaje manm VIP yo kounye a.' });
  }
};
