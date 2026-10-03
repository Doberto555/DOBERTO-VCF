require('dotenv').config({ override: true });
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const { createGoogleSync } = require('./lib/google-sync');
const publicSettingsHandler = require('./api/public-settings');
const communityAnnounceHandler = require('./api/community-announce');
const adminCommunitySettingsHandler = require('./api/admin-community-settings');
const adminSystemHealthHandler = require('./api/admin-system-health');
const groupMigrationHandler = require('./api/group-migration');
const adminGroupMigrationHandler = require('./api/admin-group-migration');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// ---------- Konfigirasyon ----------
const PORT = parseInt(process.env.PORT || '3000', 10);
const SITE_URL = String(process.env.SITE_URL || 'https://doberto-vcf-509.vercel.app').replace(/\/$/, '');
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '').trim();
const MIN_TO_UNLOCK = Math.max(1, parseInt(process.env.MIN_TO_UNLOCK || '500', 10));
const MAX_IN_FILE = Math.max(MIN_TO_UNLOCK, parseInt(process.env.MAX_IN_FILE || '50000', 10));
const NAME_PREFIX = String(process.env.NAME_PREFIX || 'D.M.L').trim();
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const RESEND_FROM = String(process.env.RESEND_FROM || '').trim();
const ONESIGNAL_APP_ID = String(process.env.ONESIGNAL_APP_ID || '').trim();
const ONESIGNAL_REST_API_KEY = String(process.env.ONESIGNAL_REST_API_KEY || '').trim();
const CRON_SECRET = String(process.env.CRON_SECRET || '').trim();
const DOWNLOAD_METRIC_PREFIX = 'vcf_download_user_';
const ADS_SETTINGS_FILE = path.join(__dirname, '.runtime', 'site-ads.json');
const DEFAULT_AD_SETTINGS = Object.freeze({
  enabled:false,
  bannerEnabled:false,bannerCode:'',
  nativeEnabled:false,nativeCode:'',
  popunderEnabled:false,popunderCode:'',
  socialBarEnabled:false,socialBarCode:'',
  directLinkEnabled:false,directLinkUrl:'',directLinkLabel:'Sponsored'
});

const ALLOWED_ICONS = ['', 'star', 'crown', 'check', 'fire', 'heart', 'ninja', 'vip', 'flag'];

const databaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY &&
  !SUPABASE_URL.includes('YOUR_PROJECT') &&
  !SUPABASE_SERVICE_ROLE_KEY.includes('REPLACE_WITH')
);
const securityConfigured = Boolean(
  JWT_SECRET.length >= 32 && ADMIN_PASSWORD.length >= 8 &&
  !JWT_SECRET.includes('REPLACE_WITH') && !ADMIN_PASSWORD.includes('REPLACE_WITH')
);

const supabase = createClient(
  databaseConfigured ? SUPABASE_URL : 'https://example.supabase.co',
  databaseConfigured ? SUPABASE_SERVICE_ROLE_KEY : 'missing-service-role-key'
);

const googleSync = createGoogleSync({
  supabase,
  siteUrl: SITE_URL,
  jwtSecret: JWT_SECRET,
  serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
  namePrefix: NAME_PREFIX
});

// ---------- Sekirite HTTP ----------
const allowedOrigins = new Set([
  SITE_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400
}));

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-src https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  if (req.secure || String(req.headers['x-forwarded-proto'] || '').toLowerCase() === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use(express.json({ limit: '256kb', strict: true }));
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  maxAge: 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith('sw.js') || filePath.endsWith('OneSignalSDKWorker.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// ---------- Rate limiting ----------
const limiterDefaults = { standardHeaders: 'draft-7', legacyHeaders: false };
const registerLimiter = rateLimit({ ...limiterDefaults, windowMs: 15 * 60 * 1000, limit: 30 });
const downloadLimiter = rateLimit({ ...limiterDefaults, windowMs: 15 * 60 * 1000, limit: 10 });
const adminLoginLimiter = rateLimit({ ...limiterDefaults, windowMs: 15 * 60 * 1000, limit: 8 });
const adminActionLimiter = rateLimit({ ...limiterDefaults, windowMs: 60 * 60 * 1000, limit: 120 });
const pushSendLimiter = rateLimit({ ...limiterDefaults, windowMs: 60 * 60 * 1000, limit: 12 });
const publicReadLimiter = rateLimit({ ...limiterDefaults, windowMs: 60 * 1000, limit: 300 });

// ---------- Itilitè ----------
function normalizeAdSettings(input = {}) {
  const code = value => String(value || '').slice(0, 50000);
  let directLinkUrl = String(input.directLinkUrl || '').trim().slice(0, 2048);
  if (directLinkUrl && !/^https:\/\//i.test(directLinkUrl)) directLinkUrl = '';
  return {
    enabled: input.enabled === true,
    bannerEnabled: input.bannerEnabled === true, bannerCode: code(input.bannerCode),
    nativeEnabled: input.nativeEnabled === true, nativeCode: code(input.nativeCode),
    popunderEnabled: input.popunderEnabled === true, popunderCode: code(input.popunderCode),
    socialBarEnabled: input.socialBarEnabled === true, socialBarCode: code(input.socialBarCode),
    directLinkEnabled: input.directLinkEnabled === true,
    directLinkUrl,
    directLinkLabel: String(input.directLinkLabel || 'Sponsored').trim().slice(0,80) || 'Sponsored'
  };
}
function readAdSettings() {
  try {
    if (!fs.existsSync(ADS_SETTINGS_FILE)) return { ...DEFAULT_AD_SETTINGS };
    return normalizeAdSettings(JSON.parse(fs.readFileSync(ADS_SETTINGS_FILE,'utf8')));
  } catch (err) {
    console.error('[DOBERTO VCF] ad settings read error:', err);
    return { ...DEFAULT_AD_SETTINGS };
  }
}
function writeAdSettings(input) {
  const clean=normalizeAdSettings(input);
  fs.mkdirSync(path.dirname(ADS_SETTINGS_FILE),{recursive:true});
  const tmp=ADS_SETTINGS_FILE+'.tmp';
  fs.writeFileSync(tmp,JSON.stringify(clean,null,2),'utf8');
  fs.renameSync(tmp,ADS_SETTINGS_FILE);
  return clean;
}

function onlyDigits(str) {
  return String(str || '').replace(/\D/g, '');
}

function normalizeName(value) {
  let name = String(value || '').trim();
  if (NAME_PREFIX) {
    const prefix = NAME_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    name = name.replace(new RegExp(`^${prefix}\\s+`, 'i'), '');
  }
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function withPrefix(name) {
  return NAME_PREFIX ? `${NAME_PREFIX} ${name}` : name;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function secureEqual(a, b) {
  const ah = crypto.createHash('sha256').update(String(a || '')).digest();
  const bh = crypto.createHash('sha256').update(String(b || '')).digest();
  return crypto.timingSafeEqual(ah, bh);
}

function requireDatabase(req, res, next) {
  if (!databaseConfigured) {
    return res.status(503).json({ error: 'Database lan poko configure sou sèvè a.' });
  }
  next();
}

function requireSecurity(res) {
  if (securityConfigured) return true;
  res.status(503).json({ error: 'Sekirite production lan poko configure. Mete JWT_SECRET ak ADMIN_PASSWORD nan environment variables.' });
  return false;
}

function verifyAdmin(req, res, next) {
  if (!requireSecurity(res)) return;
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Ou dwe konekte kòm admin.' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'doberto-vcf',
      audience: 'doberto-vcf-admin'
    });
    next();
  } catch (_) {
    return res.status(401).json({ error: 'Sesyon admin ekspire, konekte ankò.' });
  }
}

function signUserSession(user) {
  return jwt.sign({
    purpose: 'user_session',
    userId: user.id,
    googleSub: user.google_sub,
    email: user.email
  }, JWT_SECRET, {
    algorithm: 'HS256', expiresIn: '7d', issuer: 'doberto-vcf', audience: 'doberto-vcf-user'
  });
}

function verifyUser(req, res, next) {
  if (!requireSecurity(res)) return;
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return res.status(401).json({ code: 'auth_required', error: 'Konekte ak Google anvan.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'], issuer: 'doberto-vcf', audience: 'doberto-vcf-user'
    });
    if (payload.purpose !== 'user_session' || !payload.userId) throw new Error('bad session');
    req.user = payload;
    next();
  } catch (_) {
    return res.status(401).json({ code: 'session_expired', error: 'Sesyon ou ekspire. Konekte ak Google ankò.' });
  }
}

function emailNotificationsConfigured() {
  return Boolean(RESEND_API_KEY && RESEND_FROM && !RESEND_API_KEY.includes('REPLACE_WITH'));
}

function pushNotificationsConfigured() {
  return Boolean(
    ONESIGNAL_APP_ID && ONESIGNAL_REST_API_KEY &&
    !ONESIGNAL_APP_ID.includes('REPLACE_WITH') &&
    !ONESIGNAL_REST_API_KEY.includes('REPLACE_WITH')
  );
}

function cleanUrl(value, fallback = '/') {
  try {
    const target = new URL(String(value || fallback), `${SITE_URL}/`);
    if (target.origin !== new URL(SITE_URL).origin) return `${SITE_URL}${fallback.startsWith('/') ? fallback : `/${fallback}`}`;
    return target.toString();
  } catch (_) {
    return `${SITE_URL}${fallback.startsWith('/') ? fallback : `/${fallback}`}`;
  }
}

async function getUniqueDownloadCount() {
  try {
    const { count, error } = await supabase
      .from('notification_campaigns')
      .select('campaign_key', { count: 'exact', head: true })
      .like('campaign_key', `${DOWNLOAD_METRIC_PREFIX}%`);
    if (error) {
      console.warn('[DOBERTO VCF] download metric count unavailable:', error.message);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.warn('[DOBERTO VCF] download metric count failed:', err && err.message || err);
    return 0;
  }
}

async function recordVcfDownload(registrationId) {
  const id = String(registrationId || '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return false;
  const campaignKey = `${DOWNLOAD_METRIC_PREFIX}${id}`;
  const nowIso = new Date().toISOString();

  try {
    const existingResult = await supabase
      .from('notification_campaigns')
      .select('campaign_key,attempts')
      .eq('campaign_key', campaignKey)
      .maybeSingle();

    if (existingResult.error) {
      console.warn('[DOBERTO VCF] download metric table unavailable:', existingResult.error.message);
      return false;
    }

    const attempts = Number(existingResult.data && existingResult.data.attempts || 0) + 1;
    const payload = {
      campaign_key: campaignKey,
      status: 'downloaded',
      attempts,
      updated_at: nowIso,
      details: { registrationId: id, lastDownloadAt: nowIso }
    };

    let result;
    if (existingResult.data) {
      result = await supabase.from('notification_campaigns').update(payload).eq('campaign_key', campaignKey);
    } else {
      result = await supabase.from('notification_campaigns').insert(payload);
      if (result.error && String(result.error.code || '') === '23505') {
        result = await supabase.from('notification_campaigns').update(payload).eq('campaign_key', campaignKey);
      }
    }

    if (result.error) {
      console.warn('[DOBERTO VCF] download metric write failed:', result.error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[DOBERTO VCF] download metric write failed:', err && err.message || err);
    return false;
  }
}

// ---------- Email unlock ----------
function unlockEmailHtml(name) {
  const safeName = escapeHtml(name || '');
  const listUrl = `${SITE_URL}/list.html#download`;
  return `<!doctype html><html><body style="margin:0;background:#07080d;color:#f4f7fb;font-family:Arial,sans-serif">
  <div style="max-width:620px;margin:0 auto;padding:34px 20px">
    <div style="font-size:13px;font-weight:800;letter-spacing:.12em;color:#42e8b4;margin-bottom:18px">DOBERTO VCF</div>
    <div style="background:#11141c;border:1px solid #262c38;border-radius:18px;padding:28px">
      <h1 style="font-size:28px;line-height:1.15;margin:0 0 14px">VCF la disponib kounye a</h1>
      <p style="color:#b9c1cf;line-height:1.65;margin:0 0 12px">Bonjou${safeName ? ` ${safeName}` : ''}, objektif ${MIN_TO_UNLOCK.toLocaleString('fr-FR')} moun lan rive.</p>
      <p style="color:#b9c1cf;line-height:1.65;margin:0 0 24px">Ale sou DOBERTO VCF, verifye menm non ak nimewo ou te itilize lè ou te enskri a, epi telechaje fichye VCF la.</p>
      <a href="${listUrl}" style="display:inline-block;background:#42e8b4;color:#06120f;text-decoration:none;font-weight:800;padding:14px 20px;border-radius:12px">Verifye &amp; Download VCF</a>
      <p style="font-size:12px;color:#7f8999;line-height:1.6;margin:24px 0 0">Mesaj sa a se yon notifikasyon sèvis paske ou te bay email ou pandan enskripsyon DOBERTO VCF.</p>
    </div>
  </div></body></html>`;
}

function unlockEmailText(name) {
  const hello = name ? `Bonjou ${name},\n\n` : '';
  return `${hello}Objektif ${MIN_TO_UNLOCK} moun DOBERTO VCF la rive. VCF la disponib kounye a.\n\nVerifye non ak nimewo ou te itilize a epi telechaje li isit la:\n${SITE_URL}/list.html#download\n\nDOBERTO VCF`;
}

async function sendUnlockEmailCampaign() {
  if (!emailNotificationsConfigured()) return { ok: false, skipped: 'not_configured', sent: 0 };

  const { data, error } = await supabase
    .from('registrations')
    .select('name,email,created_at')
    .not('email', 'is', null)
    .order('created_at', { ascending: true })
    .limit(Math.min(MAX_IN_FILE, 50000));
  if (error) throw error;

  const seen = new Set();
  const recipients = (data || []).filter((row) => {
    const email = String(row.email || '').trim().toLowerCase();
    if (!validEmail(email) || seen.has(email)) return false;
    seen.add(email);
    row.email = email;
    return true;
  });

  if (!recipients.length) return { ok: true, sent: 0, skipped: 'no_emails' };

  let sent = 0;
  for (let i = 0; i < recipients.length; i += 100) {
    const slice = recipients.slice(i, i + 100);
    const batchNumber = Math.floor(i / 100) + 1;
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `doberto-vcf-unlock-${MIN_TO_UNLOCK}-batch-${batchNumber}`
      },
      body: JSON.stringify(slice.map((row) => ({
        from: RESEND_FROM,
        to: [row.email],
        subject: 'DOBERTO VCF disponib — telechaje fichye a',
        html: unlockEmailHtml(row.name),
        text: unlockEmailText(row.name),
        tags: [{ name: 'campaign', value: `vcf_unlock_${MIN_TO_UNLOCK}` }]
      })))
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Resend batch ${batchNumber} failed (${response.status}): ${detail.slice(0, 240)}`);
    }
    sent += slice.length;
  }
  return { ok: true, sent };
}

// ---------- OneSignal push ----------
async function sendOneSignalPush({ title, message, url = '/', campaignName = 'doberto-vcf-push' }) {
  if (!pushNotificationsConfigured()) return { ok: false, skipped: 'not_configured' };
  const launchUrl = cleanUrl(url, '/');
  const response = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      target_channel: 'push',
      included_segments: ['Subscribed Users'],
      headings: { en: String(title || 'DOBERTO VCF').slice(0, 80) },
      contents: { en: String(message || '').slice(0, 220) },
      url: launchUrl,
      chrome_web_icon: `${SITE_URL}/icons/doberto-vcf-192.png`,
      chrome_web_badge: `${SITE_URL}/icons/doberto-vcf-192.png`,
      name: String(campaignName || 'doberto-vcf-push').slice(0, 128)
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.errors) {
    const detail = JSON.stringify(payload || {}).slice(0, 500);
    const noSubscribers = Array.isArray(payload && payload.errors) &&
      payload.errors.some((item) => /not subscribed/i.test(String(item || '')));
    const error = new Error(noSubscribers
      ? 'Pa gen okenn aparèy ki abòne ak notifications yo ankò.'
      : `OneSignal failed (${response.status}): ${detail}`);
    error.code = noSubscribers ? 'onesignal_no_subscribers' : 'onesignal_send_failed';
    error.providerStatus = response.status;
    error.providerDetail = detail;
    throw error;
  }
  return { ok: true, id: payload.id || null, recipients: payload.recipients ?? null };
}

async function sendUnlockPush() {
  return sendOneSignalPush({
    title: 'DOBERTO VCF — Fichye a pare',
    message: `Objektif ${MIN_TO_UNLOCK} moun lan rive. Verifye non ak nimewo ou epi telechaje fichye VCF la.`,
    url: '/list.html#download',
    campaignName: `vcf-unlock-${MIN_TO_UNLOCK}`
  });
}

async function runUnlockCampaign(force = false) {
  const { count, error: countError } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true });
  if (countError) throw countError;
  const total = count || 0;
  if (total < MIN_TO_UNLOCK) return { ok: true, skipped: 'locked', total };

  const campaignKey = `vcf_unlock_${MIN_TO_UNLOCK}`;
  let existing = null;
  const existingResult = await supabase
    .from('notification_campaigns')
    .select('campaign_key,status,attempts,updated_at,details')
    .eq('campaign_key', campaignKey)
    .maybeSingle();

  if (existingResult.error) {
    console.warn('[DOBERTO VCF] notification_campaigns unavailable:', existingResult.error.message);
    if (!force && total !== MIN_TO_UNLOCK) return { ok: false, skipped: 'campaign_table_missing' };
    const [email, push] = await Promise.allSettled([sendUnlockEmailCampaign(), sendUnlockPush()]);
    return { ok: true, legacy: true, email, push };
  }
  existing = existingResult.data;

  if (!force && existing && existing.status === 'sent') {
    return { ok: true, skipped: 'already_sent', total };
  }

  const attempts = Number(existing && existing.attempts || 0) + 1;
  const nowIso = new Date().toISOString();
  if (!existing) {
    const claim = await supabase.from('notification_campaigns').insert({
      campaign_key: campaignKey, status: 'sending', attempts, updated_at: nowIso, details: { total }
    });
    if (claim.error) {
      if (!force && String(claim.error.code || '') === '23505') return { ok: true, skipped: 'claimed_by_other_request', total };
      throw claim.error;
    }
  } else {
    const recentSending = existing.status === 'sending' && existing.updated_at && (Date.now() - new Date(existing.updated_at).getTime() < 10 * 60 * 1000);
    if (!force && recentSending) return { ok: true, skipped: 'already_sending', total };
    const mark = await supabase.from('notification_campaigns').update({
      status: 'sending', attempts, updated_at: nowIso, details: { total }
    }).eq('campaign_key', campaignKey);
    if (mark.error) throw mark.error;
  }

  const [emailResult, pushResult] = await Promise.allSettled([
    sendUnlockEmailCampaign(),
    sendUnlockPush()
  ]);

  const emailValue = emailResult.status === 'fulfilled' ? emailResult.value : { ok: false, error: String(emailResult.reason && emailResult.reason.message || emailResult.reason) };
  const pushValue = pushResult.status === 'fulfilled' ? pushResult.value : { ok: false, error: String(pushResult.reason && pushResult.reason.message || pushResult.reason) };

  const configuredCount = Number(emailNotificationsConfigured()) + Number(pushNotificationsConfigured());
  const successCount = Number(emailNotificationsConfigured() && emailValue.ok) + Number(pushNotificationsConfigured() && pushValue.ok);
  const status = configuredCount === 0 ? 'waiting_config' : (successCount === configuredCount ? 'sent' : 'partial');

  await supabase.from('notification_campaigns').upsert({
    campaign_key: campaignKey,
    status,
    attempts,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
    details: { total, email: emailValue, push: pushValue }
  }, { onConflict: 'campaign_key' });

  return { ok: status === 'sent', status, total, email: emailValue, push: pushValue };
}

// ---------- Google account + Google Contacts ----------
app.get('/api/auth/google/url', publicReadLimiter, (req, res) => {
  try {
    if (!requireSecurity(res)) return;
    const flow = req.query.flow === 'contacts' ? 'contacts' : 'login';
    const redirect = String(req.query.redirect || '') === '1';

    if (flow === 'contacts') return verifyUser(req, res, () => {
      const url = googleSync.authUrl('contacts', req.user);
      if (redirect) return res.redirect(302, url);
      res.json({ ok: true, url });
    });

    const url = googleSync.authUrl('login');
    if (redirect) return res.redirect(302, url);
    res.json({ ok: true, url });
  } catch (err) {
    res.status(503).json({ code: err.code || 'google_oauth_error', error: err.message });
  }
});

app.post('/api/auth/google/callback', registerLimiter, requireDatabase, async (req, res) => {
  try {
    if (!requireSecurity(res)) return;
    const { code, state } = req.body || {};
    if (!code || !state) return res.status(400).json({ error: 'Google authorization code/state manke.' });

    let statePayload;
    try {
      const decoded = jwt.decode(String(state || '')) || {};
      statePayload = googleSync.verifyState(state, decoded.flow);
    } catch (_) {
      return res.status(400).json({ code: 'oauth_state_invalid', error: 'Google authorization lan ekspire oswa li pa valid.' });
    }

    if (statePayload.flow === 'contacts') {
      return verifyUser(req, res, async () => {
        try {
          if (statePayload.userId !== req.user.userId) return res.status(403).json({ error: 'Kont Google la pa koresponn ak sesyon sa a.' });
          const tokens = await googleSync.exchangeCode(code);
          await googleSync.saveConnection(req.user.userId, tokens);
          const sync = await googleSync.syncUser(req.user.userId);
          res.json({ ok: true, flow: 'contacts', sync });
        } catch (err) {
          res.status(400).json({ code: err.code || 'google_contacts_error', error: err.message });
        }
      });
    }

    const tokens = await googleSync.exchangeCode(code);
    const profile = await googleSync.getGoogleProfile(tokens.access_token);
    const user = await googleSync.upsertUser(profile);
    const { data: registration, error: registrationError } = await supabase.from('registrations')
      .select('id, name, email, dial_code, country_name, phone, full_number')
      .eq('user_id', user.id).maybeSingle();
    if (registrationError) throw registrationError;
    res.json({
      ok: true,
      flow: 'login',
      token: signUserSession(user),
      user: { id: user.id, email: user.email, name: user.display_name, avatarUrl: user.avatar_url },
      registered: Boolean(registration),
      registration: registration || null
    });
  } catch (err) {
    console.error('[DOBERTO VCF] Google callback:', err);
    res.status(400).json({ code: err.code || 'google_oauth_error', error: 'Koneksyon Google la pa t fini. Eseye ankò.' });
  }
});

app.get('/api/auth/session', publicReadLimiter, requireDatabase, verifyUser, async (req, res) => {
  const { data: user, error: userError } = await supabase.from('app_users')
    .select('id, email, display_name, avatar_url').eq('id', req.user.userId).maybeSingle();
  if (userError || !user) return res.status(401).json({ code: 'session_expired', error: 'Sesyon an pa valid ankò.' });
  const { data: registration, error: registrationError } = await supabase.from('registrations')
    .select('id, name, email, dial_code, country_name, phone, full_number').eq('user_id', user.id).maybeSingle();
  if (registrationError) return res.status(500).json({ error: 'Nou pa ka chaje pwofil la.' });
  res.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.display_name, avatarUrl: user.avatar_url },
    registered: Boolean(registration),
    registration: registration || null
  });
});

app.get('/api/google/status', publicReadLimiter, requireDatabase, verifyUser, async (req, res) => {
  try { res.json({ ok: true, ...(await googleSync.connectionStatus(req.user.userId)) }); }
  catch (err) { res.status(500).json({ error: 'Nou pa ka chaje eta senkronizasyon an.' }); }
});

app.post('/api/google/sync', downloadLimiter, requireDatabase, verifyUser, async (req, res) => {
  try { res.json({ ok: true, sync: await googleSync.syncUser(req.user.userId) }); }
  catch (err) {
    const status = err.code === 'google_contacts_required' ? 409 : 400;
    res.status(status).json({ code: err.code || 'google_sync_error', error: err.message });
  }
});

app.post('/api/google/auto-sync', downloadLimiter, requireDatabase, verifyUser, async (req, res) => {
  const enabled = req.body && req.body.enabled === true;
  const { data, error } = await supabase.from('google_connections')
    .update({ auto_sync: enabled, updated_at: new Date().toISOString() })
    .eq('user_id', req.user.userId).select('user_id').maybeSingle();
  if (error) return res.status(500).json({ error: 'Nou pa ka modifye Auto-Sync la.' });
  if (!data) return res.status(409).json({ code: 'google_contacts_required', error: 'Konekte Google Contacts anvan.' });
  res.json({ ok: true, autoSync: enabled });
});

app.get('/api/cron/google-sync', requireDatabase, async (req, res) => {
  if (!CRON_SECRET || !secureEqual(req.headers.authorization, `Bearer ${CRON_SECRET}`)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try { res.json({ ok: true, results: await googleSync.runAutoSync(5) }); }
  catch (err) { res.status(500).json({ error: 'Auto-Sync cycle failed.' }); }
});

// ---------- POST /api/register ----------
app.post('/api/register', registerLimiter, requireDatabase, verifyUser, async (req, res) => {
  try {
    let { name, email, dialCode, countryName, phone } = req.body || {};
    name = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 100);
    email = String(req.user.email || email || '').trim().slice(0, 254);
    dialCode = onlyDigits(dialCode).slice(0, 5);
    phone = onlyDigits(phone).slice(0, 14);
    countryName = String(countryName || '').trim().slice(0, 120);

    if (!name || name.length < 2) return res.status(400).json({ code: 'name_invalid', error: 'Tanpri antre yon non valid.' });
    if (!dialCode) return res.status(400).json({ code: 'country_required', error: 'Chwazi peyi/kòd peyi a.' });
    if (!phone) return res.status(400).json({ code: 'phone_required', error: 'Tanpri antre nimewo a.' });
    if (email && !validEmail(email)) return res.status(400).json({ code: 'email_invalid', error: 'Email lan pa valid.' });
    if (dialCode === '509' && phone.length !== 8) return res.status(400).json({ code: 'ht_phone_length', error: 'Nimewo Ayisyen an dwe gen egzakteman 8 chif (san 509).' });
    if (dialCode !== '509' && (phone.length < 4 || phone.length > 14)) return res.status(400).json({ code: 'phone_format', error: 'Nimewo a pa gen yon fòma valid.' });

    const fullNumber = dialCode + phone;
    const { data: existing, error: existingError } = await supabase
      .from('registrations').select('id').eq('full_number', fullNumber).maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      const { data: existingFull, error: existingFullError } = await supabase.from('registrations')
        .select('id, user_id, email').eq('id', existing.id).single();
      if (existingFullError) throw existingFullError;
      const canClaim = !existingFull.user_id && (!existingFull.email || existingFull.email.toLowerCase() === email.toLowerCase());
      if (!canClaim && existingFull.user_id !== req.user.userId) {
        return res.status(409).json({ code: 'already_registered', error: 'Nimewo sa a deja sou yon lòt kont.' });
      }
      const { error: claimError } = await supabase.from('registrations').update({
        user_id: req.user.userId, name, email, dial_code: dialCode, country_name: countryName || null, phone, full_number: fullNumber
      }).eq('id', existingFull.id);
      if (claimError) throw claimError;
      return res.json({ ok: true, claimed: true, message: 'Kont Google ou konekte ak ansyen enskripsyon an.' });
    }

    const { data: ownRegistration, error: ownError } = await supabase.from('registrations')
      .select('id').eq('user_id', req.user.userId).maybeSingle();
    if (ownError) throw ownError;
    if (ownRegistration) return res.status(409).json({ code: 'account_registered', error: 'Kont Google sa a deja gen yon nimewo anrejistre.' });

    const { error } = await supabase.from('registrations').insert({
      name,
      email: email || null,
      user_id: req.user.userId,
      dial_code: dialCode,
      country_name: countryName || null,
      phone,
      full_number: fullNumber
    });
    if (error) throw error;

    try {
      await runUnlockCampaign(false);
    } catch (notifyErr) {
      console.error('[DOBERTO VCF] unlock campaign error:', notifyErr);
    }

    res.json({ ok: true, message: 'Enskripsyon ou reyisi!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 'server_error', error: 'Yon erè sèvè rive. Eseye ankò.' });
  }
});

// ---------- GET /api/stats ----------
app.get('/api/stats', publicReadLimiter, requireDatabase, async (req, res) => {
  const [{ count, error }, downloadCount] = await Promise.all([
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    getUniqueDownloadCount()
  ]);
  if (error) return res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
  const total = count || 0;
  res.json({
    total,
    downloadCount,
    minRequired: MIN_TO_UNLOCK,
    maxInFile: MAX_IN_FILE,
    unlocked: total >= MIN_TO_UNLOCK,
    remaining: Math.max(0, MIN_TO_UNLOCK - total),
    namePrefix: NAME_PREFIX,
    emailNotificationsEnabled: emailNotificationsConfigured(),
    pushNotificationsEnabled: pushNotificationsConfigured()
  });
});

// ---------- GET /api/push/config ----------
app.get('/api/push/config', publicReadLimiter, (req, res) => {
  res.json({
    enabled: pushNotificationsConfigured(),
    appId: pushNotificationsConfigured() ? ONESIGNAL_APP_ID : null,
    workerPath: 'OneSignalSDKWorker.js',
    workerScope: '/'
  });
});

// ---------- GET /api/public-list ----------
app.get('/api/public-list', publicReadLimiter, requireDatabase, async (req, res) => {
  const page = Math.max(1, Math.min(100000, parseInt(req.query.page || '1', 10)));
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = String(req.query.search || '').trim().slice(0, 80);
  const country = String(req.query.country || '').trim().slice(0, 120);

  let q = supabase
    .from('registrations')
    .select('name, country_name, icon, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (search) q = q.ilike('name', `%${search.replace(/[%_]/g, '')}%`);
  if (country) q = q.eq('country_name', country);

  const { data, error, count } = await q.range(from, to);
  if (error) return res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
  const list = (data || []).map((r) => ({ ...r, display_name: withPrefix(r.name) }));
  res.json({ page, pageSize, total: count || 0, list, namePrefix: NAME_PREFIX, filters: { search, country } });
});

// ---------- POST /api/verify-download ----------
app.post('/api/verify-download', downloadLimiter, requireDatabase, async (req, res) => {
  try {
    if (!requireSecurity(res)) return;
    let { name, dialCode, phone } = req.body || {};
    name = String(name || '').trim().slice(0, 120);
    dialCode = onlyDigits(dialCode).slice(0, 5);
    phone = onlyDigits(phone).slice(0, 14);
    const fullNumber = dialCode + phone;

    const { count, error: countError } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
    if (countError) throw countError;
    if ((count || 0) < MIN_TO_UNLOCK) {
      return res.status(403).json({
        code: 'download_locked',
        vars: { min: MIN_TO_UNLOCK, count: count || 0 },
        error: `Download lan bloke toujou. Fòk gen omwen ${MIN_TO_UNLOCK} moun enskri (${count || 0}/${MIN_TO_UNLOCK} kounye a).`
      });
    }

    const { data: match, error: matchError } = await supabase
      .from('registrations').select('id, name').eq('full_number', fullNumber).maybeSingle();
    if (matchError) throw matchError;

    const requestedName = normalizeName(name);
    const registeredName = match ? normalizeName(match.name) : '';
    if (!match || !requestedName || requestedName !== registeredName) {
      return res.status(403).json({
        code: 'no_match',
        error: 'Nou pa jwenn okenn moun ki enskri ak non ak nimewo sa yo. Verifye non ak nimewo ou te itilize lè ou te enskri a.'
      });
    }

    const dlToken = jwt.sign({ purpose: 'download', registrationId: match.id }, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '5m',
      issuer: 'doberto-vcf',
      audience: 'doberto-vcf-download'
    });
    res.json({ ok: true, downloadToken: dlToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
  }
});

// ---------- GET /api/download-vcf ----------
app.get('/api/download-vcf', downloadLimiter, requireDatabase, async (req, res) => {
  try {
    if (!requireSecurity(res)) return;
    const token = String(req.query.token || '');
    if (!token) return res.status(401).json({ code: 'missing_token', error: 'Manke token download.' });

    let downloadPayload;
    try {
      downloadPayload = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'], issuer: 'doberto-vcf', audience: 'doberto-vcf-download'
      });
      if (downloadPayload.purpose !== 'download') throw new Error('bad token');
    } catch (_) {
      return res.status(401).json({ code: 'invalid_token', error: 'Token download lan pa valid oswa li ekspire.' });
    }

    const { count, error: countError } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
    if (countError) throw countError;
    if ((count || 0) < MIN_TO_UNLOCK) return res.status(403).json({ code: 'download_locked', vars: { min: MIN_TO_UNLOCK, count: count || 0 }, error: 'Download lan bloke toujou.' });

    const { data, error } = await supabase.from('registrations')
      .select('name, full_number').order('created_at', { ascending: true }).limit(MAX_IN_FILE);
    if (error) throw error;

    const vcf = (data || []).map((row) => [
      'BEGIN:VCARD', 'VERSION:3.0', `FN:${withPrefix(row.name)}`, `TEL;TYPE=CELL:+${row.full_number}`, 'END:VCARD', ''
    ].join('\r\n')).join('');

    await recordVcfDownload(downloadPayload.registrationId);

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="DOBERTO-VCF.vcf"');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(vcf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
  }
});

app.get('/api/ads/public', publicReadLimiter, (req,res) => {
  res.setHeader('Cache-Control','public, max-age=20, stale-while-revalidate=40');
  res.json({ok:true,ads:readAdSettings()});
});

// ---------- Admin ----------
app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  if (!requireSecurity(res)) return;
  const password = String(req.body && req.body.password || '');
  if (!password || !secureEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ code: 'admin_password_incorrect', error: 'Modpas admin lan pa kòrèk.' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, {
    algorithm: 'HS256', expiresIn: '12h', issuer: 'doberto-vcf', audience: 'doberto-vcf-admin'
  });
  res.json({ ok: true, token });
});

app.get('/api/admin/ads', adminActionLimiter, verifyAdmin, (req,res) => {
  res.setHeader('Cache-Control','private, no-store');
  res.json({ok:true,ads:readAdSettings()});
});

app.put('/api/admin/ads', adminActionLimiter, verifyAdmin, (req,res) => {
  try {
    const ads=writeAdSettings(req.body||{});
    res.setHeader('Cache-Control','private, no-store');
    res.json({ok:true,ads});
  } catch (err) {
    console.error('[DOBERTO VCF] ad settings write error:',err);
    res.status(500).json({error:'Nou pa ka sove konfigirasyon pub la.'});
  }
});

app.get('/api/admin/stats', adminActionLimiter, verifyAdmin, requireDatabase, async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [allResult, dayResult, downloadCount] = await Promise.all([
      supabase.from('registrations').select('*', { count: 'exact', head: true }),
      supabase.from('registrations').select('*', { count: 'exact', head: true }).gte('created_at', since),
      getUniqueDownloadCount()
    ]);
    if (allResult.error || dayResult.error) return res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
    const total = allResult.count || 0;
    res.json({
      total,
      today: dayResult.count || 0,
      downloadCount,
      remaining: Math.max(0, MIN_TO_UNLOCK - total),
      unlocked: total >= MIN_TO_UNLOCK,
      minRequired: MIN_TO_UNLOCK,
      progress: Math.min(100, Math.round((total / MIN_TO_UNLOCK) * 100)),
      emailNotificationsEnabled: emailNotificationsConfigured(),
      pushNotificationsEnabled: pushNotificationsConfigured()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
  }
});

app.get('/api/admin/list', adminActionLimiter, verifyAdmin, requireDatabase, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const pageSize = 100;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = String(req.query.search || '').trim().slice(0, 80).replace(/[%_]/g, '');

  let q = supabase.from('registrations')
    .select('id, name, email, dial_code, phone, country_name, full_number, icon, created_at', { count: 'exact' })
    .order('created_at', { ascending: false }).range(from, to);
  if (search) q = q.ilike('name', `%${search}%`);
  const { data, error, count } = await q;
  if (error) return res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
  res.json({ page, pageSize, total: count || 0, list: (data || []).map((r) => ({ ...r, display_name: withPrefix(r.name) })), namePrefix: NAME_PREFIX });
});

app.put('/api/admin/update/:id', adminActionLimiter, verifyAdmin, requireDatabase, async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: 'ID lan pa valid.' });
    let { name, dialCode, phone, icon } = req.body || {};
    name = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 100);
    dialCode = onlyDigits(dialCode).slice(0, 5);
    phone = onlyDigits(phone).slice(0, 14);
    icon = String(icon || '').trim();

    if (!name || name.length < 2) return res.status(400).json({ code: 'name_invalid', error: 'Tanpri antre yon non valid.' });
    if (!dialCode || !phone) return res.status(400).json({ error: 'Kòd peyi ak nimewo obligatwa.' });
    if (dialCode === '509' && phone.length !== 8) return res.status(400).json({ code: 'ht_phone_length', error: 'Nimewo Ayisyen an dwe gen egzakteman 8 chif (san 509).' });
    if (dialCode !== '509' && (phone.length < 4 || phone.length > 14)) return res.status(400).json({ code: 'phone_format', error: 'Nimewo a pa gen yon fòma valid.' });
    if (!ALLOWED_ICONS.includes(icon)) icon = '';

    const fullNumber = dialCode + phone;
    const { data: dupe, error: dupeError } = await supabase.from('registrations')
      .select('id').eq('full_number', fullNumber).neq('id', id).maybeSingle();
    if (dupeError) throw dupeError;
    if (dupe) return res.status(409).json({ code: 'duplicate_number', error: 'Yon lòt moun deja gen nimewo sa a.' });

    const { data, error } = await supabase.from('registrations').update({
      name, dial_code: dialCode, phone, full_number: fullNumber, icon: icon || null
    }).eq('id', id).select('id, name, email, dial_code, phone, country_name, full_number, icon, created_at').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ code: 'not_found', error: 'Nou pa jwenn moun sa a.' });
    res.json({ ok: true, row: { ...data, display_name: withPrefix(data.name) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
  }
});

app.delete('/api/admin/delete/:id', adminActionLimiter, verifyAdmin, requireDatabase, async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: 'ID lan pa valid.' });
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
  }
});

app.get('/api/admin/export-csv', adminActionLimiter, verifyAdmin, requireDatabase, async (req, res) => {
  const { data, error } = await supabase.from('registrations')
    .select('name, email, country_name, full_number, icon, created_at')
    .order('created_at', { ascending: true }).limit(MAX_IN_FILE);
  if (error) return res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });

  const cleanCsv = (value) => `"${String(value || '').replace(/"/g, '""').replace(/^[=+\-@]/, (m) => "'" + m)}"`;
  let csv = 'Non,Non ak Prefiks,Email,Peyi,Nimewo,Ikòn,Dat\n';
  for (const r of data || []) {
    csv += [r.name, withPrefix(r.name), r.email || '', r.country_name || '', `+${r.full_number}`, r.icon || '', r.created_at].map(cleanCsv).join(',') + '\n';
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="doberto-vcf-admin-export.csv"');
  res.send('\ufeff' + csv);
});

app.get('/api/admin/download-vcf', adminActionLimiter, verifyAdmin, requireDatabase, async (req, res) => {
  try {
    const { data, error } = await supabase.from('registrations')
      .select('name, full_number')
      .order('created_at', { ascending: true })
      .limit(MAX_IN_FILE);
    if (error) throw error;

    const rows = data || [];
    if (!rows.length) {
      return res.status(404).json({ code: 'no_contacts', error: 'Pa gen okenn kontak pou mete nan fichye VCF la.' });
    }

    const escapeVcard = (value) => String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');

    const vcf = rows.map((row) => [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${escapeVcard(withPrefix(row.name))}`,
      `TEL;TYPE=CELL:+${onlyDigits(row.full_number)}`,
      'END:VCARD',
      ''
    ].join('\r\n')).join('');

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="DOBERTO-VCF-${stamp}.vcf"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Doberto-Contacts', String(rows.length));
    res.send(vcf);
  } catch (err) {
    console.error('[DOBERTO VCF] admin VCF export failed:', err);
    res.status(500).json({ code: 'server_error', error: 'Nou pa ka kreye fichye VCF la kounye a.' });
  }
});

app.post('/api/admin/push-send', pushSendLimiter, verifyAdmin, async (req, res) => {
  try {
    if (!pushNotificationsConfigured()) {
      return res.status(503).json({ code: 'onesignal_not_configured', error: 'OneSignal poko configure sou VPS la. Mete ONESIGNAL_APP_ID ak ONESIGNAL_REST_API_KEY nan environment DOBERTO VCF la.' });
    }
    const title = String(req.body && req.body.title || 'DOBERTO VCF').trim().slice(0, 80);
    const message = String(req.body && req.body.message || '').trim().slice(0, 220);
    const url = String(req.body && req.body.url || '/').trim().slice(0, 300);
    if (!message || message.length < 3) return res.status(400).json({ error: 'Ekri yon mesaj pou notifikasyon an.' });
    const result = await sendOneSignalPush({ title, message, url, campaignName: `admin-${Date.now()}` });
    res.json({ ok: true, result });
  } catch (err) {
    console.error('[DOBERTO VCF] OneSignal send failed:', err);
    const noSubscribers = err && err.code === 'onesignal_no_subscribers';
    res.status(noSubscribers ? 409 : 502).json({
      code: noSubscribers ? 'onesignal_no_subscribers' : 'onesignal_send_failed',
      error: noSubscribers
        ? 'Pa gen okenn aparèy ki abòne ak notifications DOBERTO VCF yo ankò.'
        : 'OneSignal pa t aksepte notifikasyon an.',
      providerStatus: Number(err && err.providerStatus || 0) || null,
      providerDetail: String(err && err.providerDetail || err && err.message || '').slice(0, 500)
    });
  }
});

app.post('/api/admin/unlock-campaign/retry', pushSendLimiter, verifyAdmin, requireDatabase, async (req, res) => {
  try {
    const result = await runUnlockCampaign(true);
    res.json({ ok: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kanpay unlock la pa t fini. Verifye Resend/OneSignal ak schema Supabase la.' });
  }
});

// ---------- VPS compatibility routes for former Vercel rewrites ----------
app.get('/api/settings/public', (req, res) => publicSettingsHandler(req, res));
app.all('/api/group-migration', (req, res) => groupMigrationHandler(req, res));
app.post('/api/community/announce', (req, res) => communityAnnounceHandler(req, res));
app.all('/api/admin/community/settings', (req, res) => adminCommunitySettingsHandler(req, res));
app.all('/api/admin/group-migration', (req, res) => adminGroupMigrationHandler(req, res));
app.get('/api/admin/system/health', (req, res) => adminSystemHealthHandler(req, res));

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    ok: true,
    service: 'DOBERTO VCF',
    databaseConfigured,
    securityConfigured,
    googleConfigured: Boolean(googleSync && googleSync.configured),
    emailConfigured: emailNotificationsConfigured(),
    pushConfigured: pushNotificationsConfigured(),
    uptimeSeconds: Math.round(process.uptime())
  });
});

// ---------- 404 API ----------
app.use('/api', (req, res) => res.status(404).json({ error: 'API route sa a pa egziste.' }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`DOBERTO VCF ap kouri sou pò ${PORT}`));
}

module.exports = app;
