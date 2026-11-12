/* DOBERTO VCF — Mes numéros: modifye enfòmasyon yo + ajoute yon dezyèm nimewo (tankou Shizzy). */
(function () {
  'use strict';
  var TOKEN_KEY = 'dv_auth_token';
  var T = {
    ht: { title: 'Nimewo mwen yo', main: 'Nimewo prensipal', second: 'Dezyèm nimewo', none: 'Poko gen', edit: 'Modifye / ajoute dezyèm nimewo', name: 'Non konplè', optional: '(opsyonèl)', ph: 'Nimewo san kòd peyi', save: 'Sove', cancel: 'Anile', saved: '✓ Sove. Kontak yo ap mete ajou otomatikman.', err: 'Erè. Eseye ankò.', hint2: 'Kite vid pou retire dezyèm nimewo a.' },
    fr: { title: 'Mes numéros', main: 'Numéro principal', second: 'Deuxième numéro', none: 'Aucun', edit: 'Modifier / ajouter un 2e numéro', name: 'Nom complet', optional: '(facultatif)', ph: 'Numéro sans indicatif', save: 'Enregistrer', cancel: 'Annuler', saved: '✓ Enregistré. Les contacts se mettent à jour automatiquement.', err: 'Erreur. Réessayez.', hint2: 'Laissez vide pour retirer le 2e numéro.' },
    en: { title: 'My numbers', main: 'Main number', second: 'Second number', none: 'None', edit: 'Edit / add a second number', name: 'Full name', optional: '(optional)', ph: 'Number without country code', save: 'Save', cancel: 'Cancel', saved: '✓ Saved. Contacts update automatically.', err: 'Error. Please try again.', hint2: 'Leave empty to remove the second number.' }
  };
  var reg = null, panel = null;

  function lang() { var l = ''; try { l = localStorage.getItem('doberto_lang') || ''; } catch (_) {} l = l || document.documentElement.lang || 'ht'; return T[l] ? l : 'ht'; }
  function t(k) { return T[lang()][k]; }
  function token() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (_) { return ''; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function api(method, body) {
    return fetch(method === 'GET' ? '/api/auth/session' : '/api/registration', {
      method: method, cache: 'no-store',
      headers: Object.assign({ Authorization: 'Bearer ' + token(), Accept: 'application/json' }, body ? { 'Content-Type': 'application/json' } : {}),
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, data: d }; }); });
  }
  function dialOptions(selected, withEmpty) {
    var html = withEmpty ? '<option value="">—</option>' : '';
    if (typeof COUNTRIES !== 'undefined') {
      COUNTRIES.forEach(function (c) { html += '<option value="' + esc(c.dial) + '"' + (String(c.dial) === String(selected) ? ' selected' : '') + '>' + esc(c.name) + ' (+' + esc(c.dial) + ')</option>'; });
    }
    return html;
  }
  function countryOf(sel) { var o = sel.options[sel.selectedIndex]; return o ? o.textContent.replace(/\s*\(\+\d+\)\s*$/, '') : ''; }

  function injectStyle() {
    if (document.getElementById('dvnStyle')) return;
    var s = document.createElement('style'); s.id = 'dvnStyle';
    s.textContent = '.dvn{margin-top:16px;padding:18px;border:1px solid rgba(94,234,180,.18);border-radius:18px;background:rgba(10,24,20,.6)}.dvn h3{margin:0 0 10px;font-size:15px}.dvn .row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;font-size:14px;border-top:1px solid rgba(255,255,255,.06)}.dvn .row span:first-child{opacity:.65}.dvn button{cursor:pointer;border-radius:12px;padding:11px 14px;font-weight:700;border:1px solid rgba(94,234,180,.35);background:transparent;color:inherit;margin-top:10px}.dvn button.pri{background:#5eead4;color:#04110d;border-color:transparent}.dvn label{display:block;margin:12px 0 5px;font-size:12px;opacity:.8}.dvn input,.dvn select{width:100%;box-sizing:border-box;padding:11px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.25);color:inherit;font:inherit}.dvn .ph{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:8px}.dvn .msg2{margin-top:10px;font-size:13px}.dvn .msg2.err{color:#ff8a8a}.dvn .msg2.ok{color:#5eead4}.dvn .acts{display:flex;gap:8px;flex-wrap:wrap}';
    document.head.appendChild(s);
  }
  function fmt(d, p) { return d && p ? '+' + d + ' ' + p : t('none'); }

  function view() {
    panel.innerHTML = '<h3>' + t('title') + '</h3>' +
      '<div class="row"><span>' + t('main') + '</span><strong>' + esc(fmt(reg.dial_code, reg.phone)) + '</strong></div>' +
      '<div class="row"><span>' + t('second') + '</span><strong>' + esc(fmt(reg.dial_code2, reg.phone2)) + '</strong></div>' +
      '<button type="button" id="dvnEdit">' + t('edit') + '</button><div class="msg2" id="dvnMsg" role="status"></div>';
    panel.querySelector('#dvnEdit').addEventListener('click', form);
  }
  function form() {
    panel.innerHTML = '<h3>' + t('title') + '</h3>' +
      '<label>' + t('name') + '</label><input id="dvnName" type="text" value="' + esc(reg.name) + '" maxlength="100">' +
      '<label>' + t('main') + '</label><div class="ph"><select id="dvnD1">' + dialOptions(reg.dial_code, false) + '</select><input id="dvnP1" type="tel" inputmode="numeric" placeholder="' + esc(t('ph')) + '" value="' + esc(reg.phone) + '"></div>' +
      '<label>' + t('second') + ' ' + t('optional') + '</label><div class="ph"><select id="dvnD2">' + dialOptions(reg.dial_code2 || reg.dial_code, false) + '</select><input id="dvnP2" type="tel" inputmode="numeric" placeholder="' + esc(t('ph')) + '" value="' + esc(reg.phone2 || '') + '"></div>' +
      '<div style="font-size:12px;opacity:.6;margin-top:6px">' + t('hint2') + '</div>' +
      '<div class="acts"><button type="button" class="pri" id="dvnSave">' + t('save') + '</button><button type="button" id="dvnCancel">' + t('cancel') + '</button></div><div class="msg2" id="dvnMsg" role="status"></div>';
    panel.querySelector('#dvnCancel').addEventListener('click', view);
    panel.querySelector('#dvnSave').addEventListener('click', save);
  }
  function save() {
    var q = function (id) { return panel.querySelector(id); }, msg = q('#dvnMsg'), btn = q('#dvnSave');
    btn.disabled = true; msg.className = 'msg2'; msg.textContent = '';
    api('PUT', { name: q('#dvnName').value, dialCode: q('#dvnD1').value, phone: q('#dvnP1').value, countryName: countryOf(q('#dvnD1')), dialCode2: q('#dvnD2').value, phone2: q('#dvnP2').value }).then(function (res) {
      if (res.ok && res.data && res.data.registration) {
        reg = res.data.registration; view();
        var m = panel.querySelector('#dvnMsg'); m.className = 'msg2 ok'; m.textContent = t('saved');
      } else { msg.className = 'msg2 err'; msg.textContent = (res.data && res.data.error) || t('err'); btn.disabled = false; }
    }).catch(function () { msg.className = 'msg2 err'; msg.textContent = t('err'); btn.disabled = false; });
  }

  function mount() {
    var done = document.getElementById('registeredDone');
    if (!done || !reg) return;
    injectStyle();
    if (!panel) { panel = document.createElement('div'); panel.className = 'dvn'; done.parentNode.insertBefore(panel, done.nextSibling); view(); }
    panel.hidden = done.hidden;
  }
  function load() {
    if (!token()) return;
    api('GET').then(function (res) {
      if (res.ok && res.data && res.data.registered && res.data.registration) {
        var first = !reg; reg = res.data.registration;
        if (first || !panel) { mount(); } else { panel.hidden = document.getElementById('registeredDone').hidden; }
      }
    }).catch(function () {});
  }
  function boot() {
    load();
    [900, 2200].forEach(function (ms) { setTimeout(load, ms); });
    window.addEventListener('pageshow', function () { setTimeout(load, 60); });
    var sel = document.getElementById('langSelect');
    if (sel) sel.addEventListener('change', function () { setTimeout(function () { if (panel && reg) view(); }, 60); });
    setInterval(function () { if (panel) { var d = document.getElementById('registeredDone'); if (d) panel.hidden = d.hidden; } }, 800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
