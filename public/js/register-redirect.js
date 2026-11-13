/* DOBERTO VCF — moun ki deja enskri pa bezwen wè paj enskripsyon an: voye l sou dashboard la. */
(function () {
  'use strict';
  try {
    var p = new URLSearchParams(location.search);
    if (p.has('stay') || p.has('code') || p.has('error') || p.has('state')) return;
    var tok = localStorage.getItem('dv_auth_token');
    if (!tok) return;
    fetch('/api/auth/session', { headers: { Authorization: 'Bearer ' + tok, Accept: 'application/json' }, cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && d.user) location.replace('dashboard.html'); })
      .catch(function () {});
  } catch (_) {}
})();
