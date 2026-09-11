require('../lib/runtime-secrets');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const clientId = String(process.env.MONCASH_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.MONCASH_CLIENT_SECRET || '').trim();
  const configured = Boolean(clientId && clientSecret);

  return res.status(200).json({ ok: true, configured });
};
