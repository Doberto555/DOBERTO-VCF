/* DOBERTO VCF — "Dashboard" (sèlman si moun nan konekte).
   Òdinatè: lyen nan meni an anlè. Telefòn: 4yèm tab nan ba anba a (.dv-mobile-dock). */
(function () {
  'use strict';
  var ICON = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>';
  function loggedIn() { try { return !!localStorage.getItem('dv_auth_token'); } catch (_) { return false; } }
  function style() {
    if (document.getElementById('dvNavDashStyle')) return;
    var s = document.createElement('style'); s.id = 'dvNavDashStyle';
    s.textContent =
      '@media(max-width:760px){' +
        '.topbar .nav-links #navDashboard{display:none!important}' +
        '.dv-mobile-dock.dv-has-dash{grid-template-columns:repeat(4,minmax(0,1fr))!important;width:min(440px,calc(100% - 20px))!important}' +
      '}';
    document.head.appendChild(s);
  }
  function add() {
    if (!loggedIn() || !document.body) return;
    style();
    var nav = document.querySelector('.topbar .nav-links');
    if (nav && !document.getElementById('navDashboard')) {
      var a = document.createElement('a'); a.id = 'navDashboard'; a.href = 'dashboard.html'; a.textContent = 'Dashboard';
      nav.appendChild(a);
    }
    var dock = document.querySelector('.dv-mobile-dock');
    if (dock && !dock.querySelector('[data-dock="dashboard"]')) {
      var d = document.createElement('a'); d.href = 'dashboard.html'; d.setAttribute('data-dock', 'dashboard');
      d.innerHTML = ICON + '<span>Dashboard</span>';
      dock.appendChild(d); dock.classList.add('dv-has-dash');
    }
  }
  function boot() {
    add(); [400, 1200, 2500, 5000].forEach(function (ms) { setTimeout(add, ms); });
    try { new MutationObserver(add).observe(document.body, { childList: true }); } catch (_) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
