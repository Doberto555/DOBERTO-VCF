/* DOBERTO VCF - dashboard: ikon meni, avatar, retire mesaj dwoublon */
(function () {
  'use strict';
  var S = function (p) { return '<svg class="dv-ic" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>'; };
  var IC = {
    grid: S('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'),
    user: S('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
    users: S('<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3.5-5.5 7-5.5s7 2 7 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2.4.7 4 2.3 4 5.2"/>'),
    bolt: S('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
    flag: S('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
    gear: S('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'),
    shield: S('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>'),
    home: S('<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/>')
  };
  var CSS =
    '.side a.has-ic{display:flex!important;align-items:center;gap:12px}' +
    '.side a .dv-ic{width:20px;height:20px;flex:0 0 20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:.85}' +
    '.dv-usercard{display:flex!important;align-items:center;gap:14px}' +
    '.dv-av{flex:0 0 auto;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;' +
      'background:linear-gradient(145deg,#0f3a2c,#0a2a20);border:1px solid rgba(25,229,155,.35);' +
      'color:#f4fbf8;font-weight:800;font-size:20px;text-transform:uppercase}' +
    '.dv-ut{min-width:0;display:grid;gap:2px}' +
    '.dv-ut > *{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '@media(min-width:1101px){.dv-dup-note{display:none!important}}';

  function pick(h) {
    if (h.indexOf('tab=profile') > -1) return IC.user;
    if (h.indexOf('tab=sync') > -1) return IC.bolt;
    if (h.indexOf('tab=reports') > -1) return IC.flag;
    if (h.indexOf('tab=account') > -1) return IC.gear;
    if (h.indexOf('privacy') > -1) return IC.shield;
    if (h.indexOf('list.html') > -1) return IC.users;
    if (h.indexOf('index.html') > -1 || h === '/' || h === 'index') return IC.home;
    if (h.indexOf('dashboard.html') > -1) return IC.grid;
    return '';
  }
  function icons() {
    var links = document.querySelectorAll('.side a');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.classList.contains('has-ic') || a.querySelector('img,svg') || /DOBERTO/i.test(a.textContent || '')) continue;
      var svg = pick(a.getAttribute('href') || '');
      if (!svg) continue;
      a.classList.add('has-ic');
      a.insertAdjacentHTML('afterbegin', svg);
    }
  }
  function avatar() {
    var n = document.getElementById('uName'), m = document.getElementById('uMail');
    if (!n || document.getElementById('dvAv')) return;
    var card = n.parentNode;
    var av = document.createElement('span');
    av.id = 'dvAv'; av.className = 'dv-av'; av.setAttribute('aria-hidden', 'true');
    function upd() { var t = (n.textContent || '').trim(); av.textContent = t ? t.charAt(0) : 'D'; }
    upd();
    card.classList.add('dv-usercard');
    if (m && m.parentNode === card) {
      var box = document.createElement('div');
      box.className = 'dv-ut';
      card.insertBefore(box, n);
      box.appendChild(n); box.appendChild(m);
    }
    card.insertBefore(av, card.firstChild);
    try { new MutationObserver(upd).observe(n, { childList: true, characterData: true, subtree: true }); } catch (_) {}
  }
  function dupNote() {
    var sec = document.getElementById('syncSec');
    if (!sec) return;
    var kids = sec.children;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (/^(P|DIV|SMALL|SPAN)$/.test(k.tagName) && !k.id && k.children.length === 0 &&
          (k.textContent || '').indexOf('Shizzy Connect') > -1) k.classList.add('dv-dup-note');
    }
  }
  function run() { icons(); avatar(); dupNote(); }
  function boot() {
    var st = document.createElement('style'); st.id = 'dvPolishStyle'; st.textContent = CSS;
    document.head.appendChild(st);
    run(); [300, 1000, 2500].forEach(function (ms) { setTimeout(run, ms); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();

/* fix avatar + logo */
(function () {
  var s = document.createElement('style');
  s.textContent =
    '.side .dv-usercard .dv-av{width:48px!important;height:48px!important;min-width:48px!important;max-width:48px!important;' +
    'font-size:20px!important;line-height:1!important;font-weight:800!important;color:#f4fbf8!important;padding:0!important}' +
    '.side .dv-usercard .dv-ut{flex:1 1 auto;min-width:0}';
  document.head.appendChild(s);
})();
