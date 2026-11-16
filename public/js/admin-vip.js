(() => {
  'use strict';
  // Panèl VIP nan admin: kòb ki antre + lis moun ki peye (done sòti nan /api/admin/vip/payments).
  const anchor = document.getElementById('reportsPanel');
  if (!anchor || document.getElementById('vipPanel')) return;

  const TZ = 'America/Port-au-Prince';
  const STATUS = { paid: 'Peye', pending: 'An atant', failed: 'Echwe', mismatch: 'Montan pa kòrèk' };
  const STATUS_COLOR = { paid: '#36e7a7', pending: '#ffb454', failed: '#ff7a7a', mismatch: '#ff7a7a' };
  const token = () => { try { return sessionStorage.getItem('doberto_admin_token') || ''; } catch (_) { return ''; } };

  function make(tag, text, css, attrs) {
    const n = document.createElement(tag);
    if (text != null && text !== '') n.textContent = text;
    if (css) n.style.cssText = css;
    if (attrs) Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }
  const htg = (n) => Number(n || 0).toLocaleString('fr-FR') + ' HTG';
  const fmt = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleString('fr-FR', { timeZone: TZ }); } catch (_) { return '—'; }
  };
  const fmtDay = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR', { timeZone: TZ }); } catch (_) { return '—'; }
  };

  const panel = make('section', '', '', { id: 'vipPanel', class: 'group-setting' });
  const head = make('div', '', 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:6px 0 4px');
  const btnCss = 'height:44px!important;margin:0!important;padding:0 22px!important;border-radius:12px!important;box-sizing:border-box!important;font-size:15px!important;line-height:1!important;white-space:nowrap;box-shadow:none!important';
  const controls = make('div', '', 'display:flex;gap:8px;align-items:center');
  const filter = make('select', '', 'height:44px!important;min-width:130px;margin:0!important;padding:0 36px 0 16px!important;border-radius:12px!important;box-sizing:border-box!important;font-size:15px!important;line-height:1!important', { id: 'vipFilter', 'aria-label': 'Filtre estati' });
  [['', 'Tout'], ['paid', 'Peye'], ['pending', 'An atant'], ['failed', 'Echwe'], ['mismatch', 'Montan pa kòrèk']].forEach((o) => {
    const opt = make('option', o[1]); opt.value = o[0]; filter.append(opt);
  });
  const refresh = make('button', 'Rafrechi', btnCss, { type: 'button', id: 'vipRefresh' });
  controls.append(filter, refresh);
  head.append(make('h3', 'Kòb VIP ak moun ki peye', 'margin:0'), controls);

  const msg = make('div', '', '', { class: 'msg', id: 'vipMsg', role: 'status' });
  const tiles = make('div', '', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:10px');
  const list = make('div', '', '', { id: 'vipList' });
  panel.append(make('div', 'VIP', '', { class: 'admin-kicker' }), head, msg, tiles, list);
  anchor.parentNode.insertBefore(panel, anchor);

  let payments = [];
  function say(text, kind) { msg.textContent = text || ''; msg.className = 'msg ' + (kind || ''); }

  function tile(label, value, accent) {
    const t = make('div', '', 'border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px 14px');
    t.append(
      make('div', label, 'opacity:.65;font-size:12px;margin-bottom:4px'),
      make('div', value, 'font-weight:800;font-size:1.15rem;word-break:break-word' + (accent ? ';color:' + accent : ''))
    );
    return t;
  }

  function renderStats(s) {
    tiles.textContent = '';
    tiles.append(
      tile('Total ki antre', htg(s.total), '#36e7a7'),
      tile('Jodi a', htg(s.today)),
      tile('7 dènye jou', htg(s.last7)),
      tile('30 dènye jou', htg(s.last30)),
      (s.totalUsd ? tile('Stripe (USD)', '$' + Number(s.totalUsd).toFixed(2), '#f2c66d') : ''),
      tile('Moun ki peye', String(s.payers || 0)),
      tile('Peman reyisi', String(s.paidCount || 0)),
      tile('VIP aktif kounye a', String(s.activeVip || 0))
    );
  }

  function card(p) {
    const wrap = make('div', '', 'border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px 14px;margin-top:10px');
    const top = make('div', '', 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between');
    top.append(
      make('strong', p.name || 'Moun enkoni (kont efase)'),
      make('span', STATUS[p.status] || p.status, 'font-size:12px;font-weight:800;color:' + (STATUS_COLOR[p.status] || 'inherit'))
    );
    const amount = make('div', (String(p.currency).toUpperCase() === 'USD' ? '$' + (Number(p.amount) / 100).toFixed(2) + ' USD (Stripe)' : htg(p.amount)) + ' · ' + (p.days || 0) + ' jou', 'margin:6px 0 2px;font-weight:700');
    wrap.append(top, amount);
    const line = (txt, css) => wrap.append(make('div', txt, 'opacity:.7;font-size:13px;line-height:1.5;word-break:break-word' + (css ? ';' + css : '')));
    if (p.email) line(p.email);
    line('Kreye: ' + fmt(p.created_at) + (p.paid_at ? ' · Peye: ' + fmt(p.paid_at) : ''));
    if (p.vip_until) line('VIP jiska: ' + fmtDay(p.vip_until));
    line('Ref: ' + p.reference + (p.transaction_id ? ' · Tranzak: ' + p.transaction_id : ''), 'opacity:.5;font-size:12px');
    return wrap;
  }

  function renderList() {
    const f = filter.value;
    const rows = f ? payments.filter((p) => p.status === f) : payments;
    list.textContent = '';
    rows.forEach((p) => list.append(card(p)));
    if (!rows.length) list.append(make('p', 'Pa gen peman pou afiche.', 'opacity:.7;margin-top:12px'));
  }

  async function load() {
    if (!token()) { list.textContent = ''; tiles.textContent = ''; return; }
    say('Ap chaje...');
    try {
      const r = await fetch('/api/admin/vip/payments', {
        cache: 'no-store',
        headers: { Authorization: 'Bearer ' + token(), Accept: 'application/json' }
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        list.textContent = ''; tiles.textContent = '';
        say(r.status === 401 ? 'Sesyon admin ekspire.' : (d.error || 'Erè pandan chajman.'), 'err');
        return;
      }
      payments = d.payments || [];
      renderStats(d.stats || {});
      renderList();
      say(payments.length + ' peman (200 dènye yo)', 'ok');
    } catch (_) {
      say('Erè rezo. Eseye ankò.', 'err');
    }
  }

  filter.addEventListener('change', renderList);
  refresh.addEventListener('click', load);

  // Chaje otomatikman lè admin nan konekte (admin.js estoke token an nan sessionStorage).
  let lastToken = '';
  setInterval(() => {
    const tk = token();
    if (tk !== lastToken) { lastToken = tk; load(); }
  }, 1500);
})();
