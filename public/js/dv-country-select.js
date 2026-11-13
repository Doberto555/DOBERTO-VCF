/* DOBERTO VCF - selektè peyi (rechèch + drapo) pou "Mon profil" */
(function () {
  'use strict';
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function injectCss() {
    if (document.getElementById('dvcs-css')) return;
    var st = document.createElement('style');
    st.id = 'dvcs-css';
    st.textContent =
      '.dvcs{position:relative;flex:none;min-width:150px}' +
      '.dvcs-btn{display:flex;align-items:center;gap:9px;width:100%;box-sizing:border-box;text-align:left;cursor:pointer;appearance:none;-webkit-appearance:none}' +
      '.dvcs-btn .lb{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.dvcs-btn .cv{opacity:.7;font-size:11px}' +
      '.dvcs-fl{width:20px;height:14px;border-radius:2px;object-fit:cover;flex:none}' +
      '.dvcs-panel{position:fixed;z-index:99999;border:1px solid rgba(255,255,255,.14);border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.6);overflow:hidden;display:none}' +
      '.dvcs-panel.open{display:block}' +
      '.dvcs-panel .dvcs-q{display:block;width:100%!important;height:auto!important;margin:0!important;box-sizing:border-box;padding:13px 15px!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.12)!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:#e8fff5!important;font:inherit;outline:none}' +
      '.dvcs-panel .dvcs-q::placeholder{color:rgba(232,255,245,.5)}' +
      '.dvcs-ul{max-height:270px;overflow-y:auto;margin:0;padding:6px;list-style:none}' +
      '.dvcs-li{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;cursor:pointer}' +
      '.dvcs-li:hover,.dvcs-li.act{background:rgba(255,255,255,.09)}' +
      '.dvcs-li.sel{background:rgba(45,212,160,.18)}' +
      '.dvcs-li .nm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.dvcs-li .dc{opacity:.7;font-variant-numeric:tabular-nums}' +
      '.dvcs-none{padding:16px;text-align:center;opacity:.6}';
    document.head.appendChild(st);
  }
  function flag(iso) {
    var i = document.createElement('img');
    i.className = 'dvcs-fl'; i.alt = ''; i.loading = 'lazy';
    i.src = 'https://flagcdn.com/w20/' + String(iso || '').toLowerCase() + '.png';
    i.onerror = function () { i.style.visibility = 'hidden'; };
    return i;
  }
  function build(sel) {
    injectCss();
    var cs = getComputedStyle(sel);
    var bg = cs.backgroundColor;
    if (!bg || /rgba\(0, 0, 0, 0\)|transparent/.test(bg)) bg = '#0f1d19';
    var wrap = document.createElement('div');
    wrap.className = 'dvcs';
    var w = parseFloat(cs.width);
    if (w > 0) wrap.style.width = w + 'px'; else wrap.style.width = '170px';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = (sel.className || '') + ' dvcs-btn';
    btn.style.background = bg;
    btn.style.color = cs.color;
    btn.style.border = cs.border;
    btn.style.borderRadius = cs.borderRadius;
    btn.style.padding = cs.padding;
    btn.style.fontFamily = cs.fontFamily;
    btn.style.fontSize = cs.fontSize;
    btn.style.fontWeight = cs.fontWeight;
    var h = parseFloat(cs.height); if (h > 0) btn.style.height = h + 'px';
    var panel = document.createElement('div');
    panel.className = 'dvcs-panel';
    panel.style.background = '#0d1a16'; panel.style.color = '#e8fff5';
    panel.style.fontFamily = cs.fontFamily; panel.style.fontSize = cs.fontSize;
    var q = document.createElement('input');
    q.type = 'text'; q.className = 'dvcs-q'; q.autocomplete = 'off';
    q.placeholder = 'Chèche yon peyi / Rechercher un pays';
    var ul = document.createElement('ul'); ul.className = 'dvcs-ul';
    panel.appendChild(q); panel.appendChild(ul);
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(btn); wrap.appendChild(sel);
    document.body.appendChild(panel);
    sel.style.display = 'none';

    var st = { getList: null, shown: [], act: -1 };

    function cur() {
      var l = st.getList() || [];
      return l[Number(sel.value) || 0] || l[0] || { iso: 'HT', dial: '509', name: 'Ayiti' };
    }
    function renderBtn() {
      var c = cur();
      btn.innerHTML = '';
      btn.appendChild(flag(c.iso));
      var lb = document.createElement('span'); lb.className = 'lb'; lb.textContent = c.iso + ' +' + c.dial;
      var cv = document.createElement('span'); cv.className = 'cv'; cv.textContent = '\u25BE';
      btn.appendChild(lb); btn.appendChild(cv);
    }
    function renderList() {
      var l = st.getList() || [], cidx = Number(sel.value) || 0;
      ul.innerHTML = '';
      if (!st.shown.length) {
        var e = document.createElement('li'); e.className = 'dvcs-none'; e.textContent = 'Pa gen rezilta'; ul.appendChild(e); return;
      }
      st.shown.forEach(function (it, k) {
        var li = document.createElement('li');
        li.className = 'dvcs-li' + (it.i === cidx ? ' sel' : '') + (k === st.act ? ' act' : '');
        li.appendChild(flag(it.c.iso));
        var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = it.c.name;
        var dc = document.createElement('span'); dc.className = 'dc'; dc.textContent = '+' + it.c.dial;
        li.appendChild(nm); li.appendChild(dc);
        li.addEventListener('mousedown', function (ev) { ev.preventDefault(); choose(it.i); });
        ul.appendChild(li);
      });
    }
    function filter() {
      var l = st.getList() || [], f = norm(q.value).replace(/^\+/, '').trim();
      st.shown = [];
      l.forEach(function (c, i) {
        if (!f || norm(c.name).indexOf(f) > -1 || norm(c.iso) === f || String(c.dial).indexOf(f) === 0) st.shown.push({ c: c, i: i });
      });
      st.act = st.shown.length ? 0 : -1;
      renderList();
    }
    function choose(i) {
      sel.value = String(i);
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      renderBtn(); close();
    }
    function place() {
      var r = btn.getBoundingClientRect();
      var pw = Math.min(330, window.innerWidth - 16);
      panel.style.width = pw + 'px';
      panel.style.left = Math.max(8, Math.min(r.left, window.innerWidth - pw - 8)) + 'px';
      var vv = window.visualViewport, vb = vv ? vv.offsetTop + vv.height : window.innerHeight, below = vb - r.bottom, above = r.top - (vv ? vv.offsetTop : 0), up = (below < 330 && above > below); ul.style.maxHeight = Math.max(120, Math.min(270, (up ? above : below) - 80)) + 'px';
      if (up) { panel.style.top = 'auto'; panel.style.bottom = (window.innerHeight - r.top + 6) + 'px'; }
      else { panel.style.bottom = 'auto'; panel.style.top = (r.bottom + 6) + 'px'; }
    }
    function open() {
      q.value = ''; filter(); place();
      panel.classList.add('open');
      setTimeout(function () { try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); } var s = ul.querySelector('.sel'); if (s) ul.scrollTop = Math.max(0, s.offsetTop - ul.offsetTop - ul.clientHeight / 2); }, 0);
    }
    function close() { panel.classList.remove('open'); }
    btn.addEventListener('click', function () { panel.classList.contains('open') ? close() : open(); });
    q.addEventListener('input', filter);
    q.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { close(); btn.focus(); }
      else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault(); if (!st.shown.length) return;
        st.act = (st.act + (ev.key === 'ArrowDown' ? 1 : -1) + st.shown.length) % st.shown.length;
        renderList(); var a = ul.querySelector('.act'); if (a) { var tp = a.offsetTop - ul.offsetTop; if (tp < ul.scrollTop) ul.scrollTop = tp; else if (tp + a.offsetHeight > ul.scrollTop + ul.clientHeight) ul.scrollTop = tp + a.offsetHeight - ul.clientHeight; }
      } else if (ev.key === 'Enter') {
        ev.preventDefault(); if (st.shown[st.act]) choose(st.shown[st.act].i);
      }
    });
    document.addEventListener('mousedown', function (ev) { if (!panel.contains(ev.target) && !btn.contains(ev.target)) close(); });
    function repos() { if (panel.classList.contains('open')) place(); }
    window.addEventListener('resize', repos);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', repos);
    window.addEventListener('scroll', function (ev) { if (!panel.contains(ev.target)) repos(); }, true);
    sel.addEventListener('change', renderBtn);
    st.render = renderBtn;
    return st;
  }
  window.dvCountrySelect = function (sel, getList) {
    if (!sel) return;
    var st = sel._dvcs;
    if (!st) { st = sel._dvcs = build(sel); }
    st.getList = getList;
    st.render();
  };
})();
