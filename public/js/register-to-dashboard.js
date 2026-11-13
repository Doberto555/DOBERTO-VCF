/* DOBERTO VCF - apre enskripsyon (oswa retou Google), voye moun sou dashboard (Mon profil) */
(function () {
  'use strict';
  var TARGET = 'dashboard.html?tab=sync';
  var started = false;
  try { if (new URLSearchParams(location.search).has('stay')) return; } catch (_) {}
  function visible(el) { return el && !el.hidden && getComputedStyle(el).display !== 'none'; }
  function go() {
    if (started) return;
    started = true;
    setTimeout(function () { location.replace(TARGET); }, 1500);
  }
  function boot() {
    var el = document.getElementById('registeredDone');
    if (!el) return;
    if (visible(el)) go();
    try {
      new MutationObserver(function () { if (visible(el)) go(); })
        .observe(el, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
    } catch (_) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
