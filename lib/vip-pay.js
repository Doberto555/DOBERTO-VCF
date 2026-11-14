'use strict';
const crypto = require('crypto');

const OK_STATUS = new Set(['success', 'succeeded', 'successful', 'completed', 'paid']);

function cfg() {
  return {
    base: String(process.env.TRANZAK_BASE_URL || 'https://api.tranzak.co/api/gateway/v1').replace(/\/+$/, ''),
    key: String(process.env.TRANZAK_API_KEY || '').trim(),
    secret: String(process.env.TRANZAK_WEBHOOK_SECRET || '').trim(),
    price: Math.max(1, parseInt(process.env.VIP_PRICE_HTG || '350', 10) || 350),
    days: Math.max(1, parseInt(process.env.VIP_DAYS || '30', 10) || 30)
  };
}
function pick(o, keys) {
  if (!o || typeof o !== 'object') return undefined;
  for (const k of keys) { if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]; }
  return undefined;
}
function unwrap(d) {
  if (!d || typeof d !== 'object') return {};
  if (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) return d.data;
  if (d.payment && typeof d.payment === 'object') return d.payment;
  return d;
}
async function tranzak(method, path, body) {
  const c = cfg();
  if (typeof fetch !== 'function') throw new Error('fetch_unavailable');
  if (!c.key) throw new Error('api_key_missing');
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 15000);
  try {
    const r = await fetch(c.base + path, {
      method,
      headers: { 'X-API-Key': c.key, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: ac.signal
    });
    let data = null;
    try { data = await r.json(); } catch (_) {}
    return { status: r.status, ok: r.ok, data };
  } finally { clearTimeout(t); }
}

function register(app, express, deps) {
  const sb = () => deps.supabase();

  // ---- Kreye peman VIP (itilizatè konekte sèlman, montan pa sòti nan kliyan) ----
  app.post('/api/vip/checkout', express.json({ limit: '2kb' }), deps.limiter, deps.verifyUser, deps.requireDatabase, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const c = cfg();
    if (!c.key) return res.status(503).json({ ok: false, code: 'pay_not_configured', error: 'Peman poko pare.' });
    const method = String((req.body && req.body.method) || 'moncash').toLowerCase();
    if (method !== 'moncash' && method !== 'natcash') return res.status(400).json({ ok: false, code: 'bad_method', error: 'Metòd peman pa valid.' });
    const userId = req.user.userId;
    try {
      const { data: reg, error } = await sb().from('registrations').select('name, email, vip_until').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      if (!reg) return res.status(404).json({ ok: false, code: 'no_registration', error: 'Enskri anvan ou vin VIP.' });

      const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count } = await sb().from('vip_payments').select('reference', { count: 'exact', head: true })
        .eq('user_id', userId).eq('status', 'pending').gte('created_at', since);
      if ((count || 0) >= 3) return res.status(429).json({ ok: false, code: 'too_many', error: 'Tann kèk minit epi eseye ankò.' });

      const reference = 'VIP-' + crypto.randomBytes(9).toString('hex');
      const ins = await sb().from('vip_payments').insert({ reference, user_id: userId, amount: c.price, currency: 'HTG', days: c.days });
      if (ins.error) throw ins.error;

      const customerName = String(reg.name || '').replace(/[^\p{L}\p{N} .'-]/gu, '').trim().slice(0, 80) || 'Manm DOBERTO';
      const payload = {
        amount: c.price, currency: 'HTG', payment_method: method,
        customer_name: customerName,
        description: 'DOBERTO VCF VIP - ' + c.days + ' jou',
        reference: reference, metadata: { plan: 'vip', days: c.days }
      };
      if (reg.email) payload.customer_email = String(reg.email);

      const r = await tranzak('POST', '/payments', payload);
      const p = unwrap(r.data);
      const url = pick(p, ['payment_url', 'paymentUrl', 'checkout_url', 'url']);
      const txId = pick(p, ['transaction_id', 'id']);
      if (!(r.status === 201 || r.status === 200) || !url || !/^https:\/\//i.test(String(url))) {
        await sb().from('vip_payments').update({ status: 'failed' }).eq('reference', reference);
        console.error('[DOBERTO VCF] vip checkout: Tranzak status', r.status, JSON.stringify(r.data || {}).slice(0, 300));
        return res.status(502).json({ ok: false, code: 'pay_create_failed', error: 'Peman an pa t kreye. Eseye ankò.' });
      }
      await sb().from('vip_payments').update({ payment_url: String(url), transaction_id: txId ? String(txId) : null }).eq('reference', reference);
      return res.json({ ok: true, paymentUrl: String(url), reference, amount: c.price, currency: 'HTG', days: c.days });
    } catch (err) {
      console.error('[DOBERTO VCF] vip checkout:', err && err.message);
      return res.status(500).json({ ok: false, code: 'server_error', error: 'Erè sèvè.' });
    }
  });

  // ---- Kliyan an mande estati yon peman li menm (apre redireksyon an) ----
  app.get('/api/vip/payment/:ref', deps.limiter, deps.verifyUser, deps.requireDatabase, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const ref = String(req.params.ref || '');
    if (!/^VIP-[a-f0-9]{18}$/.test(ref)) return res.status(400).json({ ok: false });
    const read = () => sb().from('vip_payments').select('status, paid_at, transaction_id').eq('reference', ref).eq('user_id', req.user.userId).maybeSingle();
    try {
      let q = await read();
      if (q.error) throw q.error;
      if (!q.data) return res.status(404).json({ ok: false });
      if (q.data.status === 'pending') {
        try { await settle(q.data.transaction_id || ref, ref); } catch (e) { console.error('[DOBERTO VCF] vip recheck:', e && e.message); }
        q = await read();
        if (q.error || !q.data) throw (q.error || new Error('gone'));
      }
      return res.json({ ok: true, status: q.data.status, paidAt: q.data.paid_at || null });
    } catch (err) {
      console.error('[DOBERTO VCF] vip payment status:', err && err.message);
      return res.status(500).json({ ok: false });
    }
  });

  // ---- Webhook Tranzak: siyati sou raw body, epi re-verifye peman an nan API Tranzak ----
  async function settle(txId, refHint) {
    let r = await tranzak('GET', '/payments/' + encodeURIComponent(txId));
    if (!r.ok && refHint) r = await tranzak('GET', '/payments/reference/' + encodeURIComponent(refHint));
    if (!r.ok) throw new Error('tranzak_lookup_' + r.status);
    const p = unwrap(r.data);
    const status = String(pick(p, ['status', 'payment_status']) || '').toLowerCase();
    if (!OK_STATUS.has(status)) return 'not_paid';
    const amount = Number(pick(p, ['amount']));
    const currency = String(pick(p, ['currency']) || '').toUpperCase();
    const ref = pick(p, ['reference', 'order_reference', 'merchant_reference']);

    let row = null;
    let q = await sb().from('vip_payments').select('*').eq('transaction_id', String(txId)).maybeSingle();
    if (q.error) throw q.error;
    row = q.data;
    if (!row && ref) {
      q = await sb().from('vip_payments').select('*').eq('reference', String(ref)).maybeSingle();
      if (q.error) throw q.error;
      row = q.data;
    }
    if (!row) { console.error('[DOBERTO VCF] vip webhook: peman enkoni', txId); return 'unknown'; }
    if (row.status !== 'pending') return 'already';
    if (amount !== Number(row.amount) || currency !== String(row.currency).toUpperCase()) {
      await sb().from('vip_payments').update({ status: 'mismatch' }).eq('reference', row.reference).eq('status', 'pending');
      console.error('[DOBERTO VCF] vip webhook: montan/devise pa kòrèk', row.reference, amount, currency);
      return 'mismatch';
    }

    const claim = await sb().from('vip_payments')
      .update({ status: 'paid', paid_at: new Date().toISOString(), transaction_id: String(pick(p, ['transaction_id']) || txId) })
      .eq('reference', row.reference).eq('status', 'pending').select('reference');
    if (claim.error) throw claim.error;
    if (!claim.data || !claim.data.length) return 'already';

    const revert = () => sb().from('vip_payments').update({ status: 'pending', paid_at: null }).eq('reference', row.reference);
    try {
      const cur = await sb().from('registrations').select('vip_until').eq('user_id', row.user_id).maybeSingle();
      if (cur.error) throw cur.error;
      const now = Date.now();
      const old = cur.data && cur.data.vip_until ? Date.parse(cur.data.vip_until) : 0;
      const base = Number.isFinite(old) && old > now ? old : now;
      const until = new Date(base + Number(row.days) * 86400000).toISOString();
      const up = await sb().from('registrations').update({ vip_until: until }).eq('user_id', row.user_id).select('user_id');
      if (up.error) throw up.error;
      if (!up.data || !up.data.length) throw new Error('registration_not_found');
      console.log('[DOBERTO VCF] VIP aktive', row.reference, 'jiska', until);
      return 'granted';
    } catch (e) {
      await revert();
      throw e;
    }
  }

  app.post('/api/vip/webhook', express.raw({ type: '*/*', limit: '100kb' }), async (req, res) => {
    const c = cfg();
    if (!c.secret) { console.error('[DOBERTO VCF] vip webhook: TRANZAK_WEBHOOK_SECRET manke'); return res.status(503).json({ error: 'not_configured' }); }
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const got = Buffer.from(String(req.get('x-tranzak-signature') || '').trim().toLowerCase());
    const exp = Buffer.from(crypto.createHmac('sha256', c.secret).update(raw).digest('hex'));
    if (got.length !== exp.length || !crypto.timingSafeEqual(got, exp)) return res.status(401).json({ error: 'Invalid signature' });
    let evt;
    try { evt = JSON.parse(raw.toString('utf8')); } catch (_) { return res.status(400).json({ error: 'bad_json' }); }
    if (!evt || evt.event !== 'payment.success') return res.status(200).json({ status: 'ignored' });
    const txId = pick(evt.data, ['transaction_id', 'id']);
    if (!txId) return res.status(400).json({ error: 'no_transaction' });
    try {
      const out = await settle(String(txId));
      return res.status(200).json({ status: out });
    } catch (err) {
      console.error('[DOBERTO VCF] vip webhook:', err && err.message);
      return res.status(500).json({ status: 'retry' });
    }
  });
}

module.exports = { register };
