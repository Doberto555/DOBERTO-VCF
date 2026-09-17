const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

function onlyHttpUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1'
      ? url.toString()
      : '';
  } catch (_) {
    return '';
  }
}

function createGoogleSync({ supabase, siteUrl, jwtSecret }) {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const redirectUri = onlyHttpUrl(process.env.GOOGLE_REDIRECT_URI) || `${siteUrl}/register.html`;
  const configured = Boolean(clientId && clientSecret);

  function assertConfigured() {
    if (!configured) {
      const error = new Error('Google OAuth poko configure sou sèvè a.');
      error.code = 'google_not_configured';
      throw error;
    }
  }

  function featureRemoved() {
    const error = new Error('Google Contacts pa fè pati DOBERTO VCF ankò. Google sèvi sèlman pou koneksyon ak enskripsyon.');
    error.code = 'google_contacts_removed';
    throw error;
  }

  function createState() {
    return require('jsonwebtoken').sign({
      purpose: 'google_oauth',
      flow: 'login',
      nonce: require('crypto').randomBytes(18).toString('base64url')
    }, jwtSecret, {
      algorithm: 'HS256', expiresIn: '10m', issuer: 'doberto-vcf', audience: 'doberto-vcf-google'
    });
  }

  function verifyState(state) {
    const payload = require('jsonwebtoken').verify(String(state || ''), jwtSecret, {
      algorithms: ['HS256'], issuer: 'doberto-vcf', audience: 'doberto-vcf-google'
    });
    if (payload.purpose !== 'google_oauth' || payload.flow !== 'login') throw new Error('Google OAuth state invalid');
    return payload;
  }

  function authUrl(flow = 'login') {
    assertConfigured();
    if (flow !== 'login') return featureRemoved();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      include_granted_scopes: 'false',
      prompt: 'select_account',
      state: createState()
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async function exchangeCode(code) {
    assertConfigured();
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code || ''),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) throw new Error(data.error_description || 'Google authorization failed');
    return data;
  }

  async function getGoogleProfile(accessToken) {
    const response = await fetch(GOOGLE_USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.sub || !data.email || data.email_verified !== true) throw new Error('Google profile unavailable');
    const email = String(data.email).trim().toLowerCase();
    return {
      googleSub: data.sub,
      email,
      name: data.name || email.split('@')[0],
      avatarUrl: data.picture || null
    };
  }

  async function upsertUser(profile) {
    const { data, error } = await supabase.from('app_users').upsert({
      google_sub: profile.googleSub,
      email: profile.email,
      display_name: profile.name,
      avatar_url: profile.avatarUrl,
      last_login_at: new Date().toISOString()
    }, { onConflict: 'google_sub' }).select('id, google_sub, email, display_name, avatar_url').single();
    if (error) throw error;
    return data;
  }

  // Compatibility stubs: these intentionally do not request or use Google Contacts.
  async function saveConnection() { return featureRemoved(); }
  async function syncUser() { return featureRemoved(); }
  async function runAutoSync() { return []; }
  async function syncActiveVipUsers() { return []; }
  async function connectionStatus() {
    return { connected: false, autoSync: false, featureRemoved: true };
  }
  async function userPlan(userId) {
    const { data, error } = await supabase.from('app_users').select('plan,vip_plan_code,vip_started_at,vip_expires_at').eq('id', userId).maybeSingle();
    if (error) throw error;
    return {
      plan: data?.plan === 'vip' ? 'vip' : 'free',
      isVip: data?.plan === 'vip',
      planCode: data?.vip_plan_code || null,
      vipExpiresAt: data?.vip_expires_at || null
    };
  }

  return {
    configured,
    redirectUri,
    authUrl,
    verifyState,
    exchangeCode,
    getGoogleProfile,
    upsertUser,
    saveConnection,
    connectionStatus,
    syncUser,
    runAutoSync,
    syncActiveVipUsers,
    userPlan
  };
}

module.exports = { createGoogleSync };
