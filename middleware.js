import { next } from '@vercel/functions';

export const config = {
  runtime: 'nodejs',
  matcher: ['/:path*']
};

const OWNER_COOKIE = 'dv_owner_access';
const OWNER_LOGIN_PATH = '/owner-access.html';
const MAINTENANCE_PATH = '/maintenance.html';
const encoder = new TextEncoder();

const protectedPaths = new Set([
  '/',
  '/index',
  '/index.html',
  '/register',
  '/register.html',
  '/list',
  '/list.html',
  '/mesi',
  '/mesi.html',
  '/admin',
  '/admin.html'
]);

function maintenanceEnabled() {
  return String(process.env.MAINTENANCE_MODE ?? '1').trim() !== '0';
}

function ownerSecret() {
  return String(process.env.OWNER_ACCESS_KEY || process.env.ADMIN_PASSWORD || '').trim();
}

function parseCookies(header) {
  const cookies = {};
  String(header || '').split(';').forEach((part) => {
    const index = part.indexOf('=');
    if (index < 0) return;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) cookies[key] = value;
  });
  return cookies;
}

function base64Url(bytes) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return base64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(message)));
}

async function digest(value) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(String(value || ''))));
}

async function secureEqual(a, b) {
  const [left, right] = await Promise.all([digest(a), digest(b)]);
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (left[i % left.length] || 0) ^ (right[i % right.length] || 0);
  }
  return diff === 0;
}

async function issueOwnerToken(secret) {
  const expiresAt = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
  const payload = `owner:${expiresAt}`;
  const signature = await hmac(secret, payload);
  return { token: `${expiresAt}.${signature}`, expiresAt };
}

async function verifyOwnerToken(secret, token) {
  if (!secret || !token) return false;
  const [rawExpires, signature, extra] = String(token).split('.');
  if (extra || !rawExpires || !signature || !/^\d+$/.test(rawExpires)) return false;
  const expiresAt = Number(rawExpires);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(secret, `owner:${expiresAt}`);
  return secureEqual(signature, expected);
}

function ownerCookie(token, maxAge = 30 * 24 * 60 * 60) {
  return `${OWNER_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function redirect(location, headers = {}) {
  return new Response(null, {
    status: 303,
    headers: { Location: location, 'Cache-Control': 'no-store', ...headers }
  });
}

function errorPage(message, status = 401) {
  const safe = String(message || 'Accès refusé.')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return new Response(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Owner access · DOBERTO VCF</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#050806;color:#eef8f3;font:500 15px system-ui}.box{width:min(440px,calc(100% - 32px));padding:28px;border:1px solid #244035;border-radius:20px;background:#0a1410}.box h1{margin:0 0 10px;font-size:22px}.box p{color:#9db1a6;line-height:1.6}.box a{display:inline-block;margin-top:10px;color:#56e8aa}</style></head><body><main class="box"><h1>Accès owner refusé</h1><p>${safe}</p><a href="${OWNER_LOGIN_PATH}">Réessayer</a></main></body></html>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const secret = ownerSecret();

  if (pathname === OWNER_LOGIN_PATH) {
    if (request.method === 'POST') {
      if (!secret || secret.length < 8) {
        return errorPage('OWNER_ACCESS_KEY (ou ADMIN_PASSWORD) pa configure sou Vercel.', 503);
      }

      let password = '';
      try {
        const form = await request.formData();
        password = String(form.get('password') || '');
      } catch (_) {
        return errorPage('Fòm koneksyon an pa valid.', 400);
      }

      if (!(await secureEqual(password, secret))) {
        return redirect(`${OWNER_LOGIN_PATH}?error=1`);
      }

      const { token } = await issueOwnerToken(secret);
      return redirect('/register.html', { 'Set-Cookie': ownerCookie(token) });
    }

    if (url.searchParams.get('logout') === '1') {
      return redirect(OWNER_LOGIN_PATH, { 'Set-Cookie': ownerCookie('', 0) });
    }

    return next();
  }

  if (!maintenanceEnabled() || !protectedPaths.has(pathname)) {
    return next();
  }

  const cookies = parseCookies(request.headers.get('cookie'));
  const token = cookies[OWNER_COOKIE] || '';
  if (await verifyOwnerToken(secret, token)) {
    // Sliding session: chak fwa owner antre sou yon paj pwoteje, nou renouvle aksè a pou 30 jou.
    const fresh = await issueOwnerToken(secret);
    return next({ headers: { 'Set-Cookie': ownerCookie(fresh.token) } });
  }

  return redirect(MAINTENANCE_PATH);
}
