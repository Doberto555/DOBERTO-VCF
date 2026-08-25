// Pwen antre Vercel la: routes PRO + notifikasyon email devan Express app prensipal la.
const express = require('express');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const baseApp = require('../server.js');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'chanje-sekre-sa-a';
const MIN_TO_UNLOCK = parseInt(process.env.MIN_TO_UNLOCK || '500', 10);
const MAX_IN_FILE = parseInt(process.env.MAX_IN_FILE || '50000', 10);
const NAME_PREFIX = (process.env.NAME_PREFIX || 'D.M.L').trim();
const SITE_URL = String(process.env.SITE_URL || 'https://doberto-vcf-509.vercel.app').replace(/\/$/, '');
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const RESEND_FROM = String(process.env.RESEND_FROM || '').trim();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function withPrefix(name) {
  return NAME_PREFIX ? `${NAME_PREFIX} ${name}` : name;
}

function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const headerToken = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const token = headerToken || req.query.token || null;
  if (!token) return res.status(401).json({ error: 'Ou dwe konekte kòm admin.' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sesyon admin ekspire, konekte ankò.' });
  }
}

function emailNotificationsConfigured() {
  return Boolean(RESEND_API_KEY && RESEND_FROM && RESEND_API_KEY !== 'REPLACE_WITH_RESEND_API_KEY');
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function unlockEmailHtml(name) {
  const safeName = escapeHtml(name || '');
  const listUrl = `${SITE_URL}/list.html#download`;
  return `<!doctype html>
<html><body style="margin:0;background:#07080d;color:#f4f7fb;font-family:Arial,sans-serif">
  <div style="max-width:620px;margin:0 auto;padding:34px 20px">
    <div style="font-size:13px;font-weight:800;letter-spacing:.12em;color:#42e8b4;margin-bottom:18px">DOBERTO VCF</div>
    <div style="background:#11141c;border:1px solid #262c38;border-radius:18px;padding:28px">
      <h1 style="font-size:28px;line-height:1.15;margin:0 0 14px">VCF la disponib kounye a</h1>
      <p style="color:#b9c1cf;line-height:1.65;margin:0 0 12px">Bonjou${safeName ? ` ${safeName}` : ''}, objektif ${MIN_TO_UNLOCK.toLocaleString('fr-FR')} moun lan rive.</p>
      <p style="color:#b9c1cf;line-height:1.65;margin:0 0 24px">Ale sou DOBERTO VCF, verifye menm non ak nimewo ou te itilize lè ou te enskri a, epi telechaje fichye VCF la.</p>
      <a href="${listUrl}" style="display:inline-block;background:#42e8b4;color:#06120f;text-decoration:none;font-weight:800;padding:14px 20px;border-radius:12px">Verifye &amp; Download VCF</a>
      <p style="font-size:12px;color:#7f8999;line-height:1.6;margin:24px 0 0">Mesaj sa a se yon notifikasyon sèvis paske ou te bay email ou pandan enskripsyon DOBERTO VCF.</p>
    </div>
  </div>
</body></html>`;
}

function unlockEmailText(name) {
  const hello = name ? `Bonjou ${name},\n\n` : '';
  return `${hello}Objektif ${MIN_TO_UNLOCK} moun DOBERTO VCF la rive. VCF la disponib kounye a.\n\nVerifye non ak nimewo ou te itilize a epi telechaje li isit la:\n${SITE_URL}/list.html#download\n\nDOBERTO VCF`;
}

async function sendUnlockEmailCampaign() {
  if (!emailNotificationsConfigured()) {
    console.warn('[DOBERTO VCF] Unlock email skipped: RESEND_API_KEY/RESEND_FROM not configured.');
    return { sent: 0, skipped: 'not_configured' };
  }

  const { count, error: countError } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true });

  if (countError) throw countError;

  // Otomatikman voye SÈLMAN lè enskripsyon ki sot pase a fè total la rive egzakteman sou objektif la.
  // Sa evite relanse kanpay la pou 501, 502, elatriye.
  if ((count || 0) !== MIN_TO_UNLOCK) {
    return { sent: 0, skipped: 'threshold_not_exact', total: count || 0 };
  }

  const { data, error } = await supabase
    .from('registrations')
    .select('name,email,created_at')
    .not('email', 'is', null)
    .order('created_at', { ascending: true })
    .limit(Math.min(MAX_IN_FILE, Math.max(MIN_TO_UNLOCK, 1)));

  if (error) throw error;

  const seen = new Set();
  const recipients = (data || []).filter((row) => {
    const email = String(row.email || '').trim().toLowerCase();
    if (!validEmail(email) || seen.has(email)) return false;
    seen.add(email);
    row.email = email;
    return true;
  });

  if (!recipients.length) return { sent: 0, skipped: 'no_emails' };

  let sent = 0;
  const batchSize = 100; // Resend Batch API: jiska 100 email pa request.

  for (let i = 0; i < recipients.length; i += batchSize) {
    const slice = recipients.slice(i, i + batchSize);
    const payload = slice.map((row) => ({
      from: RESEND_FROM,
      to: [row.email],
      subject: 'DOBERTO VCF disponib — telechaje fichye a',
      html: unlockEmailHtml(row.name),
      text: unlockEmailText(row.name),
      tags: [{ name: 'campaign', value: `vcf_unlock_${MIN_TO_UNLOCK}` }]
    }));

    const batchNumber = Math.floor(i / batchSize) + 1;
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `doberto-vcf-unlock-${MIN_TO_UNLOCK}-batch-${batchNumber}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Resend batch ${batchNumber} failed (${response.status}): ${detail.slice(0, 300)}`);
    }
    sent += slice.length;
  }

  console.log(`[DOBERTO VCF] Unlock notification campaign queued for ${sent} email(s).`);
  return { sent };
}

// Stats PRO: menm done ansyen endpoint lan + estati notifikasyon email.
app.get('/api/stats', async (req, res) => {
  const { count, error } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true });
  if (error) return res.status(500).json({ error: 'Erè sèvè.' });

  const total = count || 0;
  res.json({
    total,
    minRequired: MIN_TO_UNLOCK,
    maxInFile: MAX_IN_FILE,
    unlocked: total >= MIN_TO_UNLOCK,
    remaining: Math.max(0, MIN_TO_UNLOCK - total),
    namePrefix: NAME_PREFIX,
    emailNotificationsEnabled: emailNotificationsConfigured()
  });
});

// Lis piblik PRO: rechèch + filtre peyi sou tout baz done a.
app.get('/api/public-list', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = String(req.query.search || '').trim().slice(0, 80);
  const country = String(req.query.country || '').trim().slice(0, 120);

  let q = supabase
    .from('registrations')
    .select('name, country_name, icon, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) q = q.ilike('name', `%${search}%`);
  if (country) q = q.eq('country_name', country);

  const { data, error, count } = await q.range(from, to);
  if (error) return res.status(500).json({ error: 'Erè sèvè.' });

  const list = (data || []).map((r) => ({ ...r, display_name: withPrefix(r.name) }));
  res.json({
    page,
    pageSize,
    total: count || 0,
    list,
    namePrefix: NAME_PREFIX,
    filters: { search, country }
  });
});

// KPI Admin PRO.
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    const [allResult, todayResult] = await Promise.all([
      supabase.from('registrations').select('*', { count: 'exact', head: true }),
      supabase.from('registrations').select('*', { count: 'exact', head: true }).gte('created_at', start.toISOString())
    ]);

    if (allResult.error || todayResult.error) {
      return res.status(500).json({ error: 'Erè sèvè.' });
    }

    const total = allResult.count || 0;
    const today = todayResult.count || 0;
    res.json({
      total,
      today,
      remaining: Math.max(0, MIN_TO_UNLOCK - total),
      unlocked: total >= MIN_TO_UNLOCK,
      minRequired: MIN_TO_UNLOCK,
      progress: MIN_TO_UNLOCK > 0 ? Math.min(100, Math.round((total / MIN_TO_UNLOCK) * 100)) : 100,
      emailNotificationsEnabled: emailNotificationsConfigured()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erè sèvè.' });
  }
});

// Intercepte repons enskripsyon ki reyisi a. Lè li fè total la rive egzakteman 500,
// voye notifikasyon yo anvan nou fini response la, pou serverless function lan pa koupe travay la.
app.use((req, res, next) => {
  if (req.method !== 'POST' || req.path !== '/api/register') return next();

  const originalJson = res.json.bind(res);
  let intercepted = false;

  res.json = function (body) {
    if (!intercepted && res.statusCode < 400 && body && body.ok === true) {
      intercepted = true;
      Promise.resolve(sendUnlockEmailCampaign())
        .catch((err) => console.error('[DOBERTO VCF] Unlock email error:', err))
        .finally(() => originalJson(body));
      return res;
    }
    return originalJson(body);
  };

  next();
});

// Tout lòt routes yo kontinye pase nan app orijinal la.
app.use(baseApp);

module.exports = app;
