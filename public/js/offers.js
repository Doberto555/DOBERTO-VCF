/* DOBERTO VCF - section Offres (Gratis / Premium V.I.P). Pa touche lòt kòd sou index.html */
(function () {
  'use strict';
  if (window.__dvOffers) return;
  window.__dvOffers = true;

  var PAY_OPEN = false;   // mete true lè Tranzak Live mache
  var PRICE = '350';      // sèlman pou afichaj; vrè pri a sòti nan sèvè a (VIP_PRICE_HTG)
  var REF_KEY = 'dv_vip_ref';
  var VIP = 'V.I.P \uD83D\uDC51';

  var T = {
    ht: {
      nav: 'Ofri', eyebrow: 'OFRI',
      title: 'Kòmanse gratis. <span class="dvo-hl">Pase Premium.</span>',
      sub: 'Kòmanse gratis oswa chwazi Premium pou 30 jou. Renouvle lè w vle kenbe avantaj yo.',
      freeName: 'Gratis', freeBadge: 'POU TOUJOU',
      freeDesc: 'Tout sa w bezwen pou jwenn nouvo kontak.',
      free: ['Ajout otomatik nan Google Contacts chak 15 minit', 'Non ou parèt nan kontak yo ak prefiks sit la', 'Tablo bò, lis manm ak siyalman'],
      freeCta: 'Kreye yon kont gratis', dash: 'Tablo bò',
      vipBadge: PRICE + ' GDES \u00B7 30 JOU',
      vipDesc: 'Peye ak MonCash oswa NatCash. Renouvle lè w vle.',
      vip: ['Non ou parèt ak ' + VIP + ' nan kontak yo', 'Sync chak 5 minit (olye 15)', 'Pa gen pub sou sit la', 'Jou yo ajoute sou sa w deja genyen lè w renouvle'],
      go: 'Vin Premium', renew: 'Renouvle Premium', soon: 'Byento',
      active: 'Premium aktif jiska ', pick: 'Chwazi kijan pou w peye', cancel: 'Anile',
      redirecting: 'Ap louvri peman an...', checking: 'Ap verifye peman an...',
      paid: 'Premium aktive! Mèsi.',
      later: 'Si ou peye, li ka pran kèk minit. Rechaje paj la pita.',
      notpaid: 'Peman an pa fini.',
      err: {
        no_registration: 'Enskri anvan w vin Premium.',
        too_many: 'Tann kèk minit epi eseye ankò.',
        pay_not_configured: 'Peman poko disponib. Eseye pita.',
        pay_create_failed: 'Peman an pa t kreye. Eseye ankò.',
        login: 'Konekte anvan w peye.',
        default: 'Yon erè rive. Eseye ankò.'
      }
    },
    fr: {
      nav: 'Offres', eyebrow: 'OFFRES',
      title: 'Commencez gratuitement. <span class="dvo-hl">Passez à Premium.</span>',
      sub: 'Commencez gratuitement ou choisissez Premium pour 30 jours. Renouvelez quand vous voulez garder les avantages.',
      freeName: 'Gratuit', freeBadge: 'POUR TOUJOURS',
      freeDesc: 'Tout ce qu\u2019il faut pour trouver de nouveaux contacts.',
      free: ['Ajout automatique dans Google Contacts toutes les 15 minutes', 'Votre nom apparaît dans les contacts avec le préfixe du site', 'Tableau de bord, liste des membres et signalements'],
      freeCta: 'Créer un compte gratuit', dash: 'Tableau de bord',
      vipBadge: PRICE + ' GDES \u00B7 30 JOURS',
      vipDesc: 'Payez avec MonCash ou NatCash. Renouvelez quand vous voulez.',
      vip: ['Votre nom porte la mention ' + VIP + ' dans les contacts', 'Synchronisation toutes les 5 minutes (au lieu de 15)', 'Aucune publicité sur le site', 'Les jours s\u2019ajoutent à ceux que vous avez déjà quand vous renouvelez'],
      go: 'Passer à Premium', renew: 'Renouveler Premium', soon: 'Bientôt disponible',
      active: 'Premium actif jusqu\u2019au ', pick: 'Choisissez comment payer', cancel: 'Annuler',
      redirecting: 'Ouverture du paiement...', checking: 'Vérification du paiement...',
      paid: 'Premium activé ! Merci.',
      later: 'Si vous avez payé, cela peut prendre quelques minutes. Rechargez la page plus tard.',
      notpaid: 'Le paiement n\u2019a pas abouti.',
      err: {
        no_registration: 'Inscrivez-vous avant de passer Premium.',
        too_many: 'Attendez quelques minutes puis réessayez.',
        pay_not_configured: 'Le paiement n\u2019est pas encore disponible. Réessayez plus tard.',
        pay_create_failed: 'Le paiement n\u2019a pas pu être créé. Réessayez.',
        login: 'Connectez-vous avant de payer.',
        default: 'Une erreur est survenue. Réessayez.'
      }
    },
    en: {
      nav: 'Offers', eyebrow: 'OFFERS',
      title: 'Start free. <span class="dvo-hl">Go Premium.</span>',
      sub: 'Start for free or pick Premium for 30 days. Renew whenever you want to keep the perks.',
      freeName: 'Free', freeBadge: 'FOREVER',
      freeDesc: 'Everything you need to find new contacts.',
      free: ['Automatic add to Google Contacts every 15 minutes', 'Your name shows in contacts with the site prefix', 'Dashboard, member list and reports'],
      freeCta: 'Create a free account', dash: 'Dashboard',
      vipBadge: PRICE + ' GDES \u00B7 30 DAYS',
      vipDesc: 'Pay with MonCash or NatCash. Renew any time.',
      vip: ['Your name shows ' + VIP + ' in contacts', 'Sync every 5 minutes (instead of 15)', 'No ads on the site', 'Days stack on top of what you already have when you renew'],
      go: 'Go Premium', renew: 'Renew Premium', soon: 'Coming soon',
      active: 'Premium active until ', pick: 'Choose how to pay', cancel: 'Cancel',
      redirecting: 'Opening the payment page...', checking: 'Checking your payment...',
      paid: 'Premium activated! Thank you.',
      later: 'If you paid, it can take a few minutes. Reload the page later.',
      notpaid: 'The payment did not go through.',
      err: {
        no_registration: 'Register before going Premium.',
        too_many: 'Wait a few minutes and try again.',
        pay_not_configured: 'Payments are not available yet. Try again later.',
        pay_create_failed: 'The payment could not be created. Try again.',
        login: 'Sign in before paying.',
        default: 'Something went wrong. Try again.'
      }
    }
  };

  var sec = null, box = null, cur = null;
  var state = { logged: false, vip: false, until: null, open: false, busy: false, msg: null, kind: '' };

  function mk(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function token() { try { return localStorage.getItem('dv_auth_token') || ''; } catch (e) { return ''; } }
  function lang() {
    if (cur && T[cur]) return cur;
    var l = '';
    try { l = (localStorage.getItem('doberto_lang') || '').slice(0, 2).toLowerCase(); } catch (e) {}
    if (!T[l]) l = (document.documentElement.getAttribute('lang') || '').slice(0, 2).toLowerCase();
    return T[l] ? l : 'ht';
  }
  function fmtDate(L) {
    try { return new Date(state.until).toLocaleDateString(L === 'en' ? 'en-GB' : 'fr-FR'); } catch (e) { return ''; }
  }
  function setMsg(k, kind, c) { state.msg = k ? { k: k, c: c } : null; state.kind = kind || ''; }
  function msgText(t) {
    if (!state.msg) return '';
    if (state.msg.k === 'err') return t.err[state.msg.c] || t.err.default;
    return t[state.msg.k] || '';
  }
  function list(items) {
    var ul = mk('ul', 'dvo-list');
    items.forEach(function (s) { ul.appendChild(mk('li', '', s)); });
    return ul;
  }

  function freeCard(t) {
    var c = mk('article', 'dvo-card');
    var hd = mk('div', 'dvo-head');
    hd.appendChild(mk('h3', 'dvo-name', t.freeName));
    hd.appendChild(mk('span', 'dvo-badge', t.freeBadge));
    c.appendChild(hd);
    c.appendChild(mk('p', 'dvo-desc', t.freeDesc));
    c.appendChild(list(t.free));
    var act = mk('div', 'dvo-actions');
    var a = mk('a', 'dvo-btn light', state.logged ? t.dash : t.freeCta);
    a.href = state.logged ? 'dashboard.html' : 'register.html';
    act.appendChild(a);
    c.appendChild(act);
    return c;
  }

  function vipCard(t, L) {
    var c = mk('article', 'dvo-card dvo-gold');
    var hd = mk('div', 'dvo-head');
    var h3 = mk('h3', 'dvo-name');
    h3.appendChild(document.createTextNode('Premium '));
    h3.appendChild(mk('span', '', '(V.I.P)'));
    hd.appendChild(h3);
    hd.appendChild(mk('span', 'dvo-badge', t.vipBadge));
    c.appendChild(hd);
    c.appendChild(mk('p', 'dvo-desc', t.vipDesc));
    c.appendChild(list(t.vip));
    if (state.vip && state.until) c.appendChild(mk('p', 'dvo-until', t.active + fmtDate(L)));

    var act = mk('div', 'dvo-actions');
    if (!PAY_OPEN) {
      var d = mk('button', 'dvo-btn', t.soon);
      d.type = 'button'; d.disabled = true;
      act.appendChild(d);
    } else if (!state.logged) {
      var a = mk('a', 'dvo-btn light', t.go);
      a.href = 'register.html';
      act.appendChild(a);
    } else if (!state.open) {
      var b = mk('button', 'dvo-btn light', state.vip ? t.renew : t.go);
      b.type = 'button';
      b.addEventListener('click', function () { state.open = true; setMsg(null); paint(); });
      act.appendChild(b);
    } else {
      act.appendChild(mk('p', 'dvo-until', t.pick));
      var pick = mk('div', 'dvo-pick');
      [['moncash', 'MonCash'], ['natcash', 'NatCash']].forEach(function (m) {
        var pb = mk('button', 'dvo-btn light', m[1]);
        pb.type = 'button'; pb.disabled = state.busy;
        pb.addEventListener('click', function () { pay(m[0]); });
        pick.appendChild(pb);
      });
      act.appendChild(pick);
      var cx = mk('button', 'dvo-cancel', t.cancel);
      cx.type = 'button'; cx.disabled = state.busy;
      cx.addEventListener('click', function () { state.open = false; paint(); });
      act.appendChild(cx);
    }
    c.appendChild(act);
    return c;
  }

  function paint() {
    if (!box) return;
    var L = lang(), t = T[L];
    box.textContent = '';
    box.appendChild(mk('div', 'dvo-eyebrow', t.eyebrow));
    var h = mk('h2', 'dvo-title');
    h.innerHTML = t.title;
    box.appendChild(h);
    box.appendChild(mk('p', 'dvo-sub', t.sub));
    var mt = msgText(t);
    if (mt) {
      var bn = mk('div', 'dvo-banner ' + state.kind, mt);
      bn.setAttribute('role', 'status');
      box.appendChild(bn);
    }
    var grid = mk('div', 'dvo-grid');
    grid.appendChild(freeCard(t));
    grid.appendChild(vipCard(t, L));
    box.appendChild(grid);
    [].forEach.call(document.querySelectorAll('[data-dvo]'), function (a) { a.textContent = t.nav; });
  }

  function pay(method) {
    if (state.busy) return;
    if (!token()) { setMsg('err', 'err', 'login'); paint(); return; }
    state.busy = true; setMsg('redirecting', 'info'); paint();
    fetch('/api/vip/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + token() },
      body: JSON.stringify({ method: method }),
      cache: 'no-store'
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j || {} }; });
    }).then(function (x) {
      var j = x.j;
      if (x.status === 200 && j.ok && typeof j.paymentUrl === 'string' && /^https:\/\//i.test(j.paymentUrl)) {
        try { localStorage.setItem(REF_KEY, JSON.stringify({ r: j.reference, t: Date.now() })); } catch (e) {}
        window.location.href = j.paymentUrl;
        return;
      }
      state.busy = false;
      setMsg('err', 'err', x.status === 401 ? 'login' : j.code);
      paint();
    }).catch(function () {
      state.busy = false; setMsg('err', 'err', 'default'); paint();
    });
  }

  function clearRef() { try { localStorage.removeItem(REF_KEY); } catch (e) {} }

  function loadStatus() {
    if (!state.logged) return Promise.resolve();
    return fetch('/api/vip/status', { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token() }, cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.ok) { state.vip = !!j.vip; state.until = j.vipUntil || null; } })
      .catch(function () {});
  }

  function checkReturn() {
    var raw = '';
    try { raw = localStorage.getItem(REF_KEY) || ''; } catch (e) {}
    if (!raw || !token()) return;
    var o = null;
    try { o = JSON.parse(raw); } catch (e) {}
    if (!o || !/^VIP-[a-f0-9]{18}$/.test(String(o.r || '')) || !o.t || Date.now() - o.t > 2 * 3600 * 1000) { clearRef(); return; }
    var tries = 0;
    (function poll() {
      tries++;
      fetch('/api/vip/payment/' + o.r, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token() }, cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (j) {
          if (j.status === 'paid') {
            clearRef(); setMsg('paid', 'ok');
            loadStatus().then(paint);
          } else if (j.status === 'pending') {
            if (tries < 8) { setMsg('checking', 'info'); paint(); setTimeout(poll, 5000); }
            else { setMsg('later', 'info'); paint(); }
          } else {
            clearRef(); setMsg('notpaid', 'err'); paint();
          }
        })
        .catch(function (st) { if (st === 404 || st === 400) clearRef(); });
    })();
  }

  function addNav() {
    var t = T[lang()];
    var links = document.querySelector('.nav .links');
    if (links && !links.querySelector('[data-dvo]')) {
      var a = mk('a', '', t.nav);
      a.href = '#offres'; a.setAttribute('data-dvo', '1');
      links.insertBefore(a, links.querySelector('a[href="#faq"]') || null);
    }
    var menu = document.getElementById('dvMenu');
    if (menu && !menu.querySelector('[data-dvo]')) {
      var ml = menu.querySelectorAll('.m-link');
      if (ml.length) {
        var faq = null;
        [].forEach.call(ml, function (x) { if ((x.getAttribute('href') || '') === '#faq') faq = x; });
        var cl = ml[ml.length - 1].cloneNode(true);
        cl.removeAttribute('data-i'); cl.removeAttribute('data-h');
        cl.setAttribute('data-dvo', '1'); cl.setAttribute('href', '#offres');
        cl.textContent = t.nav;
        cl.addEventListener('click', function () { var x = menu.querySelector('.m-x'); if (x) x.click(); });
        if (faq) faq.parentNode.insertBefore(cl, faq);
        else ml[ml.length - 1].parentNode.insertBefore(cl, ml[ml.length - 1].nextSibling);
      }
    }
  }

  function init() {
    var faq = document.getElementById('faq');
    var host = faq && faq.parentNode;
    if (!host) { host = document.querySelector('main') || document.body; faq = null; }
    sec = mk('section', 'dvo');
    sec.id = 'offres';
    sec.setAttribute('data-keep-punct', '');
    var wrap = mk('div', 'wrap');
    box = mk('div');
    wrap.appendChild(box); sec.appendChild(wrap);
    host.insertBefore(sec, faq);

    state.logged = !!token();
    addNav();
    paint();
    loadStatus().then(paint);
    checkReturn();

    document.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('.lang button, .m-lg button') : null;
      if (!b) return;
      setTimeout(function () {
        var l = b.getAttribute('data-l');
        cur = T[l] ? l : null;
        paint();
      }, 0);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
