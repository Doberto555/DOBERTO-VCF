'use strict';
// Promotion (referal): lyen pataje, konte enskripsyon, demann rekonpans (peman manyèl pa admin).
const crypto = require('crypto');
const { setCookie } = require('./security');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_RE = /^[A-Z0-9]{6,12}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REF_COOKIE = 'dv_ref';
const LIFETIME_VIP = '2099-12-31T00:00:00.000Z';
const METHODS = new Set(['natcash', 'moncash', 'cashapp', 'paypal']);

function cfg() {
  return {
    target: Math.max(1, parseInt(process.env.PROMO_TARGET || '350', 10) || 350),
    reward: Math.max(1, parseInt(process.env.PROMO_REWARD_USD || '30', 10) || 30),
    site: String(process.env.SITE_URL || 'https://dobertovcf.online').replace(/\/+$/, '')
  };
}
function genCode() {
  let s = '';
  for (let i = 0; i < 8; i++) s += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return s;
}
function maskName(name) {
  const p = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return 'Membre';
  return p[0].slice(0, 20) + (p[1] ? ' ' + p[1][0].toUpperCase() + '.' : '');
}
// Nimewo Ayisyen: 8 chif oswa 509 + 8 chif. Retounen 509XXXXXXXX oswa null.
function normalizePhone(value) {
  const d = String(value || '').replace(/\D/g, '');
  if (d.length === 8) return '509' + d;
  if (d.length === 11 && d.startsWith('509')) return d;
  return null;
}
// Valide kont peman an selon metòd la: NatCash/MonCash = nimewo Ayisyen, Cash App = $cashtag, PayPal = imèl.
function normalizeAccount(method, value) {
  const raw = String(value || '').trim();
  if (method === 'natcash' || method === 'moncash') return normalizePhone(raw);
  if (method === 'cashapp') {
    const tag = raw.startsWith('$') ? raw : '$' + raw;
    return /^\$[A-Za-z][A-Za-z0-9_]{0,19}$/.test(tag) ? tag : null;
  }
  if (method === 'paypal') {
    const mail = raw.toLowerCase();
    return mail.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ? mail : null;
  }
  return null;
}
const BAD_ACCOUNT = {
  natcash: 'Antre yon nimewo Ayisyen valid (8 chif).',
  moncash: 'Antre yon nimewo Ayisyen valid (8 chif).',
  cashapp: 'Antre yon $cashtag Cash App valid (egzanp $non).',
  paypal: 'Antre yon adrès imèl PayPal valid.'
};
const isUuid = (v) => UUID_RE.test(String(v || ''));

// Rele depi yon manm fin enskri: kreye referal la si kòd la valid (pa janm kraze enskripsyon an).
async function recordReferral(supabase, { code, userId }) {
  const c = String(code || '').trim().toUpperCase();
  if (!CODE_RE.test(c) || !userId) return 'ignored';
  const owner = await supabase.from('referral_codes').select('user_id').eq('code', c).maybeSingle();
  if (owner.error || !owner.data) return 'unknown_code';
  if (String(owner.data.user_id) === String(userId)) return 'self';
  const ins = await supabase.from('referrals').insert({ referrer_user_id: owner.data.user_id, referred_user_id: userId, status: 'validated' });
  if (ins.error) {
    if (ins.error.code === '23505') return 'already';
    throw ins.error;
  }
  return 'recorded';
}

function register(app, express, deps) {
  const sb = () => deps.supabase();
  const json = express.json({ limit: '2kb' });

  // Kapte ?ref=KOD nan yon cookie 30 jou (sèlman paj yo, pa API a); register-secure li l.
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      const r = req.query && typeof req.query.ref === 'string' ? req.query.ref.trim().toUpperCase() : '';
      if (r && CODE_RE.test(r)) setCookie(req, res, REF_COOKIE, r, { maxAge: 30 * 86400 });
    }
    next();
  });

  async function getOrCreateCode(userId) {
    const cur = await sb().from('referral_codes').select('code').eq('user_id', userId).maybeSingle();
    if (cur.error) throw cur.error;
    if (cur.data) return cur.data.code;
    for (let i = 0; i < 6; i++) {
      const ins = await sb().from('referral_codes').insert({ user_id: userId, code: genCode() }).select('code').maybeSingle();
      if (!ins.error && ins.data) return ins.data.code;
      if (ins.error && ins.error.code !== '23505') throw ins.error;
      const again = await sb().from('referral_codes').select('code').eq('user_id', userId).maybeSingle();
      if (again.data) return again.data.code;
    }
    throw new Error('code_generation_failed');
  }
  async function countRefs(userId, status) {
    let q = sb().from('referrals').select('id', { count: 'exact', head: true }).eq('referrer_user_id', userId);
    if (status !== 'total') q = q.eq('status', status);
    const r = await q;
    if (r.error) throw r.error;
    return r.count || 0;
  }
  async function regsByUser(ids) {
    const out = {};
    const uniq = [...new Set(ids.filter(Boolean))];
    for (let i = 0; i < uniq.length; i += 100) {
      const r = await sb().from('registrations').select('user_id, name, email').in('user_id', uniq.slice(i, i + 100));
      if (r.error) throw r.error;
      for (const row of r.data || []) out[row.user_id] = row;
    }
    return out;
  }
  async function activePayout(userId) {
    const r = await sb().from('referral_payouts').select('id, status').eq('user_id', userId).in('status', ['pending', 'paid']).limit(1).maybeSingle();
    if (r.error) throw r.error;
    return r.data || null;
  }
  const fail = (res, code, error, status) => res.status(status || 400).json({ ok: false, code, error });
  const serverError = (res, tag, err) => {
    console.error('[DOBERTO VCF] promo ' + tag + ':', err && err.message);
    return res.status(500).json({ ok: false, code: 'server_error', error: 'Erè sèvè. Si tab yo poko egziste, kouri supabase-promotion.sql nan Supabase.' });
  };

  // ---- Manm: estati Promotion ----
  app.get('/api/promo/status', deps.readLimiter, deps.verifyUser, deps.requireDatabase, async (req, res) => {    res.setHeader('Cache-Control', 'no-store');
    const c = cfg();
    const userId = req.user.userId;
    try {
      const base = { ok: true, target: c.target, rewardUsd: c.reward };
      const reg = await sb().from('registrations').select('id').eq('user_id', userId).maybeSingle();
      if (reg.error) throw reg.error;
      if (!reg.data) {
        return res.json({ ...base, needsProfile: true, counts: { total: 0, validated: 0, pending: 0, rejected: 0 }, payoutInfo: null, payout: null, eligible: false, recent: [] });
      }
      const code = await getOrCreateCode(userId);
      const [total, validated, pending, rejected] = await Promise.all(['total', 'validated', 'pending', 'rejected'].map((s) => countRefs(userId, s)));
      const info = await sb().from('referral_payout_info').select('method, account').eq('user_id', userId).maybeSingle();
      if (info.error) throw info.error;
      const pay = await sb().from('referral_payouts').select('status, amount_usd, created_at, paid_at, note').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (pay.error) throw pay.error;
      const rec = await sb().from('referrals').select('referred_user_id, status, created_at').eq('referrer_user_id', userId).order('created_at', { ascending: false }).limit(10);
      if (rec.error) throw rec.error;
      const names = await regsByUser((rec.data || []).map((r) => r.referred_user_id));
      const payout = pay.data || null;
      return res.json({
        ...base, needsProfile: false, code, link: c.site + '/register.html?ref=' + code,
        counts: { total, validated, pending, rejected },
        payoutInfo: info.data || null, payout,
        eligible: validated >= c.target && !!info.data && (!payout || payout.status === 'rejected'),
        recent: (rec.data || []).map((r) => ({ name: maskName((names[r.referred_user_id] || {}).name), status: r.status, createdAt: r.created_at }))
      });
    } catch (err) { return serverError(res, 'status', err); }
  });

  // ---- Manm: enfòmasyon peman (NatCash/MonCash) ----
  app.put('/api/promo/payout-info', json, deps.limiter, deps.verifyUser, deps.requireDatabase, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const method = String(body.method || '').toLowerCase();
    if (!METHODS.has(method)) return fail(res, 'bad_method', 'Metòd la pa valid.');
    const account = normalizeAccount(method, body.account);
    if (!account) return fail(res, 'bad_account', BAD_ACCOUNT[method]);
    if (body.confirm !== true) return fail(res, 'confirm_required', 'Konfime enfòmasyon yo kòrèk.');
    try {
      const reg = await sb().from('registrations').select('id').eq('user_id', req.user.userId).maybeSingle();
      if (reg.error) throw reg.error;
      if (!reg.data) return fail(res, 'no_registration', 'Konplete pwofil ou dabò.', 404);
      if (await activePayout(req.user.userId)) return fail(res, 'payout_locked', 'Peman an deja kòmanse, ou pa ka modifye l ankò.', 409);
      const up = await sb().from('referral_payout_info').upsert({ user_id: req.user.userId, method, account, updated_at: new Date().toISOString() });
      if (up.error) throw up.error;
      return res.json({ ok: true, payoutInfo: { method, account } });
    } catch (err) { return serverError(res, 'payout-info', err); }
  });

  app.delete('/api/promo/payout-info', deps.limiter, deps.verifyUser, deps.requireDatabase, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      if (await activePayout(req.user.userId)) return fail(res, 'payout_locked', 'Peman an deja kòmanse, ou pa ka efase l ankò.', 409);
      const del = await sb().from('referral_payout_info').delete().eq('user_id', req.user.userId);
      if (del.error) throw del.error;
      return res.json({ ok: true });
    } catch (err) { return serverError(res, 'payout-info-delete', err); }
  });

  // ---- Manm: mande rekonpans lan (lè objektif la rive) ----
  app.post('/api/promo/claim', json, deps.limiter, deps.verifyUser, deps.requireDatabase, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const c = cfg();
    const userId = req.user.userId;
    try {
      const validated = await countRefs(userId, 'validated');
      if (validated < c.target) return fail(res, 'not_enough', 'Ou poko rive nan objektif la.', 409);
      const info = await sb().from('referral_payout_info').select('method, account').eq('user_id', userId).maybeSingle();
      if (info.error) throw info.error;
      if (!info.data) return fail(res, 'no_payout_info', 'Antre enfòmasyon peman ou dabò.', 409);
      if (await activePayout(userId)) return fail(res, 'already_claimed', 'Ou deja mande rekonpans lan.', 409);
      const ins = await sb().from('referral_payouts').insert({
        user_id: userId, method: info.data.method, account: info.data.account, amount_usd: c.reward, referrals_count: validated
      });
      if (ins.error) {
        if (ins.error.code === '23505') return fail(res, 'already_claimed', 'Ou deja mande rekonpans lan.', 409);
        throw ins.error;
      }
      return res.json({ ok: true });
    } catch (err) { return serverError(res, 'claim', err); }
  });

  // ---- Admin ----
  app.get('/api/admin/promo/payouts', deps.adminLimiter, deps.verifyAdmin, deps.requireDatabase, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const status = String(req.query.status || '').trim();
      let q = sb().from('referral_payouts')
        .select('id, user_id, method, account, amount_usd, referrals_count, status, note, created_at, paid_at')
        .order('created_at', { ascending: false }).limit(200);
      if (['pending', 'paid', 'rejected'].includes(status)) q = q.eq('status', status);
      const list = await q;
      if (list.error) throw list.error;
      const rows = list.data || [];
      const users = await regsByUser(rows.map((r) => r.user_id));
      const all = await sb().from('referral_payouts').select('status, amount_usd');
      if (all.error) throw all.error;
      const stats = { pending: 0, paidCount: 0, paidUsd: 0, referrals: 0 };
      for (const p of all.data || []) {
        if (p.status === 'pending') stats.pending++;
        if (p.status === 'paid') { stats.paidCount++; stats.paidUsd += Number(p.amount_usd) || 0; }
      }
      const rc = await sb().from('referrals').select('id', { count: 'exact', head: true });
      if (rc.error) throw rc.error;
      stats.referrals = rc.count || 0;
      return res.json({
        ok: true, target: cfg().target, stats,
        payouts: rows.map((r) => ({ ...r, name: (users[r.user_id] || {}).name || null, email: (users[r.user_id] || {}).email || null }))
      });
    } catch (err) { return serverError(res, 'admin payouts', err); }
  });

  app.get('/api/admin/promo/referrals/:userId', deps.adminLimiter, deps.verifyAdmin, deps.requireDatabase, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (!isUuid(req.params.userId)) return fail(res, 'bad_id', 'ID pa valid.');
    try {
      const list = await sb().from('referrals').select('id, referred_user_id, status, created_at')
        .eq('referrer_user_id', req.params.userId).order('created_at', { ascending: false }).limit(500);
      if (list.error) throw list.error;
      const rows = list.data || [];
      const users = await regsByUser(rows.map((r) => r.referred_user_id));
      return res.json({
        ok: true,
        referrals: rows.map((r) => ({ id: r.id, status: r.status, createdAt: r.created_at, name: (users[r.referred_user_id] || {}).name || null, email: (users[r.referred_user_id] || {}).email || null }))
      });
    } catch (err) { return serverError(res, 'admin referrals', err); }
  });

  app.put('/api/admin/promo/referrals/:id', json, deps.adminLimiter, deps.verifyAdmin, deps.requireDatabase, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const status = String((req.body && req.body.status) || '');
    if (!isUuid(req.params.id) || !['validated', 'rejected'].includes(status)) return fail(res, 'bad_request', 'Demann nan pa valid.');
    try {
      const up = await sb().from('referrals').update({ status, reviewed_at: new Date().toISOString() }).eq('id', req.params.id).select('id');
      if (up.error) throw up.error;
      if (!up.data || !up.data.length) return fail(res, 'not_found', 'Referal pa jwenn.', 404);
      return res.json({ ok: true });
    } catch (err) { return serverError(res, 'admin referral update', err); }
  });

  app.put('/api/admin/promo/payouts/:id', json, deps.adminLimiter, deps.verifyAdmin, deps.requireDatabase, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const status = String((req.body && req.body.status) || '');
    const note = String((req.body && req.body.note) || '').trim().slice(0, 300) || null;
    if (!isUuid(req.params.id) || !['paid', 'rejected'].includes(status)) return fail(res, 'bad_request', 'Demann nan pa valid.');
    try {
      const cur = await sb().from('referral_payouts').select('id, user_id, status').eq('id', req.params.id).maybeSingle();
      if (cur.error) throw cur.error;
      if (!cur.data) return fail(res, 'not_found', 'Demann pa jwenn.', 404);
      if (cur.data.status !== 'pending') return fail(res, 'not_pending', 'Demann sa a deja trete.', 409);
      if (status === 'paid') {
        const validated = await countRefs(cur.data.user_id, 'validated');
        if (validated < cfg().target) return fail(res, 'not_enough', 'Moun nan pa gen ase referal valide ankò (' + validated + '/' + cfg().target + '). Rejte demann nan olye.', 409);
      }
      const now = new Date().toISOString();
      const claim = await sb().from('referral_payouts')
        .update({ status, note, reviewed_at: now, paid_at: status === 'paid' ? now : null })
        .eq('id', req.params.id).eq('status', 'pending').select('id');
      if (claim.error) throw claim.error;
      if (!claim.data || !claim.data.length) return fail(res, 'not_pending', 'Demann sa a deja trete.', 409);
      if (status === 'paid') {
        // Badge VIP a vi: vip_until byen lwen nan avni.
        const vip = await sb().from('registrations').update({ vip_until: LIFETIME_VIP }).eq('user_id', cur.data.user_id).select('user_id');
        if (vip.error || !vip.data || !vip.data.length) {
          await sb().from('referral_payouts').update({ status: 'pending', reviewed_at: null, paid_at: null }).eq('id', req.params.id);
          throw (vip.error || new Error('registration_not_found'));
        }
      }
      return res.json({ ok: true });
    } catch (err) { return serverError(res, 'admin payout update', err); }
  });
}

module.exports = { register, recordReferral, REF_COOKIE };
