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
const { isVip, prefixFor, safeRow } = require('../lib/vip');

const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');
const VIP_ONLY = process.argv.includes('--vip');
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

function loadState() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE, 'utf8'));
    return { users: (s && s.users) || {} };
  } catch (_) { return { users: {} }; }
}

async function main() {
  if (!shizzy.configured) return log('Shizzy pa konfigire, mwen sispann.');
  const rows = await fetchAll();
  const state = loadState();
  const allOwners = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
  const vipOwners = new Set(rows.filter((r) => isVip(r)).map((r) => r.user_id));
  const owners = VIP_ONLY ? allOwners.filter((id) => vipOwners.has(id)) : allOwners;
  let synced = 0, unchanged = 0, skipped = 0, failed = 0, reauth = 0;

  for (const userId of owners) {
    try {
      const contacts = rows.filter((r) => r.user_id !== userId).map((r) => toPartnerContact(safeRow(r), prefixFor(r, NAME_PREFIX))).filter(Boolean);
      if (!contacts.length) { skipped++; continue; }

      let conn;
      try {
        conn = await shizzy.getConnection(userId);
      } catch (err) {
        if (err instanceof ShizzyError && err.status === 404) { delete state.users[userId]; skipped++; await sleep(300); continue; }
        throw err;
      }
      const st = String((conn && conn.status) || '').toLowerCase();
      if (st.indexOf('reauth') !== -1 || st === 'revoked' || st === 'expired') {
        delete state.users[userId]; reauth++; log('reauth nesesè pou', userId); await sleep(300); continue;
      }

      const key = crypto.createHash('md5').update(JSON.stringify(contacts)).digest('hex') + '|' + String((conn && conn.createdAt) || '');
      if (!FORCE && state.users[userId] === key) { unchanged++; await sleep(300); continue; }

      if (DRY) { log('[dry] ta voye', contacts.length, 'kontak bay', userId); synced++; continue; }
      await shizzy.putContacts(userId, contacts, 'replace');
      state.users[userId] = key;
      synced++;
    } catch (err) {
      if (err && err.code === 'shizzy_reauth_required') { delete state.users[userId]; reauth++; log('reauth nesesè pou', userId); await sleep(1500); continue; }
      failed++;
      log('erè pou', userId, (err && err.code) || '', (err && err.message) || err);
    }
    await sleep(1500);
  }

  for (const id of Object.keys(state.users)) if (!allOwners.includes(id)) delete state.users[id];
  if (!DRY) fs.writeFileSync(STATE, JSON.stringify({ users: state.users, at: new Date().toISOString() }));
  log(`fini: sync=${synced} chanje-pa=${unchanged} sote=${skipped} echèk=${failed} reauth=${reauth} manm=${rows.length}`);
}

main().catch((e) => { console.error(new Date().toISOString(), 'erè grav:', e); process.exit(1); });
