require('./runtime-secrets');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { buildEmail } = require('./email-template');
const unsub = require('./unsub');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let running = false;

async function all(sb, table, cols, order, filter) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    let q = sb.from(table).select(cols).order(order).range(from, from + 999);
    if (filter) q = filter(q);
    const { data, error } = await q;
    if (error) throw error;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

function campaignFor(subject, message) {
  return 'admin-' + crypto.createHash('sha1').update(subject + '\n' + message).digest('hex').slice(0, 8);
}

function isRunning() { return running; }

async function run({ sendMail, subject, message, imageUrl, linkUrl, limit }) {
  if (String(process.env.UNSUB_SECRET || '').length < 32) throw new Error('UNSUB_SECRET manke');
  const sb = createClient(String(process.env.SUPABASE_URL || '').trim(), String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(), { auth: { persistSession: false } });
  const campaign = campaignFor(subject, message);
  const regs = await all(sb, 'registrations', 'id,name,email', 'id');
  const unsubSet = new Set((await all(sb, 'email_unsubscribes', 'email_lower', 'email_lower')).map((x) => x.email_lower));
  const sentSet = new Set((await all(sb, 'email_sends', 'email_lower', 'email_lower', (q) => q.eq('campaign', campaign))).map((x) => x.email_lower));
  const seen = new Set(), list = [];
  for (const r of regs) {
    const e = String(r.email || '').trim().toLowerCase();
    if (!e || !EMAIL_RE.test(e) || seen.has(e)) continue;
    seen.add(e);
    if (!unsubSet.has(e) && !sentSet.has(e)) list.push(e);
  }
  const batch = list.slice(0, limit);
  console.log('[bulk]', campaign, '| rete:', list.length, '| ap voye:', batch.length);
  let ok = 0, fail = 0;
  for (const email of batch) {
    try {
      const u = unsub.url(email);
      const c = buildEmail({ message, imageUrl, linkUrl, unsubUrl: u });
      await sendMail({ to: email, subject, html: c.html, text: c.text, headers: { 'List-Unsubscribe': '<' + u + '>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } });
      const { error } = await sb.from('email_sends').upsert({ campaign, email_lower: email }, { onConflict: 'campaign,email_lower' });
      if (error) console.error('[bulk] pa ka anrejistre:', error.message);
      ok++;
    } catch (e) {
      fail++;
      console.error('[bulk] echwe:', e.message);
      if (/quota|limit|rate/i.test(e.message)) { console.log('[bulk] Limit Resend rive.'); break; }
      if (fail >= 5) { console.log('[bulk] Twop echek.'); break; }
    }
    await sleep(600);
  }
  console.log('[bulk] Fini:', ok, 'voye,', fail, 'echwe.');
  return { campaign, ok, fail, remaining: Math.max(list.length - ok, 0) };
}

function start(opts) {
  if (running) return false;
  running = true;
  run(opts).catch((e) => console.error('[bulk] ere:', e.message)).finally(() => { running = false; });
  return true;
}

module.exports = { start, isRunning, campaignFor };
