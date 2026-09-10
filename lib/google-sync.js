const crypto = require('crypto');

const GOOGLE_CONTACTS_SCOPE = 'https://www.googleapis.com/auth/contacts';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const GOOGLE_CREATE_CONTACT_URL = 'https://people.googleapis.com/v1/people:createContact?personFields=names,phoneNumbers,userDefined';
const GOOGLE_SYNC_BATCH_SIZE = 50;

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function googleErrorMessage(result, status) {
  const error = result && result.error;
  const message = error && error.message;
  const statusName = error && error.status;
  return [message || 'Google Contacts sync failed', statusName, status ? `HTTP ${status}` : '']
    .filter(Boolean)
    .join(' · ');
}

function createGoogleSync({ supabase, siteUrl, jwtSecret, serviceRoleKey, namePrefix = 'D.M.L' }) {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const redirectUri = onlyHttpUrl(process.env.GOOGLE_REDIRECT_URI) || `${siteUrl}/register.html`;
  const configured = Boolean(clientId && clientSecret);
  const rawEncryptionKey = String(process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || `${jwtSecret}:${serviceRoleKey}`).trim();
  const encryptionKey = crypto.createHash('sha256').update(rawEncryptionKey).digest();

  function encrypt(value) {
    if (!value) return null;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
  }

  function decrypt(value) {
    if (!value) return '';
    const [iv, tag, encrypted] = String(value).split('.').map((part) => Buffer.from(part, 'base64url'));
    if (!iv || !tag || !encrypted) throw new Error('Stored Google token is invalid');
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }

  function assertConfigured() {
    if (!configured) {
      const error = new Error('Google OAuth poko configure sou sèvè a.');
      error.code = 'google_not_configured';
      throw error;
    }
  }

  function createState(flow, userId) {
    const payload = { purpose: 'google_oauth', flow, nonce: crypto.randomBytes(18).toString('base64url') };
    if (userId) payload.userId = userId;
    return require('jsonwebtoken').sign(payload, jwtSecret, {
      algorithm: 'HS256', expiresIn: '10m', issuer: 'doberto-vcf', audience: 'doberto-vcf-google'
    });
  }

  function verifyState(state, expectedFlow) {
    const payload = require('jsonwebtoken').verify(String(state || ''), jwtSecret, {
      algorithms: ['HS256'], issuer: 'doberto-vcf', audience: 'doberto-vcf-google'
    });
    if (payload.purpose !== 'google_oauth' || payload.flow !== expectedFlow) throw new Error('Google OAuth state invalid');
    return payload;
  }

  function authUrl(flow, user) {
    assertConfigured();
    const isContacts = flow === 'contacts';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: isContacts ? GOOGLE_CONTACTS_SCOPE : 'openid email profile',
      include_granted_scopes: 'true',
      state: createState(flow, user && user.userId)
    });
    if (isContacts) {
      params.set('access_type', 'offline');
      params.set('prompt', 'consent');
      if (user && user.email) params.set('login_hint', user.email);
    } else {
      params.set('prompt', 'select_account');
    }
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async function exchangeCode(code) {
    assertConfigured();
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code || ''), client_id: clientId, client_secret: clientSecret,
        redirect_uri: redirectUri, grant_type: 'authorization_code'
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) throw new Error(data.error_description || 'Google authorization failed');
    return data;
  }

  async function getGoogleProfile(accessToken) {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.sub || !data.email || data.email_verified !== true) throw new Error('Google profile unavailable');
    const email = String(data.email).trim().toLowerCase();
    return { googleSub: data.sub, email, name: data.name || email.split('@')[0], avatarUrl: data.picture || null };
  }

  async function upsertUser(profile) {
    const now = new Date().toISOString();
    const { data, error } = await supabase.from('app_users').upsert({
      google_sub: profile.googleSub,
      email: profile.email,
      display_name: profile.name,
      avatar_url: profile.avatarUrl,
      last_login_at: now
    }, { onConflict: 'google_sub' }).select('id, google_sub, email, display_name, avatar_url').single();
    if (error) throw error;
    return data;
  }

  async function saveConnection(userId, tokens) {
    const expiresAt = new Date(Date.now() + Math.max(60, Number(tokens.expires_in || 3600)) * 1000).toISOString();
    const { data: existing } = await supabase.from('google_connections')
      .select('refresh_token_enc').eq('user_id', userId).maybeSingle();
    const refreshTokenEnc = tokens.refresh_token ? encrypt(tokens.refresh_token) : existing && existing.refresh_token_enc;
    if (!refreshTokenEnc) throw new Error('Google pa voye refresh token an. Retire aksè aplikasyon an nan kont Google ou epi rekonekte.');
    const { error } = await supabase.from('google_connections').upsert({
      user_id: userId,
      refresh_token_enc: refreshTokenEnc,
      access_token_enc: encrypt(tokens.access_token),
      access_token_expires_at: expiresAt,
      granted_scope: String(tokens.scope || GOOGLE_CONTACTS_SCOPE),
      auto_sync: true,
      last_error: null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) throw error;
  }

  async function getAccessToken(connection) {
    if (connection.access_token_enc && connection.access_token_expires_at &&
        new Date(connection.access_token_expires_at).getTime() > Date.now() + 120000) {
      return decrypt(connection.access_token_enc);
    }
    const refreshToken = decrypt(connection.refresh_token_enc);
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token'
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) throw new Error(data.error_description || 'Google token refresh failed');
    const expiresAt = new Date(Date.now() + Math.max(60, Number(data.expires_in || 3600)) * 1000).toISOString();
    const { error } = await supabase.from('google_connections').update({
      access_token_enc: encrypt(data.access_token), access_token_expires_at: expiresAt,
      updated_at: new Date().toISOString(), last_error: null
    }).eq('user_id', connection.user_id);
    if (error) throw error;
    return data.access_token;
  }

  async function connectionStatus(userId) {
    const { data, error } = await supabase.from('google_connections')
      .select('auto_sync, last_synced_at, last_error, sync_cursor_created_at').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return {
      connected: Boolean(data), autoSync: Boolean(data && data.auto_sync),
      lastSyncedAt: data && data.last_synced_at, lastError: data && data.last_error
    };
  }

  async function createContact(accessToken, row) {
    const contact = {
      names: [{ givenName: namePrefix ? `${namePrefix} ${row.name}` : row.name }],
      phoneNumbers: [{ value: `+${row.full_number}` }],
      userDefined: [{ key: 'DOBERTO VCF ID', value: row.id }]
    };

    let lastResult = {};
    let lastStatus = 0;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(GOOGLE_CREATE_CONTACT_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) return result;

      lastResult = result;
      lastStatus = response.status;
      if (response.status < 500 && response.status !== 429) break;
      if (attempt < 2) await sleep(350 * (attempt + 1));
    }

    throw new Error(googleErrorMessage(lastResult, lastStatus));
  }

  async function syncUser(userId) {
    assertConfigured();
    const { data: connection, error: connectionError } = await supabase.from('google_connections')
      .select('*').eq('user_id', userId).maybeSingle();
    if (connectionError) throw connectionError;
    if (!connection) {
      const error = new Error('Konekte Google Contacts anvan ou fè senkronizasyon.');
      error.code = 'google_contacts_required';
      throw error;
    }

    let query = supabase.from('registrations')
      .select('id, name, full_number, created_at')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .limit(GOOGLE_SYNC_BATCH_SIZE);
    if (connection.sync_cursor_created_at) query = query.gt('created_at', connection.sync_cursor_created_at);
    const { data: rows, error: rowsError } = await query;
    if (rowsError) throw rowsError;

    if (!rows || rows.length === 0) {
      await supabase.from('google_connections').update({
        last_synced_at: new Date().toISOString(), last_error: null, updated_at: new Date().toISOString()
      }).eq('user_id', userId);
      return { created: 0, hasMore: false };
    }

    try {
      const accessToken = await getAccessToken(connection);
      let created = 0;
      let last = null;

      for (const row of rows) {
        await createContact(accessToken, row);
        created += 1;
        last = row;
      }

      await supabase.from('google_connections').update({
        sync_cursor_created_at: last && last.created_at,
        last_synced_at: new Date().toISOString(),
        last_error: null,
        updated_at: new Date().toISOString()
      }).eq('user_id', userId);
      return { created, hasMore: rows.length === GOOGLE_SYNC_BATCH_SIZE };
    } catch (error) {
      await supabase.from('google_connections').update({
        last_error: String(error.message || error).slice(0, 500), updated_at: new Date().toISOString()
      }).eq('user_id', userId);
      throw error;
    }
  }

  async function runAutoSync(limit = 5) {
    const { data, error } = await supabase.from('google_connections')
      .select('user_id').eq('auto_sync', true).order('last_synced_at', { ascending: true, nullsFirst: true }).limit(limit);
    if (error) throw error;
    const results = [];
    for (const row of data || []) {
      try { results.push({ userId: row.user_id, ok: true, ...(await syncUser(row.user_id)) }); }
      catch (error) { results.push({ userId: row.user_id, ok: false, error: String(error.message || error) }); }
    }
    return results;
  }

  return { configured, redirectUri, authUrl, verifyState, exchangeCode, getGoogleProfile, upsertUser, saveConnection, connectionStatus, syncUser, runAutoSync };
}

module.exports = { createGoogleSync };
