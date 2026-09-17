require('../lib/runtime-secrets');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { secureEqual, hashClientIp, noStore } = require('../lib/security');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '').trim();

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPABASE_URL || !SERVICE_KEY || JWT_SECRET.length < 32 || ADMIN_PASSWORD.length < 8) {
    return res.status(503).json({ error: 'Sekirite admin lan poko configure nèt.' });
  }

  const password = String(req.body?.password || '');
  if (!password || password.length > 512) {
    return res.status(400).json({ code: 'admin_login_invalid', error: 'Demann koneksyon an pa valid.' });
  }

  const ipHash = hashClientIp(req);
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const { data: guardRows, error: guardError } = await supabase.rpc('admin_login_guard_check', { p_ip_hash: ipHash });
    if (guardError) throw guardError;
    const guard = Array.isArray(guardRows) ? guardRows[0] : guardRows;
    if (guard && guard.allowed === false) {
      const retry = Math.max(1, Number(guard.retry_after_seconds || 60));
      res.setHeader('Retry-After', String(retry));
      return res.status(429).json({ code: 'admin_locked', error: 'Twòp tantativ. Eseye ankò pita.', retryAfter: retry });
    }

    if (!secureEqual(password, ADMIN_PASSWORD)) {
      const { data: failRows } = await supabase.rpc('admin_login_guard_fail', { p_ip_hash: ipHash });
      const fail = Array.isArray(failRows) ? failRows[0] : failRows;
      if (fail?.locked) {
        const retry = Math.max(1, Number(fail.retry_after_seconds || 300));
        res.setHeader('Retry-After', String(retry));
      }
      return res.status(401).json({ code: 'admin_password_incorrect', error: 'Modpas admin lan pa kòrèk.' });
    }

    await supabase.rpc('admin_login_guard_success', { p_ip_hash: ipHash });
    const token = jwt.sign({ role: 'admin', purpose: 'admin_session' }, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '2h',
      issuer: 'doberto-vcf',
      audience: 'doberto-vcf-admin',
      jwtid: require('crypto').randomBytes(16).toString('hex')
    });
    return res.status(200).json({ ok: true, token, expiresIn: 7200 });
  } catch (error) {
    console.error('[DOBERTO VCF] admin login guard:', error?.message || error);
    return res.status(503).json({ error: 'Koneksyon admin lan pa disponib pou moman an.' });
  }
};
