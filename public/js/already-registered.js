/* DOBERTO VCF — "Mwen deja enskri": voye moun nan sou koneksyon Google la. */
(function () {
  'use strict';
  function bind() {
    var link = document.getElementById('alreadyRegisteredLink');
    if (!link || link.getAttribute('data-dv-bound')) return;
    link.setAttribute('data-dv-bound', '1');
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var btn = document.getElementById('googleLoginBtn');
      if (!btn) return;
      var href = btn.getAttribute('href');
      if (href && href !== '#') location.assign(href); else btn.click();
    });
  }
  function boot() { bind(); [400, 1200, 2500].forEach(function (ms) { setTimeout(bind, ms); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
