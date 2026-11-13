/* DOBERTO VCF - hero card (style Shizzy + animasyon). Pa touche lòt kòd sou index.html */
(function () {
  'use strict';
  if (window.__dvHeroCard) return;
  window.__dvHeroCard = true;

  var SLOTS = 5, STEP_MS = 2600, REFRESH_MS = 45000;
  var PREFIX = 'DML', CARD_NAME = 'Doberto', SHOW_FLOAT = true;
  var calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var T = {
    ht: { fiche: 'Fich ou sou telefòn yo', free: 'GRATIS', vip: 'VIP', msg: 'Nou ka wè estati youn lòt', nw: 'NOUVO' },
    fr: { fiche: 'Votre fiche sur leur téléphone', free: 'GRATUIT', vip: 'VIP', msg: "Vous pouvez voir les statuts l'un de l'autre", nw: 'NOUVEAU' },
    en: { fiche: 'Your card on their phone', free: 'FREE', vip: 'VIP', msg: 'You can see each other\u2019s statuses', nw: 'NEW' }
  };

  var C = [
    ['ayiti,haiti', 'HT', '509'], ['kamewoun,cameroon,cameroun', 'CM', '237'],
    ['nijerya,nigeria', 'NG', '234'], ['afrik di sid,south africa,afrique du sud', 'ZA', '27'],
    ['burkina', 'BF', '226'], ['senegal', 'SN', '221'], ['togo', 'TG', '228'],
    ['etazini,united states,etats-unis,etats unis,usa', 'US', '1'], ['kanada,canada', 'CA', '1'],
    ['frans,france', 'FR', '33'], ['dominik,dominican', 'DO', '1'], ['ghana', 'GH', '233'],
    ['benen,benin', 'BJ', '229'], ['kot divwa,ivory,cote d', 'CI', '225'],
    ['kongo,congo', 'CD', '243'], ['mali', 'ML', '223'], ['gine,guinea,guinee', 'GN', '224'],
    ['gabon', 'GA', '241'], ['madagaskar,madagascar', 'MG', '261'],
    ['brezil,brazil,bresil', 'BR', '55'], ['belgik,belgium,belgique', 'BE', '32'],
    ['swis,switzerland,suisse', 'CH', '41'], ['meksik,mexico,mexique', 'MX', '52'],
    ['wayom,united kingdom,royaume', 'GB', '44'], ['espay,spain,espagne', 'ES', '34'],
    ['chili,chile', 'CL', '56'], ['kolonbi,colombia,colombie', 'CO', '57'],
    ['maroc,morocco,mawok', 'MA', '212'], ['aljeri,algeria,algerie', 'DZ', '213'],
    ['tinizi,tunisia,tunisie', 'TN', '216'], ['nije,niger', 'NE', '227'],
    ['chad,tchad', 'TD', '235'], ['rwanda', 'RW', '250'], ['kenya', 'KE', '254'],
    ['ouganda,uganda', 'UG', '256'], ['tanzani', 'TZ', '255'],
    ['jamayik,jamaica,jamaique', 'JM', '1']
  ];

  var members = [], idx = 0, box = null, floatEl = null, topKey = '';

  function mk(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function norm(s) {
    try { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    catch (e) { return String(s || '').toLowerCase(); }
  }
  function lang() {
    var l = '';
    try { l = (localStorage.getItem('doberto_lang') || ''); } catch (e) {}
    l = l.slice(0, 2).toLowerCase();
    if (!T[l]) l = (document.documentElement.getAttribute('lang') || '').slice(0, 2).toLowerCase();
    return T[l] ? l : 'ht';
  }
  function disp(m) {
    var s = String(m.name || '').trim().replace(/^(d\.?\s?m\.?\s?l\.?)[\s\-:\u00b7]+/i, '');
    var p = s.split(/\s+/).filter(Boolean);
    if (!p.length) return '';
    var out = p[0];
    if (p.length > 1) out += ' ' + Array.from(p[p.length - 1])[0].toUpperCase() + '.';
    return out;
  }
  function info(m) {
    var raw = String(m.country_name || m.country || m.countryName || '');
    var dial = String(m.dial_code || m.dialCode || '').replace(/[^\d]/g, '');
    var mm = raw.match(/\+(\d{1,4})/);
    if (!dial && mm) dial = mm[1];
    var iso = String(m.country_code || m.countryCode || m.iso || '').toUpperCase();
    if (iso.length !== 2) iso = '';
    var n = norm(raw);
    for (var i = 0; i < C.length; i++) {
      var ks = C[i][0].split(',');
      for (var j = 0; j < ks.length; j++) {
        if (n.indexOf(ks[j]) > -1) { iso = iso || C[i][1]; dial = dial || C[i][2]; i = C.length; break; }
      }
    }
    return { iso: iso, dial: dial, label: raw.replace(/\s*\(.*?\)\s*/g, ' ').trim() };
  }
  function pick(d) {
    if (Array.isArray(d)) return d;
    if (!d) return [];
    var k = ['members', 'items', 'data', 'list', 'rows', 'registrations'];
    for (var i = 0; i < k.length; i++) {
      var v = d[k[i]];
      if (Array.isArray(v)) return v;
      if (v && typeof v === 'object') { var r = pick(v); if (r.length) return r; }
    }
    return [];
  }

  function rowEl(m, isNew, animated) {
    var r = mk('div', 'hc-row' + (isNew ? ' new' : '') + (animated ? ' in' : ''));
    var d = disp(m), inf = info(m);
    r.appendChild(mk('span', 'av', (Array.from(d)[0] || '?').toUpperCase()));
    var nm = mk('div', 'nm'), n = mk('div', 'n');
    n.appendChild(mk('em', '', PREFIX));
    n.appendChild(document.createTextNode(d));
    var s = mk('div', 's');
    if (inf.iso) {
      s.appendChild(mk('b', '', inf.iso));
      s.appendChild(document.createTextNode((inf.dial ? '+' + inf.dial + ' ' : '') + '\u2022\u2022\u2022 \u2022\u2022 \u2022\u2022'));
    } else {
      s.textContent = inf.label || '\u2022\u2022\u2022 \u2022\u2022 \u2022\u2022';
    }
    nm.appendChild(n); nm.appendChild(s);
    r.appendChild(nm);
    r.appendChild(mk('span', 'pill', T[lang()].nw));
    if (isNew && animated && !calm) {
      var c = mk('i', 'hc-cur');
      c.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 3l14 8-6.2 1.8L10 19z" fill="#fff" stroke="#0b0b0b" stroke-width="1.4" stroke-linejoin="round"/></svg>';
      r.appendChild(c);
    }
    return r;
  }

  function render() {
    if (!box) return;
    box.textContent = '';
    members.slice(0, SLOTS).forEach(function (m, i) { box.appendChild(rowEl(m, i === 0, false)); });
  }

  function step() {
    if (calm || document.hidden || !box || members.length <= SLOTS) return;
    var m = members[idx % members.length];
    idx = (idx + 1) % members.length;
    var rows = [].slice.call(box.children);
    var h = rows[0] ? rows[0].offsetHeight : 62;
    rows.forEach(function (r) {
      r.classList.remove('new'); r.classList.remove('in');
      var c = r.querySelector('.hc-cur'); if (c) c.remove();
    });
    var el = rowEl(m, true, true);
    box.insertBefore(el, box.firstChild);
    var all = [].slice.call(box.children);
    var rest = all.slice(1);
    rest.forEach(function (r) { r.style.transition = 'none'; r.style.transform = 'translateY(-' + h + 'px)'; });
    void box.offsetWidth;
    rest.forEach(function (r) { r.style.transition = ''; r.style.transform = ''; });
    if (all.length > SLOTS) {
      var last = all[all.length - 1];
      last.classList.add('out');
      setTimeout(function () { if (last.parentNode) last.parentNode.removeChild(last); }, 520);
    }
  }

  function buildFloat(mock) {
    if (!SHOW_FLOAT || floatEl) return;
    floatEl = mk('div', 'hc-float');
    floatEl.appendChild(mk('h5', 'fh'));
    var r1 = mk('div', 'fr'), t1 = mk('span', 't');
    t1.appendChild(mk('em', '', PREFIX)); t1.appendChild(document.createTextNode(CARD_NAME));
    r1.appendChild(t1); r1.appendChild(mk('span', 'b free'));
    var r2 = mk('div', 'fr vip'), t2 = mk('span', 't');
    t2.appendChild(document.createTextNode(CARD_NAME + ' ')); t2.appendChild(mk('span', 'g', '(V.I.P)'));
    r2.appendChild(t2); r2.appendChild(mk('span', 'b vipb'));
    floatEl.appendChild(r1); floatEl.appendChild(r2);
    floatEl.appendChild(mk('p', 'fm'));
    mock.appendChild(floatEl);
  }

  function applyLang() {
    var t = T[lang()];
    if (floatEl) {
      floatEl.querySelector('.fh').textContent = t.fiche;
      floatEl.querySelector('.b.free').textContent = t.free;
      floatEl.querySelector('.vipb').textContent = t.vip;
      floatEl.querySelector('.fm').textContent = t.msg;
    }
    [].forEach.call(document.querySelectorAll('.hc-row .pill'), function (p) { p.textContent = t.nw; });
  }

  function load() {
    fetch('/api/public-list?page=1', { cache: 'no-store', headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
      .then(function (d) {
        var l = pick(d).filter(function (m) { return m && m.name; });
        l.sort(function (a, b) {
          return (Date.parse(b.created_at || b.createdAt) || 0) - (Date.parse(a.created_at || a.createdAt) || 0);
        });
        var k = l.length ? String(l[0].name) + '|' + String(l[0].created_at || l[0].createdAt || '') : '';
        var changed = k !== topKey;
        members = l; topKey = k;
        if (changed) { idx = SLOTS % Math.max(l.length, 1); render(); }
      })
      .catch(function () {});
  }

  function init() {
    var mock = document.querySelector('.mock');
    var orig = document.getElementById('mRows');
    if (!mock || !orig) return;
    box = mk('div', 'hc-rows');
    orig.parentNode.insertBefore(box, orig.nextSibling);
    buildFloat(mock);
    applyLang();
    var tag = mock.querySelector('.mh .tag');
    if (tag && window.MutationObserver) {
      new MutationObserver(applyLang).observe(tag, { childList: true, characterData: true, subtree: true });
    }
    load();
    setInterval(function () { if (!document.hidden) load(); }, REFRESH_MS);
    setInterval(step, STEP_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
