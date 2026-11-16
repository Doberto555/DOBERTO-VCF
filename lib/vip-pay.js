'use strict';
const crypto = require('crypto');

const OK_STATUS = new Set(['success', 'succeeded', 'successful', 'completed', 'paid']);

function cfg() {
  return {
    base: String(process.env.TRANZAK_BASE_URL || 'https://api.tranzak.co/api/gateway/v1').replace(/\/+$/, ''),
    key: String(process.env.TRANZAK_API_KEY || '').trim(),
    secret: String(process.env.TRANZAK_WEBHOOK_SECRET || '').trim(),
    price: Math.max(1, parseInt(process.env.VIP_PRICE_HTG || '350', 10) || 350),
    days: Math.max(1, parseInt(process.env.VIP_DAYS || '30', 10) || 30),
    stripeKey: String(process.env.STRIPE_SECRET_KEY || '').trim(),
    stripeSecret: String(process.env.STRIPE_WEBHOOK_SECRET || '').trim(),
    priceUsd: Math.round(Math.max(0.5, parseFloat(process.env.VIP_PRICE_USD || '2.70') || 2.7) * 100) / 100,
    site: String(process.env.SITE_URL || 'https://dobertovcf.online').replace(/\/+$/, '')
  };
}
// Mode Tranzak detekte pa prefiks kle a: tk_live_ = pwodiksyon, tk_test_ = sandbox.
function keyMode(key) {
  if (/^tk_live_/.test(key)) return 'live';
  if (/^tk_test_/.test(key)) return 'test';
  return key ? 'unknown' : 'none';
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

// ---- Stripe (Checkout Session via REST, san SDK) ----
async function stripe(method, path, form) {
  const c = cfg();
  if (typeof fetch !== 'function') throw new Error('fetch_unavailable');
  if (!c.stripeKey) throw new Error('stripe_key_missing');
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 15000);
  try {
    const r = await fetch('https://api.stripe.com/v1' + path, {
      method,
      headers: { Authorization: 'Bearer ' + c.stripeKey, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form ? new URLSearchParams(form).toString() : undefined,
      signal: ac.signal
    });
    let data = null;
    try { data = await r.json(); } catch (_) {}
    return { status: r.status, ok: r.ok, data };
  } finally { clearTimeout(t); }
}
// Siyati webhook Stripe: t=...,v1=... ; HMAC-SHA256 sou `${t}.${raw}`, tolerans 5 minit
function stripeSigOk(raw, header, secret) {
  const parts = String(header || '').split(',').map((x) => x.trim().split('='));
  const t = (parts.find((x) => x[0] === 't') || [])[1];
  const sigs = parts.filter((x) => x[0] === 'v1').map((x) => x[1]);
  if (!t || !sigs.length || !secret) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const exp = Buffer.from(crypto.createHmac('sha256', secret).update(t + '.').update(raw).digest('hex'));
  return sigs.some((g) => { const b = Buffer.from(String(g || '')); return b.length === exp.length && crypto.timingSafeEqual(b, exp); });
}

function register(app, express, deps) {
  const sb = () => deps.supabase();
  {
    const c0 = cfg();
    const mode = keyMode(c0.key);
    console.log('[DOBERTO VCF] Tranzak mode:', mode, '| webhook secret:', c0.secret ? 'ok' : 'MANKE', '| pri:', c0.price, 'HTG /', c0.days, 'jou');
    if (process.env.NODE_ENV === 'production' && mode !== 'live') {
      console.warn('[DOBERTO VCF] ATANSYON: Tranzak pa nan mode live (kle ki tk_live_ obligatwa pou vre peman).');
    }
  }

  // ---- Kreye peman VIP (itilizatè konekte sèlman, montan pa sòti nan kliyan) ----
  app.post('/api/vip/checkout', express.json({ limit: '2kb' }), deps.limiter, deps.verifyUser, deps.requireDatabase, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const c = cfg();
    const method = String((req.body && req.body.method) || 'moncash').toLowerCase();
    const isStripe = method === 'stripe';
    if (isStripe ? !c.stripeKey : !c.key) return res.status(503).json({ ok: false, code: 'pay_not_configured', error: 'Peman poko pare.' });
    if (method !== 'moncash' && method !== 'natcash' && !isStripe) return res.status(400).json({ ok: false, code: 'bad_method', error: 'Metòd peman pa valid.' });
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
      const ins = await sb().from('vip_payments').insert({ reference, user_id: userId, amount: isStripe ? c.priceUsd : c.price, currency: isStripe ? 'USD' : 'HTG', days: c.days });
      if (ins.error) throw ins.error;

      if (isStripe) {
        const form = {
          mode: 'payment',
          'line_items[0][quantity]': '1',
          'line_items[0][price_data][currency]': 'usd',
          'line_items[0][price_data][unit_amount]': String(Math.round(c.priceUsd * 100)),
          'line_items[0][price_data][product_data][name]': 'DOBERTO VCF VIP - ' + c.days + ' jou',
          client_reference_id: reference,
          'metadata[reference]': reference,
          success_url: c.site + '/dashboard.html?tab=premium&paid=1',
          cancel_url: c.site + '/dashboard.html?tab=premium'
        };
        if (reg.email) form.customer_email = String(reg.email);
        const sr = await stripe('POST', '/checkout/sessions', form);
        const sUrl = sr.data && sr.data.url, sId = sr.data && sr.data.id;
        if (!sr.ok || !sUrl || !/^https:\/\//i.test(String(sUrl)) || !sId) {
          await sb().from('vip_payments').update({ status: 'failed' }).eq('reference', reference);
          console.error('[DOBERTO VCF] vip checkout: Stripe status', sr.status, JSON.stringify(sr.data || {}).slice(0, 300));
          return res.status(502).json({ ok: false, code: 'pay_create_failed', error: 'Peman an pa t kreye. Eseye ankò.' });
        }
        await sb().from('vip_payments').update({ payment_url: String(sUrl), transaction_id: String(sId) }).eq('reference', reference);
        return res.json({ ok: true, paymentUrl: String(sUrl), reference, amount: c.priceUsd, currency: 'USD', days: c.days });
      }

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
    let p, status, amount, currency, ref;
    if (/^cs_/.test(String(txId))) {
      // Stripe: re-verifye sesyon an dirèk nan API Stripe a (pa fè konfyans payload webhook la)
      const sr = await stripe('GET', '/checkout/sessions/' + encodeURIComponent(txId));
      if (!sr.ok || !sr.data) throw new Error('stripe_lookup_' + sr.status);
      const ss = sr.data;
      if (ss.payment_status !== 'paid') return 'not_paid';
      p = { transaction_id: ss.id };
      amount = Number(ss.amount_total) / 100;
      currency = String(ss.currency || '').toUpperCase();
      ref = ss.client_reference_id;
    } else {
      let r = await tranzak('GET', '/payments/' + encodeURIComponent(txId));
      if (!r.ok && refHint) r = await tranzak('GET', '/payments/reference/' + encodeURIComponent(refHint));
      if (!r.ok) throw new Error('tranzak_lookup_' + r.status);
      p = unwrap(r.data);
      status = String(pick(p, ['status', 'payment_status']) || '').toLowerCase();
      if (!OK_STATUS.has(status)) return 'not_paid';
      amount = Number(pick(p, ['amount']));
      currency = String(pick(p, ['currency']) || '').toUpperCase();
      ref = pick(p, ['reference', 'order_reference', 'merchant_reference']);
    }

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
    if (!evt || typeof evt !== 'object') return res.status(200).json({ status: 'ignored' });
    const txId = pick(evt.data, ['transaction_id', 'id']);
    if (!txId) return res.status(400).json({ error: 'no_transaction' });
    try {
      const out = await settle(String(txId), pick(evt.data, ['reference', 'order_reference', 'merchant_reference']));
      return res.status(200).json({ status: out });
    } catch (err) {
      console.error('[DOBERTO VCF] vip webhook:', err && err.message);
      return res.status(500).json({ status: 'retry' });
    }
  });

  // ---- Webhook Stripe: siyati sou raw body, epi settle() re-verifye sesyon an nan API Stripe ----
  app.post('/api/vip/stripe-webhook', express.raw({ type: '*/*', limit: '200kb' }), async (req, res) => {
    const c = cfg();
    if (!c.stripeSecret || !c.stripeKey) { console.error('[DOBERTO VCF] stripe webhook: STRIPE_* manke'); return res.status(503).json({ error: 'not_configured' }); }
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    if (!stripeSigOk(raw, req.get('stripe-signature'), c.stripeSecret)) return res.status(401).json({ error: 'Invalid signature' });
    let evt;
    try { evt = JSON.parse(raw.toString('utf8')); } catch (_) { return res.status(400).json({ error: 'bad_json' }); }
    const type = evt && evt.type;
    if (type !== 'checkout.session.completed' && type !== 'checkout.session.async_payment_succeeded') return res.status(200).json({ status: 'ignored' });
    const obj = evt.data && evt.data.object;
    if (!obj || !/^cs_/.test(String(obj.id || ''))) return res.status(400).json({ error: 'no_session' });
    try {
      const out = await settle(String(obj.id), obj.client_reference_id);
      return res.status(200).json({ status: out });
    } catch (err) {
      console.error('[DOBERTO VCF] stripe webhook:', err && err.message);
      return res.status(500).json({ status: 'retry' });
    }
  });

  // ---- Admin: kòb ki antre + lis moun ki peye (sèlman admin) ----
  async function fetchPaid() {
    const rows = [];
    for (let from = 0; from < 20000; from += 1000) {
      const { data, error } = await sb().from('vip_payments')
        .select('user_id, amount, currency, paid_at')
        .eq('status', 'paid').order('paid_at', { ascending: false }).range(from, from + 999);
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    return rows;
  }

  app.get('/api/admin/vip/payments', deps.adminLimiter, deps.verifyAdmin, deps.requireDatabase, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const paid = await fetchPaid();
      const tz = 'America/Port-au-Prince';
      const day = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: tz });
      const now = Date.now();
      const today = day(now);
      const stats = { currency: 'HTG', total: 0, today: 0, last7: 0, last30: 0, paidCount: paid.length, payers: 0, activeVip: 0, totalUsd: 0, paidCountUsd: 0 };
      const payers = new Set();
      for (const p of paid) {
        if (String(p.currency || '').toUpperCase() === 'USD') { stats.totalUsd += Number(p.amount) || 0; stats.paidCountUsd++; payers.add(p.user_id); continue; }
        if (String(p.currency || '').toUpperCase() !== 'HTG') continue;
        const a = Number(p.amount) || 0;
        stats.total += a;
        payers.add(p.user_id);
        const t = Date.parse(p.paid_at);
        if (!Number.isFinite(t)) continue;
        if (day(t) === today) stats.today += a;
        if (now - t <= 7 * 86400000) stats.last7 += a;
        if (now - t <= 30 * 86400000) stats.last30 += a;
      }
      stats.totalUsd = Math.round(stats.totalUsd * 100) / 100;
      stats.payers = payers.size;
      const act = await sb().from('registrations').select('user_id', { count: 'exact', head: true }).gt('vip_until', new Date().toISOString());
      if (act.error) throw act.error;
      stats.activeVip = act.count || 0;

      const list = await sb().from('vip_payments')
        .select('reference, user_id, amount, currency, days, status, transaction_id, created_at, paid_at')
        .order('created_at', { ascending: false }).limit(200);
      if (list.error) throw list.error;
      const rows = list.data || [];
      const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
      const users = {};
      if (ids.length) {
        const regs = await sb().from('registrations').select('user_id, name, email, vip_until').in('user_id', ids);
        if (regs.error) throw regs.error;
        for (const r of regs.data || []) users[r.user_id] = r;
      }
      const payments = rows.map((r) => {
        const u = users[r.user_id] || {};
        return { ...r, name: u.name || null, email: u.email || null, vip_until: u.vip_until || null };
      });
      return res.json({ ok: true, stats, payments });
    } catch (err) {
      console.error('[DOBERTO VCF] admin vip payments:', err && err.message);
      return res.status(500).json({ ok: false, code: 'server_error', error: 'Erè sèvè. Si tab vip_payments la poko egziste, kouri supabase-vip-payments.sql nan Supabase.' });
    }
  });
}

module.exports = { register };
