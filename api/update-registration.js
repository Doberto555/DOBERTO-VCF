require('../lib/runtime-secrets');
const { createClient } = require('@supabase/supabase-js');
const { verifyUser, noStore } = require('../lib/security');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function phoneError(dialCode, phone) {
  if (!dialCode) return { code: 'country_required', error: 'Chwazi peyi/kòd peyi a.' };
  if (!phone) return { code: 'phone_required', error: 'Tanpri antre nimewo a.' };
  if (dialCode === '509' && phone.length !== 8) return { code: 'ht_phone_length', error: 'Nimewo Ayisyen an dwe gen egzakteman 8 chif (san 509).' };
  if (dialCode !== '509' && (phone.length < 4 || phone.length > 14)) return { code: 'phone_format', error: 'Nimewo a pa gen yon fòma valid.' };
  return null;
}

const FIELDS = 'id,name,email,dial_code,country_name,phone,full_number,dial_code2,phone2';

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'PUT' && req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const user = verifyUser(req);
  if (!user) return res.status(401).json({ code: 'auth_required', error: 'Konekte ak Google anvan.' });
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(503).json({ error: 'Database lan poko configure.' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 100);
  const dialCode = onlyDigits(body.dialCode).slice(0, 5);
  const phone = onlyDigits(body.phone).slice(0, 14);
  const countryName = String(body.countryName || '').trim().replace(/[\r\n\t]/g, ' ').slice(0, 120);
  const phone2 = onlyDigits(body.phone2).slice(0, 14);
  const dialCode2 = phone2 ? onlyDigits(body.dialCode2 || body.dialCode).slice(0, 5) : '';

  if (!name || name.length < 2) return res.status(400).json({ code: 'name_invalid', error: 'Tanpri antre yon non valid.' });
  const err1 = phoneError(dialCode, phone);
  if (err1) return res.status(400).json(err1);
  if (phone2) {
    const err2 = phoneError(dialCode2, phone2);
    if (err2) return res.status(400).json({ ...err2, error: '2yèm nimewo a: ' + err2.error });
    if (dialCode2 + phone2 === dialCode + phone) {
      return res.status(400).json({ code: 'same_number', error: '2yèm nimewo a dwe diferan de nimewo prensipal la.' });
    }
  }

  const fullNumber = dialCode + phone;
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const { data: own, error: ownError } = await supabase
      .from('registrations')
      .select('id,full_number')
      .eq('user_id', user.userId)
      .maybeSingle();
    if (ownError) throw ownError;
    if (!own) return res.status(404).json({ code: 'not_registered', error: 'Ou poko anrejistre. Anrejistre w anvan.' });

    if (own.full_number !== fullNumber) {
      const { data: taken, error: takenError } = await supabase
        .from('registrations')
        .select('id')
        .eq('full_number', fullNumber)
        .neq('id', own.id)
        .limit(1);
      if (takenError) throw takenError;
      if (taken && taken.length) return res.status(409).json({ code: 'already_registered', error: 'Nimewo sa a deja sou yon lòt kont.' });
    }

    const { data: updated, error: updateError } = await supabase
      .from('registrations')
      .update({
        name,
        dial_code: dialCode,
        country_name: countryName || null,
        phone,
        full_number: fullNumber,
        dial_code2: phone2 ? dialCode2 : null,
        phone2: phone2 || null
      })
      .eq('id', own.id)
      .select(FIELDS)
      .single();
    if (updateError) {
      if (String(updateError.code || '') === '23505') {
        return res.status(409).json({ code: 'already_registered', error: 'Nimewo sa a deja sou yon lòt kont.' });
      }
      throw updateError;
    }
    return res.status(200).json({ ok: true, registration: updated });
  } catch (error) {
    console.error('[DOBERTO VCF] update registration:', error?.message || error);
    return res.status(500).json({ code: 'server_error', error: 'Yon erè sèvè rive. Eseye ankò.' });
  }
};
