const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');

try {
  fs.readFileSync(path.join(root, '.env'), 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  });
} catch (_) {}

const { createClient } = require('@supabase/supabase-js');
const { createShizzyConnect, toPartnerContact, ShizzyError } = require('../lib/shizzy-connect');

const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');
const NAME_PREFIX = process.env.NAME_PREFIX || '';
const LIMIT = Math.max(1, parseInt(process.env.SHIZZY_BATCH_SIZE || '5000', 10) || 5000);
const STATE = path.join(root, '.runtime', 'shizzy-cron.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString(), ...a);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const shizzy = createShizzyConnect();

async function fetchAll() {
  const rows = [];
  const take = 1000;
  for (let from = 0; rows.length < LIMIT; from += take) {
    const { data, error } = await supabase.from('registrations').select('*').order('id').range(from, from + take - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < take) break;
  }
  return rows.slice(0, LIMIT);
}

async function main() {
  if (!shizzy.configured) return log('Shizzy pa konfigire, mwen sispann.');
  const rows = await fetchAll();
  const sig = crypto.createHash('md5').update(rows.map((r) => r.id).join(',')).digest('hex');
  let last = '';
  try { last = JSON.parse(fs.readFileSync(STATE, 'utf8')).sig; } catch (_) {}
  if (!FORCE && !DRY && sig === last) return log('Pa gen nouvo enskripsyon, pa gen sync.', rows.length, 'manm');

  const owners = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
  let synced = 0, skipped = 0, failed = 0, reauth = 0;
  for (const userId of owners) {
    try {
      try {
        await shizzy.getConnection(userId);
      } catch (err) {
        if (err instanceof ShizzyError && err.status === 404) { skipped++; continue; }
        throw err;
      }
      const contacts = rows.filter((r) => r.user_id !== userId).map((r) => toPartnerContact(r, NAME_PREFIX)).filter(Boolean);
      if (!contacts.length) { skipped++; continue; }
      if (DRY) { log('[dry] ta voye', contacts.length, 'kontak bay', userId); synced++; continue; }
      await shizzy.putContacts(userId, contacts, 'replace');
      synced++;
    } catch (err) {
      if (err && err.code === 'shizzy_reauth_required') { reauth++; log('reauth nesesè pou', userId); await sleep(1500); continue; }
      failed++;
      log('erè pou', userId, err && err.code || '', err && err.message || err);
    }
    await sleep(1500);
  }
  if (!DRY && failed === 0) fs.writeFileSync(STATE, JSON.stringify({ sig, at: new Date().toISOString() }));
  log(`fini: sync=${synced} sote=${skipped} echèk=${failed} reauth=${reauth} manm=${rows.length}`);
}

main().catch((e) => { console.error(new Date().toISOString(), 'erè grav:', e); process.exit(1); });
