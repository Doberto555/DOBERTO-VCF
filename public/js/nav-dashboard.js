/* DOBERTO VCF — bouton "Dashboard" nan meni an (sèlman si moun nan konekte). */
(function () {
  'use strict';
  var LABEL = { ht: 'Dashboard', fr: 'Dashboard', en: 'Dashboard' };
  function loggedIn() { try { return !!localStorage.getItem('dv_auth_token'); } catch (_) { return false; } }
  function add() {
    if (!loggedIn()) return;
    var nav = document.querySelector('.topbar .nav-links');
    if (!nav || document.getElementById('navDashboard')) return;
    var a = document.createElement('a');
    a.id = 'navDashboard'; a.href = 'dashboard.html'; a.textContent = LABEL.ht;
    nav.appendChild(a);
  }
  function boot() { add(); [500, 1500, 3000].forEach(function (ms) { setTimeout(add, ms); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
