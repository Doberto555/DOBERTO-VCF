require('../lib/runtime-secrets');
const { createClient } = require('@supabase/supabase-js');
const { verifyUser, noStore } = require('../lib/security');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const COLS = 'id,name,email,dial_code,country_name,phone,full_number,dial_code2,phone2,full_number2';

const digits = (v) => String(v || '').replace(/\D/g, '');

function checkNumber(dial, phone) {
  if (!dial) return { code: 'country_required', error: 'Chwazi peyi/kòd peyi a.' };
  if (!phone) return { code: 'phone_required', error: 'Tanpri antre nimewo a.' };
  if (dial === '509' && phone.length !== 8) return { code: 'ht_phone_length', error: 'Nimewo Ayisyen an dwe gen egzakteman 8 chif (san 509).' };
  if (dial !== '509' && (phone.length < 4 || phone.length > 14)) return { code: 'phone_format', error: 'Nimewo a pa gen yon fòma valid.' };
  return null;
}

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  const user = verifyUser(req);
  if (!user) return res.status(401).json({ code: 'auth_required', error: 'Konekte ak Google anvan.' });
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(503).json({ error: 'Database lan poko configure.' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 100);
  const dial1 = digits(body.dialCode).slice(0, 5);
  const phone1 = digits(body.phone).slice(0, 14);
  const dial2 = digits(body.dialCode2).slice(0, 5);
  const phone2 = digits(body.phone2).slice(0, 14);
  const countryName = String(body.countryName || '').trim().replace(/[\r\n\t]/g, ' ').slice(0, 120);

  if (name.length < 2) return res.status(400).json({ code: 'name_invalid', error: 'Tanpri antre yon non valid.' });
  const bad1 = checkNumber(dial1, phone1);
  if (bad1) return res.status(400).json(bad1);

  const wantSecond = Boolean(phone2);
  if (wantSecond) {
    const bad2 = checkNumber(dial2, phone2);
    if (bad2) return res.status(400).json({ ...bad2, field: 'second' });
    if (dial1 + phone1 === dial2 + phone2) {
      return res.status(400).json({ code: 'same_number', error: 'Dezyèm nimewo a dwe diferan de premye a.' });
    }
  }

  const full1 = dial1 + phone1;
  const full2 = wantSecond ? dial2 + phone2 : null;
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const { data: mine, error: mineError } = await supabase.from('registrations').select('id').eq('user_id', user.userId).maybeSingle();
    if (mineError) throw mineError;
    if (!mine) return res.status(404).json({ code: 'not_registered', error: 'Ou poko enskri.' });

    for (const n of [full1, full2].filter(Boolean)) {
      const { data: clash, error: clashError } = await supabase.from('registrations')
        .select('id').neq('id', mine.id).or(`full_number.eq.${n},full_number2.eq.${n}`).limit(1);
      if (clashError) throw clashError;
      if (clash && clash.length) {
        return res.status(409).json({ code: 'already_registered', error: `Nimewo +${n} deja sou yon lòt kont.` });
      }
    }

    const { data: updated, error: updateError } = await supabase.from('registrations')
      .update({
        name,
        dial_code: dial1,
        phone: phone1,
        full_number: full1,
        country_name: countryName || null,
        dial_code2: wantSecond ? dial2 : null,
        phone2: wantSecond ? phone2 : null,
        full_number2: full2
      })
      .eq('id', mine.id).select(COLS).single();
    if (updateError) {
      if (String(updateError.code || '') === '23505') {
        return res.status(409).json({ code: 'already_registered', error: 'Yon nimewo sa a deja egziste.' });
      }
      throw updateError;
    }
    return res.status(200).json({ ok: true, registration: updated });
  } catch (error) {
    console.error('[DOBERTO VCF] registration update:', error && error.message || error);
    return res.status(500).json({ code: 'server_error', error: 'Yon erè sèvè rive. Eseye ankò.' });
  }
};
