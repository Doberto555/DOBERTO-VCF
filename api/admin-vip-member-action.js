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

function addMonthsISO(baseMs, months) {
  const source = new Date(baseMs);
  const day = source.getUTCDate();
  const target = new Date(source);
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth() + Number(months));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, last));
  return target.toISOString();
}

module.exports = async function handler(req, res) {
  if (!verifyAdmin(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  try {
    const userId = String(req.body?.userId || '').trim();
    const action = String(req.body?.action || '').trim().toLowerCase();
    const planCode = String(req.body?.planCode || '').trim().toLowerCase();

    if (!/^[0-9a-f-]{36}$/i.test(userId)) return send(res, 400, { error: 'ID manm VIP la pa valid.' });
    if (!['extend', 'revoke'].includes(action)) return send(res, 400, { error: 'Aksyon VIP la pa valid.' });

    const { data: user, error: userError } = await supabase
      .from('app_users')
      .select('id,email,display_name,plan,vip_plan_code,vip_started_at,vip_expires_at')
      .eq('id', userId)
      .maybeSingle();
    if (userError) throw userError;
    if (!user) return send(res, 404, { error: 'Manm sa a pa egziste.' });

    const now = Date.now();
    if (action === 'revoke') {
      const { error } = await supabase
        .from('app_users')
        .update({ plan: 'free', vip_plan_code: null, vip_started_at: null, vip_expires_at: null })
        .eq('id', userId);
      if (error) throw error;
      await supabase.from('google_connections').update({ next_sync_at: null, updated_at: new Date().toISOString() }).eq('user_id', userId);
      return send(res, 200, { ok: true, action: 'revoke', userId });
    }

    if (!['monthly', 'quarterly', 'yearly', 'lifetime'].includes(planCode)) {
      return send(res, 400, { error: 'Plan VIP la pa valid.' });
    }

    let expiresAt = null;
    if (planCode !== 'lifetime') {
      const months = planCode === 'monthly' ? 1 : planCode === 'quarterly' ? 3 : 12;
      const currentExpiry = user.vip_expires_at ? new Date(user.vip_expires_at).getTime() : 0;
      expiresAt = addMonthsISO(Math.max(now, Number.isFinite(currentExpiry) ? currentExpiry : 0), months);
    }

    const { error: updateError } = await supabase
      .from('app_users')
      .update({
        plan: 'vip',
        vip_plan_code: planCode,
        vip_started_at: user.vip_started_at || new Date(now).toISOString(),
        vip_expires_at: expiresAt
      })
      .eq('id', userId);
    if (updateError) throw updateError;

    await supabase
      .from('google_connections')
      .update({ next_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    return send(res, 200, { ok: true, action: 'extend', userId, planCode, expiresAt });
  } catch (error) {
    console.error('[VIP admin member action]', error);
    return send(res, 500, { error: 'Nou pa ka modifye manm VIP sa a kounye a.' });
  }
};
