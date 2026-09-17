require('../lib/runtime-secrets');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim();
const BOT_WORKER_URL = String(process.env.VCF_BOT_WORKER_URL || 'http://31.70.130.109:3007').trim().replace(/\/+$/, '');
const BOT_ADMIN_TOKEN = String(process.env.VCF_BOT_ADMIN_TOKEN || '').trim();
const DEFAULT_GROUP = 'https://chat.whatsapp.com/GySPeuvDlI14BnWWvdm7U4?s=sh&p=a&mlu=4&ilr=4';

function bearer(req) {
  const value = String(req.headers.authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

function verifyUser(req) {
  try {
    const payload = jwt.verify(bearer(req), JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'doberto-vcf',
      audience: 'doberto-vcf-user'
    });
    return payload && payload.purpose === 'user_session' && payload.userId ? payload : null;
  } catch (_) {
    return null;
  }
}

function validGroupUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' && url.hostname === 'chat.whatsapp.com' && url.pathname.length > 5;
  } catch (_) {
    return false;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const user = verifyUser(req);
  if (!user) return res.status(401).json({ ok: false, error: 'Sesyon itilizatè a pa valid.' });
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(503).json({ ok: false, error: 'Database lan poko configure.' });
  if (!BOT_ADMIN_TOKEN) return res.status(503).json({ ok: false, code: 'bot_bridge_not_configured', error: 'WhatsApp bot bridge la poko configure.' });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: registration, error: registrationError } = await supabase
    .from('registrations')
    .select('name,dial_code,phone,user_id')
    .eq('user_id', user.userId)
    .maybeSingle();

  if (registrationError) return res.status(500).json({ ok: false, error: 'Nou pa ka verifye enskripsyon an.' });
  if (!registration) return res.status(404).json({ ok: false, error: 'Enskripsyon an pa jwenn.' });

  let groupUrl = DEFAULT_GROUP;
  try {
    const { data } = await supabase.from('app_settings').select('value').eq('key', 'whatsapp_group_url').maybeSingle();
    if (validGroupUrl(data?.value)) groupUrl = String(data.value).trim();
  } catch (_) {}

  const phone = `${String(registration.dial_code || '').replace(/\D/g, '')}${String(registration.phone || '').replace(/\D/g, '')}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${BOT_WORKER_URL}/api/integrations/vcf/registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOT_ADMIN_TOKEN}`,
        'User-Agent': 'DOBERTO-VCF/1.0'
      },
      body: JSON.stringify({ name: registration.name, phone, groupUrl }),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(502).json({ ok: false, error: payload.error || 'Bot la pa t kapab voye nouvo manm nan sou group la.' });
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(error?.name === 'AbortError' ? 504 : 502).json({ ok: false, error: error?.name === 'AbortError' ? 'Bot la pran twòp tan pou reponn.' : 'Bot WhatsApp la pa disponib.' });
  } finally {
    clearTimeout(timeout);
  }
};
