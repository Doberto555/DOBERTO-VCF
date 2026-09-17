require('../lib/runtime-secrets');
const { createClient } = require('@supabase/supabase-js');
const { verifyUser, noStore } = require('../lib/security');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = verifyUser(req);
  if (!user) return res.status(401).json({ code: 'auth_required', error: 'Konekte ak Google anvan.' });
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(503).json({ error: 'Database lan poko configure.' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  let name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 100);
  const email = String(user.email || '').trim().toLowerCase().slice(0, 254);
  const dialCode = onlyDigits(body.dialCode).slice(0, 5);
  const phone = onlyDigits(body.phone).slice(0, 14);
  const countryName = String(body.countryName || '').trim().replace(/[\r\n\t]/g, ' ').slice(0, 120);

  if (!name || name.length < 2) return res.status(400).json({ code: 'name_invalid', error: 'Tanpri antre yon non valid.' });
  if (!dialCode) return res.status(400).json({ code: 'country_required', error: 'Chwazi peyi/kòd peyi a.' });
  if (!phone) return res.status(400).json({ code: 'phone_required', error: 'Tanpri antre nimewo a.' });
  if (!email || !validEmail(email)) return res.status(400).json({ code: 'email_invalid', error: 'Email Google la pa valid.' });
  if (dialCode === '509' && phone.length !== 8) return res.status(400).json({ code: 'ht_phone_length', error: 'Nimewo Ayisyen an dwe gen egzakteman 8 chif (san 509).' });
  if (dialCode !== '509' && (phone.length < 4 || phone.length > 14)) return res.status(400).json({ code: 'phone_format', error: 'Nimewo a pa gen yon fòma valid.' });

  const fullNumber = dialCode + phone;
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const { data: existing, error: existingError } = await supabase
      .from('registrations')
      .select('id,user_id,email,name,dial_code,country_name,phone,full_number')
      .eq('full_number', fullNumber)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing) {
      if (existing.user_id && String(existing.user_id) !== String(user.userId)) {
        return res.status(409).json({ code: 'already_registered', error: 'Nimewo sa a deja sou yon lòt kont.' });
      }

      if (!existing.user_id) {
        const legacyEmail = String(existing.email || '').trim().toLowerCase();
        if (!legacyEmail || legacyEmail !== email) {
          return res.status(409).json({
            code: 'legacy_claim_requires_admin',
            error: 'Nimewo sa a soti nan yon ansyen enskripsyon. Owner/admin dwe verifye li anvan li ka konekte ak kont sa a.'
          });
        }
      }

      const { data: updated, error: updateError } = await supabase
        .from('registrations')
        .update({ user_id: user.userId, name, email, dial_code: dialCode, country_name: countryName || null, phone, full_number: fullNumber })
        .eq('id', existing.id)
        .select('id,name,email,dial_code,country_name,phone,full_number')
        .single();
      if (updateError) throw updateError;
      return res.status(200).json({ ok: true, claimed: !existing.user_id, registration: updated });
    }

    const { data: ownRegistration, error: ownError } = await supabase
      .from('registrations')
      .select('id,name,email,dial_code,country_name,phone,full_number')
      .eq('user_id', user.userId)
      .maybeSingle();
    if (ownError) throw ownError;
    if (ownRegistration) {
      return res.status(409).json({ code: 'account_registered', error: 'Kont Google sa a deja gen yon nimewo anrejistre.' });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('registrations')
      .insert({ name, email, user_id: user.userId, dial_code: dialCode, country_name: countryName || null, phone, full_number: fullNumber })
      .select('id,name,email,dial_code,country_name,phone,full_number')
      .single();
    if (insertError) {
      if (String(insertError.code || '') === '23505') {
        return res.status(409).json({ code: 'already_registered', error: 'Enskripsyon sa a deja egziste.' });
      }
      throw insertError;
    }

    return res.status(200).json({ ok: true, registration: inserted });
  } catch (error) {
    console.error('[DOBERTO VCF] secure registration:', error?.message || error);
    return res.status(500).json({ code: 'server_error', error: 'Yon erè sèvè rive. Eseye ankò.' });
  }
};
