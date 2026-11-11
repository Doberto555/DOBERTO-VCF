require('dotenv').config({ override: true });
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const adminSystemHealthHandler = require('./api/admin-system-health');
const googleLoginUrlHandler = require('./api/google-login-url');
const googleCallbackHandler = require('./api/google-callback');
const registerSecureHandler = require('./api/register-secure');
const adminLoginSecureHandler = require('./api/admin-login-secure');
const { createShizzyConnect, toPartnerContact, ShizzyError, pickConsentUrl, describeShape } = require('./lib/shizzy-connect');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// ---------- Konfigirasyon ----------
const PORT = parseInt(process.env.PORT || '3000', 10);
const SITE_URL = String(process.env.SITE_URL || 'https://doberto-vcf-509.vercel.app').replace(/\/$/, '');
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '').trim();
const DEFAULT_MIN_TO_UNLOCK = 200;
const MAX_IN_FILE = Math.max(DEFAULT_MIN_TO_UNLOCK, parseInt(process.env.MAX_IN_FILE || '50000', 10));
const NAME_PREFIX = String(process.env.NAME_PREFIX || 'D.M.L').trim();
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const RESEND_FROM = String(process.env.RESEND_FROM || '').trim();
const ONESIGNAL_APP_ID = String(process.env.ONESIGNAL_APP_ID || '').trim();
const ONESIGNAL_REST_API_KEY = String(process.env.ONESIGNAL_REST_API_KEY || '').trim();
const CRON_SECRET = String(process.env.CRON_SECRET || '').trim();
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
const adminLoginLimiter = rateLimit({ ...limiterDefaults, windowMs: 15 * 60 * 1000, limit: 8 });
const adminActionLimiter = rateLimit({ ...limiterDefaults, windowMs: 60 * 60 * 1000, limit: 120 });
const pushSendLimiter = rateLimit({ ...limiterDefaults, windowMs: 60 * 60 * 1000, limit: 12 });
const publicReadLimiter = rateLimit({ ...limiterDefaults, windowMs: 60 * 1000, limit: 300 });
const shizzyActionLimiter = rateLimit({ ...limiterDefaults, windowMs: 60 * 60 * 1000, limit: 12 });

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
    if (req.admin?.role !== 'admin' || req.admin?.purpose !== 'admin_session') {
      throw new Error('invalid admin session');
    }
    next();
  } catch (_) {
    return res.status(401).json({ error: 'Sesyon admin ekspire, konekte ankò.' });
  }
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

function optionalUserSession(req) {
  if (!securityConfigured) return null;
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'], issuer: 'doberto-vcf', audience: 'doberto-vcf-user'
    });
    if (payload.purpose !== 'user_session' || !payload.userId) return null;
    return payload;
  } catch (_) {
    return null;
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

// ---------- Google Sign-In only ----------
app.get('/api/auth/google/url', publicReadLimiter, (req, res) => googleLoginUrlHandler(req, res));
app.post('/api/auth/google/callback', registerLimiter, requireDatabase, (req, res) => googleCallbackHandler(req, res));

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

function removedGoogleContacts(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    code: 'feature_removed',
    error: 'Google Contacts te retire. Google sèvi sèlman pou koneksyon ak enskripsyon.'
  });
}

app.all('/api/google/status', removedGoogleContacts);
app.all('/api/google/sync', removedGoogleContacts);
app.all('/api/google/auto-sync', removedGoogleContacts);
app.all('/api/cron/google-sync', removedGoogleContacts);

// ---------- Shizzy Connect: sync kontak nan Google Contacts via Partner API ----------
// Shizzy jere OAuth Google a (DOBERTO VCF pa mande okenn scope Contacts). Kle API a rete sèvè-sèlman.
const shizzy = createShizzyConnect();
const SHIZZY_BATCH_SIZE = Math.max(1, Math.min(MAX_IN_FILE, parseInt(process.env.SHIZZY_BATCH_SIZE || '5000', 10) || 5000));
const SHIZZY_JOB_ID_RE = /^[0-9A-Za-z-]{8,64}$/;

function sendShizzyError(res, err) {
  if (err instanceof ShizzyError) return res.status(err.status).json({ code: err.code, error: err.message });
  console.error('[DOBERTO VCF] shizzy route error:', err);
  return res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
}

function requireShizzy(req, res, next) {
  if (!shizzy.configured) {
    return res.status(503).json({ code: 'shizzy_not_configured', error: 'Sync Google Contacts poko disponib.' });
  }
  next();
}

async function fetchRegistrationsForSync(limit) {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; rows.length < limit; from += pageSize) {
    const take = Math.min(pageSize, limit - rows.length);
    const { data, error } = await supabase.from('registrations')
      .select('id, name, dial_code, phone, user_id')
      .order('created_at', { ascending: true }).order('id', { ascending: true })
      .range(from, from + take - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < take) break;
  }
  return rows;
}

app.get('/api/shizzy/status', publicReadLimiter,
  (req, res, next) => (shizzy.configured ? next() : res.json({ ok: true, configured: false })),
  verifyUser,
  async (req, res) => {
    try {
      const connection = await shizzy.getConnection(req.user.userId);
      res.json({ ok: true, configured: true, connection });
    } catch (err) {
      if (err instanceof ShizzyError && err.status === 404) {
        return res.json({ ok: true, configured: true, connection: null });
      }
      sendShizzyError(res, err);
    }
  });

app.post('/api/shizzy/connect', shizzyActionLimiter, verifyUser, requireShizzy, async (req, res) => {
  try {
    const data = await shizzy.createConnection(req.user.userId);
    const url = pickConsentUrl(data, shizzy.baseUrl);
    if (!url) {
      // Sèlman non chan yo ak tip yo (pa valè), pou n konnen kijan Shizzy fòmate repons lan.
      console.error('[DOBERTO VCF] Shizzy POST /connections: pa gen URL konsantman nan repons lan. Fòm repons:', JSON.stringify(describeShape(data)));
      return res.status(502).json({ code: 'shizzy_bad_response', error: 'Shizzy Connect pa voye lyen konsantman an.' });
    }
    res.json({ ok: true, url });
  } catch (err) {
    sendShizzyError(res, err);
  }
});

app.post('/api/shizzy/sync', shizzyActionLimiter, verifyUser, requireDatabase, requireShizzy, async (req, res) => {
  try {
    const userId = req.user.userId;
    const mine = await supabase.from('registrations').select('id').eq('user_id', userId).maybeSingle();
    if (mine.error) throw mine.error;

    // Sèl kondisyon: itilizatè a dwe enskri.
    if (!mine.data) {
      return res.status(403).json({ code: 'not_registered', error: 'Ou dwe enskri anvan ou sinkronize kontak yo.' });
    }

    const rows = await fetchRegistrationsForSync(SHIZZY_BATCH_SIZE);
    const contacts = rows
      .filter((row) => row.user_id !== userId)
      .map((row) => toPartnerContact(row, NAME_PREFIX))
      .filter(Boolean);
    if (!contacts.length) {
      return res.status(422).json({ code: 'no_contacts', error: 'Pa gen kontak valid pou sinkronize.' });
    }

    const job = await shizzy.putContacts(userId, contacts, 'replace');
    res.status(202).json({
      ok: true,
      jobId: job && job.jobId || null,
      status: job && job.status || 'queued',
      sent: contacts.length
    });
  } catch (err) {
    sendShizzyError(res, err);
  }
});

app.get('/api/shizzy/jobs/:jobId', publicReadLimiter, verifyUser, requireShizzy, async (req, res) => {
  const jobId = String(req.params.jobId || '');
  if (!SHIZZY_JOB_ID_RE.test(jobId)) return res.status(400).json({ code: 'invalid_job', error: 'Job ID pa valid.' });
  try {
    const job = await shizzy.getJob(jobId);
    // Yon itilizatè pa ka swiv job yon lòt moun.
    if (!job || String(job.externalUserId || '') !== String(req.user.userId)) {
      return res.status(404).json({ code: 'job_not_found', error: 'Job la pa egziste.' });
    }
    res.json({
      ok: true,
      job: {
        jobId: job.jobId,
        status: job.status,
        mode: job.mode || null,
        stats: job.stats || null,
        error: job.error ? String(job.error).slice(0, 200) : null
      }
    });
  } catch (err) {
    sendShizzyError(res, err);
  }
});

app.delete('/api/shizzy/connection', shizzyActionLimiter, verifyUser, requireShizzy, async (req, res) => {
  try {
    const data = await shizzy.deleteConnection(req.user.userId);
    res.json({ ok: true, jobId: data && data.jobId || null });
  } catch (err) {
    if (err instanceof ShizzyError && err.status === 404) return res.json({ ok: true, jobId: null });
    sendShizzyError(res, err);
  }
});

// ---------- POST /api/register ----------
app.post('/api/register', registerLimiter, requireDatabase, (req, res) => registerSecureHandler(req, res));

// ---------- GET /api/stats ----------
app.get('/api/stats', publicReadLimiter, requireDatabase, async (req, res) => {
  const { count, error } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
  if (error) return res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
  res.json({
    total: count || 0,
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

app.get('/api/ads/public', publicReadLimiter, (req,res) => {
  res.setHeader('Cache-Control','public, max-age=20, stale-while-revalidate=40');
  res.json({ok:true,ads:readAdSettings()});
});

// ---------- Admin ----------
app.post('/api/admin/login', adminLoginLimiter, (req, res) => adminLoginSecureHandler(req, res));

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
    const [allResult, dayResult] = await Promise.all([
      supabase.from('registrations').select('*', { count: 'exact', head: true }),
      supabase.from('registrations').select('*', { count: 'exact', head: true }).gte('created_at', since)
    ]);
    if (allResult.error || dayResult.error) return res.status(500).json({ code: 'server_error', error: 'Erè sèvè.' });
    res.json({
      total: allResult.count || 0,
      today: dayResult.count || 0,
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

// ---------- Admin system health ----------
app.get('/api/admin/system/health', (req, res) => adminSystemHealthHandler(req, res));

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    ok: true,
    service: 'DOBERTO VCF',
    databaseConfigured,
    securityConfigured,
    googleConfigured: Boolean(String(process.env.GOOGLE_CLIENT_ID || '').trim() && String(process.env.GOOGLE_CLIENT_SECRET || '').trim()),
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
