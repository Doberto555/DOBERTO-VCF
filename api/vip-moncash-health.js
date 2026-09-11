require('../lib/runtime-secrets');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const clientId = String(process.env.MONCASH_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.MONCASH_CLIENT_SECRET || '').trim();
  const rawMode = String(process.env.MONCASH_MODE || 'sandbox').trim().toLowerCase();
  const mode = rawMode === 'live' ? 'live' : 'sandbox';
  const configured = Boolean(clientId && clientSecret);
  const probe = String(req.query?.probe || '') === '1';

  if (!probe || !configured) {
    return res.status(200).json({ ok: true, configured, mode });
  }

  async function authAt(restBase) {
    try {
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const response = await fetch(`${restBase}/oauth/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basic}`,
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'scope=read,write&grant_type=client_credentials'
      });
      const data = await response.json().catch(() => ({}));
      return Boolean(response.ok && data.access_token);
    } catch (_) {
      return false;
    }
  }

  const [sandboxAuthenticated, liveAuthenticated] = await Promise.all([
    authAt('https://sandbox.moncashbutton.digicelgroup.com/Api'),
    authAt('https://moncashbutton.digicelgroup.com/Api')
  ]);

  return res.status(200).json({
    ok: true,
    configured,
    mode,
    authenticated: mode === 'live' ? liveAuthenticated : sandboxAuthenticated,
    sandboxAuthenticated,
    liveAuthenticated
  });
};
