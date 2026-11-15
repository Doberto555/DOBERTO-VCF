/* DOBERTO VCF - dashboard: dock + sheet "Plus" (style Shizzy). Pa touche dock ki egziste a, li kache l sou telefòn. */
(() => {
  'use strict';
  if (window.__DV_DOCK__) return;
  window.__DV_DOCK__ = true;

  const P = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    users: '<path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 20v-1a4 4 0 0 0-3-3.9M16 4.1a3.5 3.5 0 0 1 0 6.8"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>'
  };
  const T = {
    ht: { overview: 'Apèsi', profile: 'Pwofil mwen', sync: 'Ajout otomatik', promotion: 'Pwomosyon', premium: 'Premium', more: 'Plis', members: 'Manm yo', reports: 'Rapò', account: 'Kont', privacy: 'Konfidansyalite', terms: 'Kondisyon', about: 'Sou nou', home: 'Akèy' },
    fr: { overview: 'Aperçu', profile: 'Mon profil', sync: 'Ajout automatique', promotion: 'Promotion', premium: 'Premium', more: 'Plus', members: 'Membres', reports: 'Signalement', account: 'Compte', privacy: 'Confidentialité', terms: 'Conditions', about: 'À propos', home: 'Accueil' },
    en: { overview: 'Overview', profile: 'My profile', sync: 'Auto-add', promotion: 'Promotion', premium: 'Premium', more: 'More', members: 'Members', reports: 'Report', account: 'Account', privacy: 'Privacy', terms: 'Terms', about: 'About', home: 'Home' }
  };
  const DOCK = [
    { k: 'overview', href: 'dashboard.html', tab: '', i: 'grid' },
    { k: 'profile', href: 'dashboard.html?tab=profile', tab: 'profile', i: 'user' },
    { k: 'sync', href: 'dashboard.html?tab=sync', tab: 'sync', i: 'bolt' },
    { k: 'promotion', href: 'dashboard.html?tab=promotion', tab: 'promotion', i: 'gift' }
  ];
  const SHEET = [
    { k: 'premium', href: 'dashboard.html?tab=premium', tab: 'premium', i: 'card' },
    { k: 'members', href: 'list.html', i: 'users' },
    { k: 'reports', href: 'dashboard.html?tab=reports', tab: 'reports', i: 'flag' },
    { k: 'account', href: 'dashboard.html?tab=account', tab: 'account', i: 'gear' },
    { k: 'privacy', href: 'privacy.html', i: 'shield' },
    { k: 'terms', href: 'terms.html', i: 'file' },
    { k: 'about', href: 'about.html', i: 'info' },
    { k: 'home', href: 'index.html', i: 'home' }
  ];

  const lang = () => {
    for (const k of ['doberto_lang', 'dv_lang', 'lang', 'language']) {
      try { const v = (localStorage.getItem(k) || '').slice(0, 2).toLowerCase(); if (T[v]) return v; } catch (_) {}
    }
    const h = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    return T[h] ? h : 'fr';
  };
  const t = (k) => (T[lang()] && T[lang()][k]) || T.fr[k] || k;
  const svg = (n) => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + P[n] + '</svg>';
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  const cur = new URLSearchParams(location.search).get('tab') || '';
  const inDock = DOCK.some((d) => d.tab === cur);
  const refs = [];
  let moreBtn, back, sheet, avatar, nameEl, mailEl, lastFocus = null;

  function label(node, key) { refs.push([node, key]); node.textContent = t(key); }
  function link(item, cls) {
    const a = el('a', cls); a.href = item.href; a.innerHTML = svg(item.i);
    const s = el('span'); label(s, item.k); a.appendChild(s);
    if (item.tab !== undefined && item.tab === cur) { a.classList.add('on'); a.setAttribute('aria-current', 'page'); }
    return a;
  }
  function build() {
    const dock = el('nav', 'dvx-dock'); dock.setAttribute('aria-label', 'Navigation principale');
    DOCK.forEach((d) => dock.appendChild(link(d, 'dvx-tab')));
    moreBtn = el('button', 'dvx-tab' + (inDock ? '' : ' on')); moreBtn.type = 'button';
    moreBtn.setAttribute('aria-haspopup', 'dialog'); moreBtn.setAttribute('aria-expanded', 'false');
    moreBtn.innerHTML = svg('menu'); const ms = el('span'); label(ms, 'more'); moreBtn.appendChild(ms);
    dock.appendChild(moreBtn);

    back = el('div', 'dvx-back');
    sheet = el('div', 'dvx-sheet'); sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'Menu');
    const grab = el('div', 'dvx-grab'); grab.appendChild(el('i')); sheet.appendChild(grab);
    const head = el('div', 'dvx-head'); avatar = el('div', 'dvx-av', 'D');
    const who = el('div', 'dvx-who'); nameEl = el('strong', null, 'DOBERTO VCF'); mailEl = el('span', null, '');
    who.appendChild(nameEl); who.appendChild(mailEl); head.appendChild(avatar); head.appendChild(who); sheet.appendChild(head);
    const list = el('div', 'dvx-list'); SHEET.forEach((s) => list.appendChild(link(s, 'dvx-item'))); sheet.appendChild(list);

    document.body.appendChild(dock); document.body.appendChild(back); document.body.appendChild(sheet);
    document.body.classList.add('dvx-on');
  }

  function applyLang() { refs.forEach((r) => { r[0].textContent = t(r[1]); }); }
  function open() {
    lastFocus = document.activeElement; applyLang();
    document.documentElement.classList.add('dvx-open'); document.documentElement.style.overflow = 'hidden';
    moreBtn.setAttribute('aria-expanded', 'true');
    const f = sheet.querySelector('a'); if (f) setTimeout(() => { try { f.focus({ preventScroll: true }); } catch (_) {} }, 80);
  }
  function close() {
    document.documentElement.classList.remove('dvx-open'); document.documentElement.style.overflow = '';
    moreBtn.setAttribute('aria-expanded', 'false'); sheet.style.transform = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (_) {} }
  }
  function drag() {
    const g = sheet.querySelector('.dvx-grab'); let y0 = null, dy = 0;
    g.addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; dy = 0; sheet.style.transition = 'none'; }, { passive: true });
    g.addEventListener('touchmove', (e) => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); sheet.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
    g.addEventListener('touchend', () => {
      if (y0 === null) return;
      sheet.style.transition = ''; const d = dy; y0 = null; dy = 0;
      if (d > 80) close(); else sheet.style.transform = '';
    });
  }
  function setWho(w) {
    const nm = (w.name || '').trim(), em = (w.email || '').trim();
    nameEl.textContent = nm || (em ? em.split('@')[0] : '') || 'DOBERTO VCF';
    mailEl.textContent = em;
    avatar.textContent = ((nm || em || 'D').charAt(0) || 'D').toUpperCase();
  }
  function pick(o, ks) {
    if (!o || typeof o !== 'object') return '';
    for (const k of ks) { if (typeof o[k] === 'string' && o[k].trim()) return o[k]; }
    return '';
  }
  async function whoami() {
    let tk = ''; try { tk = localStorage.getItem('dv_auth_token') || ''; } catch (_) {}
    if (!tk) return;
    try {
      const r = await fetch('/api/auth/session', { headers: { Authorization: 'Bearer ' + tk, Accept: 'application/json' }, cache: 'no-store' });
      if (!r.ok) return;
      const d = await r.json();
      const u = (d && (d.user || d.session || d.profile)) || d || {};
      setWho({
        name: pick(u, ['name', 'display_name', 'displayName', 'full_name', 'fullName']) || pick(d, ['name', 'display_name', 'displayName', 'full_name']),
        email: pick(u, ['email']) || pick(d, ['email'])
      });
    } catch (_) {}
  }
  function boot() {
    if (!document.body || document.querySelector('.dvx-dock')) return;
    build();
    moreBtn.addEventListener('click', (e) => { e.stopPropagation(); open(); });
    back.addEventListener('click', close);
    sheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 860) close(); });
    window.addEventListener('storage', applyLang);
    try { new MutationObserver(applyLang).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] }); } catch (_) {}
    drag(); whoami();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
