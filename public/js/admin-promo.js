(() => {
  'use strict';
  // Panèl Promotion nan admin: demann rekonpans (30 USD), referal pa moun, peye/rejte.
  const anchor = document.getElementById('vipPanel') || document.getElementById('reportsPanel');
  if (!anchor || document.getElementById('promoPanel')) return;

  const TZ = 'America/Port-au-Prince';
  const STATUS = { pending: 'An atant', paid: 'Peye', rejected: 'Rejte' };
  const STATUS_COLOR = { pending: '#ffb454', paid: '#36e7a7', rejected: '#ff7a7a' };
  const REF_STATUS = { validated: 'Valide', pending: 'An atant', rejected: 'Rejte' };
  const METHOD = { natcash: 'NatCash', moncash: 'MonCash', cashapp: 'Cash App', paypal: 'PayPal' };
  const token = () => { try { return sessionStorage.getItem('doberto_admin_token') || ''; } catch (_) { return ''; } };

  function make(tag, text, css, attrs) {
    const n = document.createElement(tag);
    if (text != null && text !== '') n.textContent = text;
    if (css) n.style.cssText = css;
    if (attrs) Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }
  const fmt = (d) => { if (!d) return '—'; try { return new Date(d).toLocaleString('fr-FR', { timeZone: TZ }); } catch (_) { return '—'; } };
  const btnCss = 'height:40px!important;margin:0!important;padding:0 16px!important;border-radius:12px!important;box-sizing:border-box!important;font-size:14px!important;line-height:1!important;white-space:nowrap;box-shadow:none!important';

  const panel = make('section', '', '', { id: 'promoPanel', class: 'group-setting' });
  const head = make('div', '', 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:6px 0 4px');
  const controls = make('div', '', 'display:flex;gap:8px;align-items:center');
  const filter = make('select', '', 'height:44px!important;min-width:130px;margin:0!important;padding:0 36px 0 16px!important;border-radius:12px!important;box-sizing:border-box!important;font-size:15px!important;line-height:1!important', { 'aria-label': 'Filtre estati' });
  [['', 'Tout'], ['pending', 'An atant'], ['paid', 'Peye'], ['rejected', 'Rejte']].forEach((o) => { const opt = make('option', o[1]); opt.value = o[0]; filter.append(opt); });
  const refresh = make('button', 'Rafrechi', 'height:44px!important;margin:0!important;padding:0 22px!important;border-radius:12px!important;box-sizing:border-box!important;font-size:15px!important;line-height:1!important;white-space:nowrap;box-shadow:none!important', { type: 'button' });
  controls.append(filter, refresh);
  head.append(make('h3', 'Promotion: rekonpans referal', 'margin:0'), controls);
  const msg = make('div', '', '', { class: 'msg', role: 'status' });
  const tiles = make('div', '', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:10px');
  const list = make('div', '');
  panel.append(make('div', 'PROMOTION', '', { class: 'admin-kicker' }), head, msg, tiles, list);
  anchor.parentNode.insertBefore(panel, anchor);

  let target = 350;
  const say = (text, kind) => { msg.textContent = text || ''; msg.className = 'msg ' + (kind || ''); };

  async function call(method, path, body) {
    const r = await fetch(path, {
      method, cache: 'no-store',
      headers: { Authorization: 'Bearer ' + token(), Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    const d = await r.json().catch(() => ({}));
    return { ok: r.ok && d.ok !== false, status: r.status, d };
  }

  function tile(label, value, accent) {
    const t = make('div', '', 'border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px 14px');
    t.append(make('div', label, 'opacity:.65;font-size:12px;margin-bottom:4px'), make('div', value, 'font-weight:800;font-size:1.15rem' + (accent ? ';color:' + accent : '')));
    return t;
  }

  function renderStats(s) {
    tiles.textContent = '';
    tiles.append(
      tile('Demann an atant', String(s.pending || 0), '#ffb454'),
      tile('Rekonpans peye', String(s.paidCount || 0)),
      tile('Total peye', (s.paidUsd || 0) + ' USD', '#36e7a7'),
      tile('Total referal', String(s.referrals || 0)),
      tile('Objektif', String(target) + ' referal')
    );
  }

  async function showReferrals(p, holder, toggleBtn) {
    if (holder.dataset.open === '1') { holder.textContent = ''; holder.dataset.open = ''; toggleBtn.textContent = 'Wè referal yo'; return; }
    toggleBtn.disabled = true;
    const r = await call('GET', '/api/admin/promo/referrals/' + encodeURIComponent(p.user_id));
    toggleBtn.disabled = false;
    if (!r.ok) { say(r.d.error || 'Pa ka chaje referal yo.', 'err'); return; }
    holder.dataset.open = '1'; toggleBtn.textContent = 'Kache referal yo';
    holder.textContent = '';
    const rows = r.d.referrals || [];
    if (!rows.length) holder.append(make('div', 'Pa gen referal.', 'opacity:.7;margin-top:8px'));
    rows.forEach((x) => {
      const line = make('div', '', 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.08);padding:8px 0;font-size:13px');
      const info = make('span', (x.name || 'Moun enkoni') + (x.email ? ' · ' + x.email : '') + ' · ' + fmt(x.createdAt));
      info.style.cssText = 'word-break:break-word;flex:1;min-width:200px';
      const st = make('strong', REF_STATUS[x.status] || x.status, 'color:' + (x.status === 'validated' ? '#36e7a7' : x.status === 'rejected' ? '#ff7a7a' : '#ffb454'));
      const toggle = make('button', x.status === 'rejected' ? 'Valide' : 'Rejte', btnCss, { type: 'button' });
      toggle.addEventListener('click', async () => {
        toggle.disabled = true;
        const next = x.status === 'rejected' ? 'validated' : 'rejected';
        const u = await call('PUT', '/api/admin/promo/referrals/' + encodeURIComponent(x.id), { status: next });
        if (!u.ok) { toggle.disabled = false; say(u.d.error || 'Echèk.', 'err'); return; }
        say('Referal mete ' + REF_STATUS[next].toLowerCase() + '.', 'ok');
        holder.dataset.open = ''; await showReferrals(p, holder, toggleBtn);
        load();
      });
      line.append(info, st, toggle);
      holder.append(line);
    });
  }

  function card(p) {
    const wrap = make('div', '', 'border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px 14px;margin-top:10px');
    const top = make('div', '', 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between');
    top.append(make('strong', p.name || 'Moun enkoni'), make('span', STATUS[p.status] || p.status, 'font-size:12px;font-weight:800;color:' + (STATUS_COLOR[p.status] || 'inherit')));
    wrap.append(top);
    wrap.append(make('div', p.amount_usd + ' USD · ' + (METHOD[p.method] || p.method) + ' : ' + p.account, 'margin:6px 0 2px;font-weight:700;word-break:break-word'));
    const line = (txt, css) => wrap.append(make('div', txt, 'opacity:.7;font-size:13px;line-height:1.5;word-break:break-word' + (css ? ';' + css : '')));
    if (p.email) line(p.email);
    line('Referal valide lè demann nan: ' + p.referrals_count + ' / ' + target);
    line('Mande: ' + fmt(p.created_at) + (p.paid_at ? ' · Peye: ' + fmt(p.paid_at) : ''));
    if (p.note) line('Nòt: ' + p.note);

    const refHolder = make('div', '');
    const actions = make('div', '', 'display:flex;flex-wrap:wrap;gap:8px;margin-top:10px');
    const seeRefs = make('button', 'Wè referal yo', btnCss, { type: 'button' });
    seeRefs.addEventListener('click', () => showReferrals(p, refHolder, seeRefs));
    actions.append(seeRefs);
    if (p.status === 'pending') {
      const pay = make('button', 'Marke peye', btnCss, { type: 'button' });
      pay.addEventListener('click', async () => {
        if (!confirm('Konfime ou voye ' + p.amount_usd + ' USD sou ' + (METHOD[p.method] || p.method) + ' ' + p.account + ' ? Sa ap bay moun nan VIP a vi.')) return;
        pay.disabled = true;
        const r = await call('PUT', '/api/admin/promo/payouts/' + encodeURIComponent(p.id), { status: 'paid' });
        if (!r.ok) { pay.disabled = false; say(r.d.error || 'Echèk.', 'err'); return; }
        say('Rekonpans lan make peye. VIP a vi aktive.', 'ok'); load();
      });
      const rej = make('button', 'Rejte', btnCss, { type: 'button' });
      rej.addEventListener('click', async () => {
        const note = prompt('Rezon rejè a (opsyonèl):', '');
        if (note === null) return;
        rej.disabled = true;
        const r = await call('PUT', '/api/admin/promo/payouts/' + encodeURIComponent(p.id), { status: 'rejected', note });
        if (!r.ok) { rej.disabled = false; say(r.d.error || 'Echèk.', 'err'); return; }
        say('Demann nan rejte.', 'ok'); load();
      });
      actions.append(pay, rej);
    }
    wrap.append(actions, refHolder);
    return wrap;
  }

  async function load() {
    if (!token()) { list.textContent = ''; tiles.textContent = ''; return; }
    say('Ap chaje...');
    try {
      const q = filter.value ? '?status=' + encodeURIComponent(filter.value) : '';
      const r = await call('GET', '/api/admin/promo/payouts' + q);
      if (!r.ok) {
        list.textContent = ''; tiles.textContent = '';
        say(r.status === 401 ? 'Sesyon admin ekspire.' : (r.d.error || 'Erè pandan chajman.'), 'err');
        return;
      }
      target = r.d.target || target;
      renderStats(r.d.stats || {});
      list.textContent = '';
      (r.d.payouts || []).forEach((p) => list.append(card(p)));
      if (!(r.d.payouts || []).length) list.append(make('p', 'Pa gen demann rekonpans.', 'opacity:.7;margin-top:12px'));
      say((r.d.payouts || []).length + ' demann', 'ok');
    } catch (_) { say('Erè rezo. Eseye ankò.', 'err'); }
  }

  filter.addEventListener('change', load);
  refresh.addEventListener('click', load);
  let lastToken = '';
  setInterval(() => { const tk = token(); if (tk !== lastToken) { lastToken = tk; load(); } }, 1500);
})();
