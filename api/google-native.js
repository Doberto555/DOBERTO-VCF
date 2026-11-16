'use strict';
require('../lib/runtime-secrets');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { createGoogleSync } = require('../lib/google-sync');
const { noStore } = require('../lib/security');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim();
const SITE_URL = String(process.env.SITE_URL || 'https://dobertovcf.online').replace(/\/$/, '');
const WEB_CLIENT_ID = String(process.env.GOOGLE_CLIENT_ID || '').trim();

// Menm paramèt egzat ak api/google-callback.js, pou verifyUser aksepte token an.
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

async function verifyIdToken(idToken) {
  const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken));
  const d = await r.json().catch(() => ({}));
  const okIss = d.iss === 'accounts.google.com' || d.iss === 'https://accounts.google.com';
  if (!r.ok || !okIss || d.aud !== WEB_CLIENT_ID || !d.sub || !d.email || String(d.email_verified) !== 'true') {
    throw Object.assign(new Error('invalid google id token'), { code: 'google_token_invalid' });
  }
  const email = String(d.email).trim().toLowerCase();
  return { googleSub: d.sub, email, name: d.name || email.split('@')[0], avatarUrl: d.picture || null };
}

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPABASE_URL || !SERVICE_KEY || JWT_SECRET.length < 32 || !WEB_CLIENT_ID) {
    return res.status(503).json({ error: 'Google Sign-In poko configure.' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const idToken = String(body.idToken || '').trim();
  if (!idToken || idToken.length > 4096) {
    return res.status(400).json({ code: 'google_token_invalid', error: 'Google token lan pa valid.' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const google = createGoogleSync({ supabase, siteUrl: SITE_URL, jwtSecret: JWT_SECRET });

  try {
    const profile = await verifyIdToken(idToken);
    const user = await google.upsertUser(profile);
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('id,name,email,dial_code,country_name,phone,full_number')
      .eq('user_id', user.id)
      .maybeSingle();
    if (registrationError) throw registrationError;
    return res.status(200).json({
      ok: true,
      flow: 'login',
      token: signUserSession(user),
      user: { id: user.id, email: user.email, name: user.display_name, avatarUrl: user.avatar_url },
      registered: Boolean(registration),
      registration: registration || null
    });
  } catch (error) {
    console.error('[DOBERTO VCF] google native error:', error?.code || '', error?.message || error);
    const code = error?.code === 'google_token_invalid' ? 'google_token_invalid' : 'google_oauth_error';
    return res.status(400).json({ code, error: 'Koneksyon Google la pa t fini. Eseye ankò.' });
  }
};
