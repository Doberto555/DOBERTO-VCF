/* DOBERTO VCF — "Dènye manm" sou paj akèy la, ak tag NOUVEAU. Pa gen nimewo, sèlman non + peyi. */
(function () {
  'use strict';
  if (!document.body || !document.body.classList.contains('home-page')) return;
  var NEW_HOURS = 48, SHOW = 5;
  var T = {
    ht: { kicker: 'Dènye manm', title: 'Moun ki fèk antre', sub: 'Nimewo yo rete prive. Se sèlman non ak peyi ki parèt.', fresh: 'NOUVO', all: 'Wè tout manm yo', now: 'kounye a', m: ' min de sa', h: ' è de sa', d: ' jou de sa', pre: '' },
    fr: { kicker: 'Derniers membres', title: 'Ils viennent de rejoindre', sub: 'Les numéros restent privés. Seuls le nom et le pays apparaissent.', fresh: 'NOUVEAU', all: 'Voir tous les membres', now: 'à l\u2019instant', m: ' min', h: ' h', d: ' j', pre: 'il y a ' },
    en: { kicker: 'Latest members', title: 'Just joined', sub: 'Numbers stay private. Only name and country are shown.', fresh: 'NEW', all: 'See all members', now: 'just now', m: ' min ago', h: 'h ago', d: 'd ago', pre: '' }
  };
  var rows = null;

  function lang() {
    var sel = document.getElementById('langSelect'), l = sel && sel.value;
    if (!l) { try { l = localStorage.getItem('doberto_lang'); } catch (_) {} }
    return T[l] ? l : 'ht';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ago(iso, c) {
    var mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 2) return c.now;
    if (mins < 60) return c.pre + mins + c.m;
    var h = Math.floor(mins / 60);
    if (h < 48) return c.pre + h + c.h;
    return c.pre + Math.floor(h / 24) + c.d;
  }
  function style() {
    if (document.getElementById('dvrStyle')) return;
    var s = document.createElement('style'); s.id = 'dvrStyle';
    s.textContent = '.dvr-list{display:grid;gap:10px;max-width:720px;margin:18px auto 0}.dvr-row{display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.025);min-width:0}.dvr-row.fresh{border-color:rgba(94,234,180,.35);background:rgba(94,234,180,.06)}.dvr-av{flex:0 0 42px;height:42px;border-radius:50%;display:grid;place-items:center;font-weight:800;background:rgba(94,234,180,.14);color:#5eead4}.dvr-main{flex:1;min-width:0}.dvr-main b{display:block;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dvr-main span{display:block;font-size:12.5px;opacity:.65;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dvr-tag{flex:0 0 auto;font-size:10.5px;font-weight:800;letter-spacing:.06em;padding:5px 10px;border-radius:999px;background:#f1c96b;color:#241a02}.dvr-more{display:flex;justify-content:center;margin-top:16px}';
    document.head.appendChild(s);
  }
  function render() {
    if (!rows || !rows.length) return;
    var c = T[lang()], sec = document.getElementById('dvRecent');
    if (!sec) {
      sec = document.createElement('section'); sec.className = 'section-block'; sec.id = 'dvRecent';
      var anchor = document.getElementById('how') || document.querySelector('.home-cta');
      if (!anchor || !anchor.parentNode) return;
      anchor.parentNode.insertBefore(sec, anchor.nextSibling && anchor.id === 'how' ? anchor.nextSibling : anchor);
    }
    var h = '<div class="section-head"><span class="section-kicker">' + esc(c.kicker) + '</span><h2>' + esc(c.title) + '</h2><p>' + esc(c.sub) + '</p></div><div class="dvr-list">';
    rows.forEach(function (r) {
      var fresh = (Date.now() - new Date(r.created_at).getTime()) < NEW_HOURS * 3600000;
      var name = String(r.name || '').trim() || '—';
      h += '<div class="dvr-row' + (fresh ? ' fresh' : '') + '"><div class="dvr-av">' + esc(name.charAt(0).toUpperCase()) + '</div><div class="dvr-main"><b>' + esc(name) + '</b><span>' + esc(r.country_name || '') + (r.country_name ? ' · ' : '') + esc(ago(r.created_at, c)) + '</span></div>' + (fresh ? '<span class="dvr-tag">' + esc(c.fresh) + '</span>' : '') + '</div>';
    });
    h += '</div><div class="dvr-more"><a class="dv-btn dv-btn-secondary" href="list.html">' + esc(c.all) + '</a></div>';
    sec.innerHTML = h;
  }
  function boot() {
    style();
    fetch('/api/public-list?page=1', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { rows = d && Array.isArray(d.list) ? d.list.slice(0, SHOW) : null; render(); })
      .catch(function () {});
    var sel = document.getElementById('langSelect');
    if (sel) sel.addEventListener('change', function () { setTimeout(render, 60); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
