// Vercel serverless entrypoint — main API logic stays in server.js.
// Google is now used only for sign-in/registration. Legacy Google Contacts
// endpoints are blocked here so production cannot request or use Contacts access.
const crypto = require('crypto');

const serviceRole = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const hasUsableServiceRole = serviceRole && !serviceRole.includes('REPLACE_WITH');
const currentJwt = String(process.env.JWT_SECRET || '').trim();
const currentAdminPassword = String(process.env.ADMIN_PASSWORD || '').trim();

if (currentJwt.length < 32 && hasUsableServiceRole) {
  process.env.JWT_SECRET = crypto
    .createHash('sha256')
    .update(`doberto-vcf-jwt-v1:${serviceRole}`)
    .digest('hex');
}

if (currentAdminPassword.length < 8 && hasUsableServiceRole) {
  process.env.ADMIN_PASSWORD = crypto
    .createHash('sha256')
    .update(`doberto-vcf-admin-internal-v1:${serviceRole}`)
    .digest('hex');
}

const app = require('../server.js');

const removedPaths = new Set([
  '/api/google/status',
  '/api/google/sync',
  '/api/google/auto-sync',
  '/api/cron/google-sync'
]);

module.exports = (req, res) => {
  let parsed;
  try { parsed = new URL(req.url || '/', 'https://dobertovcf.online'); }
  catch (_) { parsed = { pathname: req.url || '/', searchParams: new URLSearchParams() }; }

  if (removedPaths.has(parsed.pathname)) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(410).json({
      code: 'feature_removed',
      error: 'Google Contacts te retire. Google sèvi sèlman pou koneksyon ak enskripsyon.'
    });
  }

  if (parsed.pathname === '/api/auth/google/url' && parsed.searchParams.get('flow') === 'contacts') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(410).json({
      code: 'google_contacts_removed',
      error: 'Google Contacts te retire. Sèl OAuth flow ki disponib se Google Sign-In.'
    });
  }

  return app(req, res);
};
