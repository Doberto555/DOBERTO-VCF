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
    const payload = jwt.verify(bearer(req), JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'doberto-vcf',
      audience: 'doberto-vcf-admin'
    });
    return payload;
  } catch (_) {
    send(res, 401, { code: 'admin_required', error: 'Sesyon admin lan pa valid.' });
    return null;
  }
}

function sumByCurrency(rows) {
  const totals = {};
  for (const row of rows || []) {
    const currency = String(row.currency || '').trim().toUpperCase() || 'HTG';
    const amount = Number(row.amount || 0);
    if (!Number.isFinite(amount)) continue;
    totals[currency] = Math.round(((totals[currency] || 0) + amount) * 100) / 100;
  }
  return totals;
}

module.exports = async function handler(req, res) {
  if (!verifyAdmin(req, res)) return;
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });

  try {
    const now = new Date();
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const moncashMode = String(process.env.MONCASH_MODE || 'sandbox').trim().toLowerCase() === 'live' ? 'live' : 'sandbox';

    const [
      activeVipResult,
      lifetimeVipResult,
      expiringResult,
      pendingManualResult,
      pendingMoncashResult,
      approvedManualResult,
      paidMoncashResult
    ] = await Promise.all([
      supabase.from('app_users').select('id', { count: 'exact', head: true }).eq('plan', 'vip').or(`vip_plan_code.eq.lifetime,vip_expires_at.gt.${now.toISOString()}`),
      supabase.from('app_users').select('id', { count: 'exact', head: true }).eq('plan', 'vip').eq('vip_plan_code', 'lifetime'),
      supabase.from('app_users').select('id', { count: 'exact', head: true }).eq('plan', 'vip').neq('vip_plan_code', 'lifetime').gt('vip_expires_at', now.toISOString()).lte('vip_expires_at', inSevenDays.toISOString()),
      supabase.from('vip_payment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('vip_moncash_orders').select('id', { count: 'exact', head: true }).in('status', ['created', 'redirected']),
      supabase.from('vip_payment_requests').select('amount,currency').eq('status', 'approved').limit(5000),
      supabase.from('vip_moncash_orders').select('amount,currency').eq('status', 'paid').limit(5000)
    ]);

    const results = [activeVipResult, lifetimeVipResult, expiringResult, pendingManualResult, pendingMoncashResult, approvedManualResult, paidMoncashResult];
    const firstError = results.find(x => x && x.error)?.error;
    if (firstError) throw firstError;

    const manualRevenue = sumByCurrency(approvedManualResult.data || []);
    const moncashPaid = sumByCurrency(paidMoncashResult.data || []);
    const revenue = { ...manualRevenue };
    if (moncashMode === 'live') {
      for (const [currency, amount] of Object.entries(moncashPaid)) {
        revenue[currency] = Math.round(((revenue[currency] || 0) + amount) * 100) / 100;
      }
    }

    return send(res, 200, {
      ok: true,
      moncashMode,
      stats: {
        activeVip: activeVipResult.count || 0,
        lifetimeVip: lifetimeVipResult.count || 0,
        expiringSoon: expiringResult.count || 0,
        pendingManual: pendingManualResult.count || 0,
        pendingMoncash: pendingMoncashResult.count || 0,
        revenue,
        moncashSandboxPaid: moncashMode === 'sandbox' ? moncashPaid : {}
      }
    });
  } catch (error) {
    console.error('[VIP admin overview]', error);
    return send(res, 500, { error: 'Nou pa ka chaje rezime VIP la kounye a.' });
  }
};
