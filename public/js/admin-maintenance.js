(() => {
  'use strict';
  const anchor = document.getElementById('reportsPanel');
  if (!anchor || document.getElementById('maintenancePanel')) return;

  const token = () => { try { return sessionStorage.getItem('doberto_admin_token') || ''; } catch (_) { return ''; } };

  async function call(method, body) {
    const r = await fetch('/api/admin/maintenance', {
      method,
      cache: 'no-store',
      headers: Object.assign({ Authorization: 'Bearer ' + token(), Accept: 'application/json' }, body ? { 'Content-Type': 'application/json' } : {}),
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
  }

  function make(tag, text, css, attrs) {
    const n = document.createElement(tag);
    if (text) n.textContent = text;
    if (css) n.style.cssText = css;
    if (attrs) Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }

  const panel = make('section', '', '', { id: 'maintenancePanel', class: 'group-setting' });
  const head = make('div', '', 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:6px 0 4px');
  const badge = make('span', '...', 'padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid rgba(255,255,255,.2)');
  head.append(make('h3', 'Mòd maintenance sit la', 'margin:0'), badge);

  const label = make('label', 'Mesaj pou vizitè yo (opsyonèl)', '', { for: 'maintenanceMessage' });
  const input = make('input', '', '', { id: 'maintenanceMessage', type: 'text', maxlength: '300', placeholder: 'Egz: Nou ap fè yon mizajou, tounen nan 30 minit.' });

  const row = make('div', '', 'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px');
  const toggleBtn = make('button', 'Aktive maintenance', '', { type: 'button', id: 'maintenanceToggle' });
  const saveBtn = make('button', 'Sove mesaj', '', { type: 'button', id: 'maintenanceSave' });
  row.append(toggleBtn, saveBtn);

  const msg = make('div', '', '', { class: 'msg', id: 'maintenanceMsg', role: 'status' });
  panel.append(make('div', 'MAINTENANCE', '', { class: 'admin-kicker' }), head, label, input, row, msg);
  anchor.parentNode.insertBefore(panel, anchor);

  let enabled = false;
  function say(text, kind) { msg.textContent = text || ''; msg.className = 'msg ' + (kind || ''); }

  function render(state) {
    enabled = !!state.enabled;
    badge.textContent = enabled ? 'AKTIF — vizitè yo wè paj maintenance' : 'Sit la ouvè';
    badge.style.color = enabled ? '#ffb454' : '#36e7a7';
    badge.style.borderColor = enabled ? 'rgba(255,180,84,.5)' : 'rgba(54,231,167,.5)';
    toggleBtn.textContent = enabled ? 'Dezaktive maintenance' : 'Aktive maintenance';
    if (document.activeElement !== input) input.value = state.message || '';
  }

  async function load(tries) {
    const res = await call('GET');
    if (res.ok && res.data && res.data.maintenance) { render(res.data.maintenance); say(''); return; }
    if (res.status === 401 && tries > 0) { setTimeout(() => load(tries - 1), 3000); return; }
    say((res.data && res.data.error) || 'Erè pandan chajman.', 'err');
  }

  async function save(nextEnabled) {
    const res = await call('PUT', { enabled: nextEnabled, message: input.value });
    if (!res.ok) { say(res.status === 401 ? 'Sesyon admin ekspire.' : ((res.data && res.data.error) || 'Erè.'), 'err'); return; }
    render(res.data.maintenance);
    say(res.data.maintenance.enabled ? 'Maintenance aktive.' : 'Sit la ouvè ankò.', 'ok');
  }

  toggleBtn.addEventListener('click', () => {
    const next = !enabled;
    if (next && !window.confirm('Aktive maintenance? Vizitè yo pa pral ka itilize sit la jiskaske ou dezaktive l (admin lan rete ouvè).')) return;
    save(next);
  });
  saveBtn.addEventListener('click', () => save(enabled));

  load(10);
})();
