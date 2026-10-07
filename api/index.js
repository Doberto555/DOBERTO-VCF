// Vercel serverless entrypoint — main API logic stays in server.js.
// Google is used only for sign-in/registration. Legacy Google Contacts and VIP
// endpoints are blocked here so removed features cannot be called in production.
require('../lib/runtime-secrets');

const app = require('../server.js');

const removedGooglePaths = new Set([
  '/api/google/status',
  '/api/google/sync',
  '/api/google/auto-sync',
  '/api/cron/google-sync'
]);

module.exports = (req, res) => {
  let parsed;
  try { parsed = new URL(req.url || '/', 'https://dobertovcf.online'); }
  catch (_) { parsed = { pathname: req.url || '/', searchParams: new URLSearchParams() }; }

  if (parsed.pathname.startsWith('/api/vip/') || parsed.pathname.startsWith('/api/admin/vip/')) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(410).json({ code: 'feature_removed', error: 'Sistèm VIP la retire nan DOBERTO VCF.' });
  }

  if (removedGooglePaths.has(parsed.pathname)) {
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
