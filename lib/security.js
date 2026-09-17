const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function jwtSecret() {
  return String(process.env.JWT_SECRET || '').trim();
}

function bearer(req) {
  const value = String(req.headers?.authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

function parseCookies(header) {
  const out = {};
  String(header || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i < 0) return;
    const key = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    if (!key) return;
    try { out[key] = decodeURIComponent(value); } catch (_) { out[key] = value; }
  });
  return out;
}

function cookie(req, name) {
  return parseCookies(req.headers?.cookie || '')[name] || '';
}

function secureEqual(a, b) {
  const left = crypto.createHash('sha256').update(String(a || '')).digest();
  const right = crypto.createHash('sha256').update(String(b || '')).digest();
  return crypto.timingSafeEqual(left, right);
}

function verifyUser(req) {
  const secret = jwtSecret();
  if (secret.length < 32) return null;
  try {
    const payload = jwt.verify(bearer(req), secret, {
      algorithms: ['HS256'], issuer: 'doberto-vcf', audience: 'doberto-vcf-user'
    });
    return payload?.purpose === 'user_session' && payload?.userId ? payload : null;
  } catch (_) {
    return null;
  }
}

function verifyAdmin(req) {
  const secret = jwtSecret();
  if (secret.length < 32) return null;
  try {
    const payload = jwt.verify(bearer(req), secret, {
      algorithms: ['HS256'], issuer: 'doberto-vcf', audience: 'doberto-vcf-admin'
    });
    return payload?.role === 'admin' ? payload : null;
  } catch (_) {
    return null;
  }
}

function isHttps(req) {
  const proto = String(req.headers?.['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  if (proto) return proto === 'https';
  const host = String(req.headers?.host || '').toLowerCase();
  return !host.startsWith('localhost') && !host.startsWith('127.0.0.1');
}

function setCookie(req, res, name, value, { maxAge = 600, path = '/', sameSite = 'Lax', httpOnly = true } = {}) {
  const parts = [`${name}=${encodeURIComponent(String(value || ''))}`, `Path=${path}`, `Max-Age=${Math.max(0, Number(maxAge) || 0)}`, `SameSite=${sameSite}`];
  if (httpOnly) parts.push('HttpOnly');
  if (isHttps(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function clientIp(req) {
  const forwarded = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  const real = String(req.headers?.['x-real-ip'] || '').trim();
  return forwarded || real || String(req.socket?.remoteAddress || 'unknown');
}

function hashClientIp(req) {
  const secret = jwtSecret() || 'doberto-vcf-ip-hash';
  return crypto.createHmac('sha256', secret).update(clientIp(req)).digest('hex');
}

module.exports = {
  bearer,
  cookie,
  secureEqual,
  verifyUser,
  verifyAdmin,
  setCookie,
  noStore,
  clientIp,
  hashClientIp
};
