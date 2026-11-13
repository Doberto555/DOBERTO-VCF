require('../lib/runtime-secrets');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { createGoogleSync } = require('../lib/google-sync');
const { cookie, secureEqual, setCookie, noStore } = require('../lib/security');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim();
const SITE_URL = String(process.env.SITE_URL || 'https://dobertovcf.online').replace(/\/$/, '');

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

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPABASE_URL || !SERVICE_KEY || JWT_SECRET.length < 32) {
    return res.status(503).json({ error: 'Google Sign-In poko configure.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const code = String(body.code || '').trim();
  const state = String(body.state || '').trim();
  if (!code || !state || code.length > 4096 || state.length > 4096) {
    setCookie(req, res, 'dv_oauth_nonce', '', { maxAge: 0, path: '/api/auth/google/callback' });
    return res.status(400).json({ code: 'oauth_request_invalid', error: 'Google authorization lan pa valid.' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const google = createGoogleSync({ supabase, siteUrl: SITE_URL, jwtSecret: JWT_SECRET });

  try {
    const statePayload = google.verifyState(state);
    const browserNonce = cookie(req, 'dv_oauth_nonce');
    if (!browserNonce || !statePayload?.nonce || !secureEqual(browserNonce, statePayload.nonce)) {
      throw Object.assign(new Error('OAuth browser binding failed'), { code: 'oauth_state_invalid' });
    }

    const tokens = await google.exchangeCode(code);
    const profile = await google.getGoogleProfile(tokens.access_token);
    const user = await google.upsertUser(profile);
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('id,name,email,dial_code,country_name,phone,full_number')
      .eq('user_id', user.id)
      .maybeSingle();
    if (registrationError) throw registrationError;

    setCookie(req, res, 'dv_oauth_nonce', '', { maxAge: 0, path: '/api/auth/google/callback' });
    return res.status(200).json({
      ok: true,
      flow: 'login',
      token: signUserSession(user),
      user: { id: user.id, email: user.email, name: user.display_name, avatarUrl: user.avatar_url },
      registered: Boolean(registration),
      registration: registration || null
    });
  } catch (error) {
    console.error('[DOBERTO VCF] google callback error:', error?.code || '', error?.message || error);
    setCookie(req, res, 'dv_oauth_nonce', '', { maxAge: 0, path: '/api/auth/google/callback' });
    const codeValue = error?.code === 'oauth_state_invalid' ? 'oauth_state_invalid' : 'google_oauth_error';
    return res.status(400).json({ code: codeValue, error: 'Koneksyon Google la pa t fini. Eseye ankò.' });
  }
};
