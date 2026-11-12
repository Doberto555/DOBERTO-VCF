(() => {
  'use strict';
  const panel = document.getElementById('reportsPanel');
  if (!panel) return;
  const listEl = document.getElementById('reportsList');
  const msgEl = document.getElementById('reportsMsg');
  const filterEl = document.getElementById('reportsFilter');
  const refreshBtn = document.getElementById('reportsRefresh');

  const REASONS = { fake: 'Pwofil fo', spam: 'Spam', harassment: 'Arasman', privacy: 'Konfidansyalite', bug: 'Pwoblèm teknik', other: 'Lòt' };
  const STATUSES = { new: 'Nouvo', reviewed: 'Li', resolved: 'Rezoud' };
  const token = () => { try { return sessionStorage.getItem('doberto_admin_token') || ''; } catch (_) { return ''; } };

  async function call(method, path, body) {
    const r = await fetch(path, {
      method,
      cache: 'no-store',
      headers: Object.assign({ Authorization: 'Bearer ' + token(), Accept: 'application/json' }, body ? { 'Content-Type': 'application/json' } : {}),
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
  }

  function say(text, kind) { msgEl.textContent = text || ''; msgEl.className = 'msg ' + (kind || ''); }

  function card(rep) {
    const wrap = document.createElement('div');
    wrap.className = 'report-card';
    wrap.dataset.id = rep.id;
    wrap.style.cssText = 'border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px 14px;margin-top:10px';

    const head = document.createElement('div');
    head.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between';
    const left = document.createElement('strong');
    left.textContent = (REASONS[rep.reason] || rep.reason) + (rep.target ? ' · ' + rep.target : '');
    const when = document.createElement('span');
    when.style.cssText = 'opacity:.65;font-size:12px';
    when.textContent = rep.created_at ? new Date(rep.created_at).toLocaleString('fr-FR') : '';
    head.append(left, when);

    const body = document.createElement('p');
    body.style.cssText = 'margin:8px 0;white-space:pre-wrap;word-break:break-word;line-height:1.5';
    body.textContent = rep.details || '';

    wrap.append(head, body);

    if (rep.contact) {
      const c = document.createElement('div');
      c.style.cssText = 'opacity:.75;font-size:13px;margin-bottom:8px';
      c.textContent = 'Kontak: ' + rep.contact;
      wrap.append(c);
    }
    if (rep.reporter_user_id) {
      const c = document.createElement('div');
      c.style.cssText = 'opacity:.55;font-size:12px;margin-bottom:8px';
      c.textContent = 'Moun ki konekte te voye l';
      wrap.append(c);
    }

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center';
    const sel = document.createElement('select');
    sel.dataset.act = 'status';
    Object.keys(STATUSES).forEach((k) => {
      const o = document.createElement('option');
      o.value = k; o.textContent = STATUSES[k];
      if (k === rep.status) o.selected = true;
      sel.append(o);
    });
    const del = document.createElement('button');
    del.type = 'button'; del.dataset.act = 'delete'; del.textContent = 'Efase';
    actions.append(sel, del);
    wrap.append(actions);
    return wrap;
  }

  async function load() {
    if (!token()) { listEl.textContent = ''; return; }
    say('Ap chaje...');
    const status = filterEl.value;
    const res = await call('GET', '/api/admin/reports' + (status ? '?status=' + encodeURIComponent(status) : ''));
    if (!res.ok) {
      listEl.textContent = '';
      say(res.status === 401 ? 'Sesyon admin ekspire.' : ((res.data && res.data.error) || 'Erè. Si tab reports la poko egziste, kouri supabase-reports.sql nan Supabase.'), 'err');
      return;
    }
    const reports = res.data.reports || [];
    listEl.textContent = '';
    reports.forEach((r) => listEl.append(card(r)));
    say(reports.length ? reports.length + ' siyalman' : 'Pa gen siyalman.', reports.length ? 'ok' : '');
  }

  listEl.addEventListener('change', async (e) => {
    const sel = e.target.closest('select[data-act="status"]');
    if (!sel) return;
    const id = sel.closest('.report-card').dataset.id;
    const res = await call('PUT', '/api/admin/reports/' + id, { status: sel.value });
    say(res.ok ? 'Estati mete ajou.' : ((res.data && res.data.error) || 'Erè.'), res.ok ? 'ok' : 'err');
  });
  listEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-act="delete"]');
    if (!btn) return;
    if (!window.confirm('Efase siyalman sa a?')) return;
    const cardEl = btn.closest('.report-card');
    const res = await call('DELETE', '/api/admin/reports/' + cardEl.dataset.id);
    if (res.ok) { cardEl.remove(); say('Siyalman efase.', 'ok'); }
    else say((res.data && res.data.error) || 'Erè.', 'err');
  });
  filterEl.addEventListener('change', load);
  refreshBtn.addEventListener('click', load);

  // Chaje otomatikman lè admin nan konekte (admin.js estoke token an nan sessionStorage).
  let lastToken = '';
  setInterval(() => {
    const tk = token();
    if (tk !== lastToken) { lastToken = tk; load(); }
  }, 1500);
})();
