const crypto = require('crypto');

const secret = () => String(process.env.UNSUB_SECRET || '');
const base = () => (process.env.SITE_URL || 'https://dobertovcf.online').replace(/\/+$/, '');
const norm = (e) => String(e || '').trim().toLowerCase();

function sign(email) {
  return crypto.createHmac('sha256', secret()).update(norm(email)).digest('hex').slice(0, 32);
}

function url(email) {
  const e = norm(email);
  return base() + '/api/unsubscribe?e=' + encodeURIComponent(e) + '&t=' + sign(e);
}

function verify(email, token) {
  const a = Buffer.from(sign(email));
  const b = Buffer.from(String(token || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { url, sign, verify };
