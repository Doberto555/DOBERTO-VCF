/* DOBERTO VCF — kache bouton "Sinkronize kontak yo" si Google Contacts deja konekte/sinkronize. */
(function () {
  'use strict';
  var TOKEN_KEY = 'dv_auth_token';
  var STYLE_ID = 'dvSyncStateStyle';

  function token() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (_) { return ''; } }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = 'body.dv-synced #registeredGroupBtn{display:none!important}';
    (document.head || document.documentElement).appendChild(s);
  }

  function isConnected(c) {
    if (!c) return false;
    var st = String(c.status || '').toLowerCase();
    if (st.indexOf('reauth') !== -1 || st === 'revoked' || st === 'expired') return false;
    return c.connected === true || st === 'connected' || st === 'active';
  }

  function check() {
    if (!token()) { document.body.classList.remove('dv-synced'); return; }
    fetch('/api/shizzy/status', {
      headers: { Authorization: 'Bearer ' + token(), Accept: 'application/json' },
      cache: 'no-store'
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || d.configured === false) return;
      document.body.classList.toggle('dv-synced', isConnected(d.connection));
    }).catch(function () {});
  }

  function boot() {
    injectStyle();
    check();
    window.addEventListener('pageshow', function () { setTimeout(check, 50); });
    [600, 1600].forEach(function (ms) { setTimeout(check, ms); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
