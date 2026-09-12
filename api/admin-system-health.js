require('../lib/runtime-secrets');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim();

function bearer(req) {
  const value = String(req.headers.authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

function verifyAdmin(req) {
  try {
    return jwt.verify(bearer(req), JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'doberto-vcf',
      audience: 'doberto-vcf-admin'
    });
  } catch (_) {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Sesyon admin lan pa valid.' });

  const checkedAt = new Date().toISOString();
  const moncashMode = String(process.env.MONCASH_MODE || 'sandbox').toLowerCase() === 'live' ? 'live' : 'sandbox';

  const services = {
    database: { status: 'checking' },
    moncash: {
      status: process.env.MONCASH_CLIENT_ID && process.env.MONCASH_CLIENT_SECRET ? 'configured' : 'missing',
      mode: moncashMode
    },
    push: {
      status: process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY ? 'configured' : 'missing'
    },
    email: {
      status: process.env.RESEND_API_KEY && process.env.RESEND_FROM ? 'configured' : 'missing'
    },
    google: {
      status: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI ? 'configured' : 'missing'
    }
  };

  if (!SUPABASE_URL || !SERVICE_KEY) {
    services.database = { status: 'missing' };
  } else {
    try {
      const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { error } = await supabase.from('registrations').select('id', { count: 'exact', head: true });
      services.database = { status: error ? 'error' : 'operational' };
      if (error) services.database.code = String(error.code || 'database_error');
    } catch (_) {
      services.database = { status: 'error' };
    }
  }

  const criticalReady = services.database.status === 'operational';
  return res.status(200).json({
    ok: true,
    status: criticalReady ? 'operational' : 'degraded',
    checkedAt,
    siteUrl: String(process.env.SITE_URL || 'https://dobertovcf.online'),
    services
  });
};
