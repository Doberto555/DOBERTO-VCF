/* DOBERTO VCF - onglet Premium (dashboard.html?tab=premium): style Shizzy, peman MonCash / NatCash (Tranzak) via /api/vip/checkout. */
(function () {
  'use strict';
  if (new URLSearchParams(location.search).get('tab') !== 'premium') return;
  var main = document.querySelector('main');
  if (!main) return;

  var PRICE = '350'; // afichaj sèlman; vrè pri a sòti nan sèvè a (VIP_PRICE_HTG)
  var PRICE_USD = 2.7; // afichaj sèlman; vrè pri a = VIP_PRICE_USD sou sèvè a
  var DAYS = '30';
  var REF_KEY = 'dv_vip_ref';
  var VIP = 'V.I.P 👑';

  var T = {
    fr: {
      title: 'Premium', tag: 'DOBERTO VCF · FORFAIT', why: 'Pourquoi choisir Premium ?',
      lead: 'Affichez la mention ' + VIP + ' avec votre nom, synchronisez plus vite et naviguez sans publicité.',
      free: 'Forfait Gratuit', active: 'Premium actif', until: 'Actif jusqu’au ',
      per: 'pour ' + DAYS + ' jours', planLine: 'Premium · ' + DAYS + ' jours',
      advTitle: 'Les avantages de Premium',
      adv: [
        ['Nom avec la mention VIP', 'Quand un membre ajoute votre contact, votre nom apparaît avec ' + VIP + '.'],
        ['Synchronisation rapide', 'Ajout automatique toutes les 5 minutes (au lieu de 15).'],
        ['Aucune publicité', 'Plus de pub sur le site tant que Premium est actif.'],
        ['Jours cumulés', 'Si vous renouvelez, les jours s’ajoutent à ceux que vous avez déjà.']
      ],
      payKicker: 'PAIEMENT', payTitle: 'Sélectionnez un moyen de paiement',
      payLead: 'Chaque paiement donne ' + DAYS + ' jours d’accès. Le forfait ne se renouvelle pas automatiquement.',
      htg: 'Paiement en gourdes haïtiennes', card: 'Carte bancaire (Visa, Mastercard) · USD',
      checkTitle: 'Vérifiez avant de payer',
      checkBody: 'Avant de payer, vérifiez le moyen choisi, le total et les frais affichés.',
      go: 'Continuer vers le paiement', renew: 'Renouveler Premium',
      note1: 'Premium démarre après la confirmation du paiement.',
      note2: 'Le forfait Gratuit reste disponible si Premium expire.',
      needLogin: 'Connectez-vous avec Google pour passer à Premium.',
      redirect: 'Redirection vers le paiement…', checking: 'Vérification du paiement…',
      paid: 'Paiement confirmé ✓ Premium est actif.',
      errors: { pay_not_configured: 'Le paiement n’est pas encore prêt.', no_registration: 'Complétez d’abord votre profil.', too_many: 'Attendez quelques minutes puis réessayez.', bad_method: 'Moyen de paiement invalide.' },
      fail: 'Une erreur est survenue. Réessayez.'
    },
    ht: {
      title: 'Premium', tag: 'DOBERTO VCF · FÒFÈ', why: 'Poukisa chwazi Premium ?',
      lead: 'Montre mansyon ' + VIP + ' ak non ou, senkronize pi vit epi navige san piblisite.',
      free: 'Fòfè Gratis', active: 'Premium aktif', until: 'Aktif jiska ',
      per: 'pou ' + DAYS + ' jou', planLine: 'Premium · ' + DAYS + ' jou',
      advTitle: 'Avantaj Premium yo',
      adv: [
        ['Non ak mansyon VIP', 'Lè yon manm ajoute kontak ou, non ou parèt ak ' + VIP + '.'],
        ['Senkronizasyon rapid', 'Ajout otomatik chak 5 minit (olye 15).'],
        ['Pa gen piblisite', 'Pa gen pub sou sit la toutotan Premium aktif.'],
        ['Jou ki kimile', 'Si w renouvle, jou yo ajoute sou sa w deja genyen.']
      ],
      payKicker: 'PEMAN', payTitle: 'Chwazi yon mwayen peman',
      payLead: 'Chak peman bay ' + DAYS + ' jou aksè. Fòfè a pa renouvle otomatikman.',
      htg: 'Peman an goud ayisyen', card: 'Kat labank (Visa, Mastercard) · USD',
      checkTitle: 'Verifye anvan ou peye',
      checkBody: 'Anvan ou peye, verifye mwayen ou chwazi a, total la ak frè yo ki afiche.',
      go: 'Kontinye nan peman', renew: 'Renouvle Premium',
      note1: 'Premium kòmanse apre konfimasyon peman an.',
      note2: 'Fòfè Gratis la rete disponib si Premium ekspire.',
      needLogin: 'Konekte ak Google pou w pase Premium.',
      redirect: 'N ap voye w sou peman an…', checking: 'N ap verifye peman an…',
      paid: 'Peman konfime ✓ Premium aktif.',
      errors: { pay_not_configured: 'Peman an poko pare.', no_registration: 'Konplete pwofil ou dabò.', too_many: 'Tann kèk minit epi eseye ankò.', bad_method: 'Mwayen peman pa valid.' },
      fail: 'Yon erè rive. Eseye ankò.'
    },
    en: {
      title: 'Premium', tag: 'DOBERTO VCF · PLAN', why: 'Why choose Premium?',
      lead: 'Show the ' + VIP + ' mark with your name, sync faster and browse without ads.',
      free: 'Free plan', active: 'Premium active', until: 'Active until ',
      per: 'for ' + DAYS + ' days', planLine: 'Premium · ' + DAYS + ' days',
      advTitle: 'Premium benefits',
      adv: [
        ['Name with VIP mark', 'When a member adds your contact, your name shows ' + VIP + '.'],
        ['Faster sync', 'Auto-add every 5 minutes (instead of 15).'],
        ['No ads', 'No ads on the site while Premium is active.'],
        ['Days stack', 'If you renew, days add on top of what you already have.']
      ],
      payKicker: 'PAYMENT', payTitle: 'Select a payment method',
      payLead: 'Each payment gives ' + DAYS + ' days of access. The plan does not renew automatically.',
      htg: 'Payment in Haitian gourdes', card: 'Bank card (Visa, Mastercard) · USD',
      checkTitle: 'Check before you pay',
      checkBody: 'Before paying, check the chosen method, the total and the fees shown.',
      go: 'Continue to payment', renew: 'Renew Premium',
      note1: 'Premium starts after the payment is confirmed.',
      note2: 'The Free plan stays available if Premium expires.',
      needLogin: 'Sign in with Google to get Premium.',
      redirect: 'Redirecting to payment…', checking: 'Checking your payment…',
      paid: 'Payment confirmed ✓ Premium is active.',
      errors: { pay_not_configured: 'Payment is not ready yet.', no_registration: 'Complete your profile first.', too_many: 'Wait a few minutes and try again.', bad_method: 'Invalid payment method.' },
      fail: 'Something went wrong. Try again.'
    }
  };
  function lang() { try { var l = localStorage.getItem('doberto_lang'); return T[l] ? l : 'ht'; } catch (_) { return 'ht'; } }
  var L = lang(), t = T[L];
  function tok() { try { return localStorage.getItem('dv_auth_token') || ''; } catch (_) { return ''; } }

  // --- layout: kache aperçu a, make "Plus" aktif ---
  document.querySelectorAll('main > h1, main > .sub, main > .stats, main > .grid, main > .actions').forEach(function (e) { e.hidden = true; });
  var cur = document.querySelector('nav a.on'); if (cur) cur.classList.remove('on');
  var tOn = document.querySelector('.tabbar .tab.on'); if (tOn) tOn.classList.remove('on');
  var nv = document.getElementById('navPremium'); if (nv) nv.classList.add('on');
  var mb = document.getElementById('moreBtn'); if (mb) mb.classList.add('on');
  document.title = t.title + ' — DOBERTO VCF';

  var css = document.createElement('style');
  css.textContent =
    '.pv{max-width:760px;display:grid;gap:16px}' +
    '.pv .card{padding:18px}' +
    '.pv-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.pv-top>div{flex:1;min-width:0}' +
    '.pv-kick{font-size:11px;font-weight:800;letter-spacing:.14em;color:var(--sun)}' +
    '.pv h2{font-size:24px!important;line-height:1.15;letter-spacing:-.02em;margin:8px 0 8px}' +
    '.pv h3{font-size:18px;margin:0 0 12px}' +
    '.pv p{font-size:15px;line-height:1.5}' +
    '.pv p{color:var(--muted)}' +
    '.pv-badge{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:99px;padding:7px 12px;font-weight:700;font-size:13px;color:#cfe3d8;white-space:nowrap;flex:none}' +
    '.pv-badge.on{color:var(--sun);border-color:rgba(245,196,81,.45)}' +
    '.pv-price{margin-top:16px;border:1px solid var(--line);border-radius:16px;padding:16px;background:rgba(0,0,0,.25)}' +
    '.pv-price b{font-size:28px;letter-spacing:-.02em}.pv-price b span{font-size:14px;font-weight:500;color:var(--muted);margin-left:8px;letter-spacing:0}' +
    '.pv-price small{display:block;margin-top:8px;color:var(--sun);font-weight:700;font-size:13px}' +
    '.pv-adv{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '@media(max-width:340px){.pv-adv{grid-template-columns:1fr}}' +
    '.pv-a{border:1px solid var(--line);border-radius:16px;padding:14px}' +
    '.pv-a b{display:block;font-size:14px;margin-bottom:6px}.pv-a span{color:var(--muted);font-size:13px;line-height:1.45}' +
    '.pv-m{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;box-sizing:border-box;text-align:left;margin-top:12px;padding:16px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.02);color:inherit;font:inherit;cursor:pointer}' +
    '.pv-m .lg{flex:none;width:44px;height:44px;border-radius:12px;object-fit:contain;background:#fff;padding:4px;box-sizing:border-box}.pv-m .lgfb{display:grid;place-items:center;background:#e6002d;color:#fff;font-weight:900;font-size:15px}.pv-m .lgw{display:flex;align-items:center;gap:14px;min-width:0}' +
    '.pv-m.on{border-color:rgba(245,196,81,.6);background:rgba(245,196,81,.07)}' +
    '.pv-m b{display:block;font-size:17px}.pv-m em{display:block;font-style:normal;margin-top:10px;font-weight:800}' +
    '.pv-m small{display:block;color:var(--muted);font-size:13px;margin-top:10px}' +
    '.pv-m .dot{flex:none;width:28px;height:28px;border-radius:50%;border:1px solid var(--line);display:grid;place-items:center;font-weight:900;color:#1a1403}' +
    '.pv-m.on .dot{background:#f5c542;border-color:#f5c542}' +
    '.pv-warn{margin-top:14px;border:1px solid rgba(245,196,81,.3);border-radius:16px;padding:16px;background:rgba(245,196,81,.04)}' +
    '.pv-warn b{display:block;color:var(--sun);margin-bottom:6px}.pv-warn span{color:var(--muted);font-size:14px}' +
    '.pv-go{width:100%;margin-top:14px;padding:16px;border:0;border-radius:14px;font:inherit;font-weight:800;font-size:15px;color:#1a1403;background:linear-gradient(90deg,#fdf0b5,#fdd44a);cursor:pointer}' +
    '.pv-go:disabled{opacity:.55;cursor:not-allowed}' +
    '.pv-note{text-align:center;color:var(--muted);font-size:13px;margin-top:12px}' +
    '.pv-msg{margin-top:12px;padding:12px 14px;border-radius:12px;border:1px solid rgba(54,231,167,.3);color:var(--signal);font-size:14px}' +
    '.pv-msg.bad{border-color:rgba(245,196,81,.4);color:var(--sun)}' +
    '.pv-skel{border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.04);height:240px;animation:pvPulse 1.1s ease-in-out infinite alternate}.pv-skel.s{height:140px}@keyframes pvPulse{from{opacity:.45}to{opacity:1}}';
  document.head.appendChild(css);

  function el(tag, text, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null && text !== '') n.textContent = text;
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function add(p) { for (var i = 1; i < arguments.length; i++) if (arguments[i]) p.appendChild(arguments[i]); return p; }
  function fmtDate(iso) { try { return new Date(iso).toLocaleDateString(L === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (_) { return ''; } }

  var root = el('div', '', 'pv');
  var box = el('section', '', 'tsec', { id: 'premiumSec' }); box.style.maxWidth = 'none';
  add(box, root); main.appendChild(box);

  var state = { vip: false, until: null, method: 'moncash', busy: false, msg: '', bad: false };
  var msgEl = null;
  function say(text, bad) { state.msg = text || ''; state.bad = !!bad; if (msgEl) { msgEl.hidden = !text; msgEl.textContent = text || ''; msgEl.className = 'pv-msg' + (bad ? ' bad' : ''); } }

  function render() {
    root.textContent = '';
    // 1) plan
    var plan = el('div', '', 'card');
    var top = el('div', '', 'pv-top');
    var left = el('div');
    add(left, el('span', t.tag, 'pv-kick'), el('h2', t.why), el('p', t.lead));
    add(top, left, el('span', state.vip ? t.active : t.free, 'pv-badge' + (state.vip ? ' on' : '')));
    var price = el('div', '', 'pv-price');
    var pb = el('b', PRICE + ' GDES'); add(pb, el('span', t.per));
    add(price, pb, el('small', state.vip && state.until ? t.until + fmtDate(state.until) : t.planLine));
    add(plan, top, price); root.appendChild(plan);

    // 2) avantaj
    var adv = el('div', '', 'card'); adv.appendChild(el('h3', t.advTitle));
    var g = el('div', '', 'pv-adv');
    t.adv.forEach(function (a) { var c = el('div', '', 'pv-a'); add(c, el('b', a[0]), el('span', a[1])); g.appendChild(c); });
    adv.appendChild(g); root.appendChild(adv);

    // 3) peman
    var pay = el('div', '', 'card');
    add(pay, el('span', t.payKicker, 'pv-kick'), el('h2', t.payTitle), el('p', t.payLead));
    [['moncash', 'MonCash'], ['natcash', 'NatCash'], ['stripe', 'Stripe']].forEach(function (m) {
      var b = el('button', '', 'pv-m' + (state.method === m[0] ? ' on' : ''), { type: 'button', 'aria-pressed': state.method === m[0] ? 'true' : 'false' });
      var isCard = m[0] === 'stripe';
      if (isCard) { b.disabled = true; b.style.opacity = '.55'; b.style.cursor = 'not-allowed'; }
      var amt = isCard ? (L === 'en' ? '$' + PRICE_USD.toFixed(2) : PRICE_USD.toFixed(2).replace('.', ',') + ' $US') : PRICE + ' GDES';
      var info = el('div'); add(info, el('b', m[1]), el('em', amt), el('small', isCard ? t.card : t.htg));
      if (isCard) add(info, el('small', L === 'en' ? 'Coming soon' : (L === 'ht' ? 'Byento' : 'Bientôt')));
      var lw = el('div', '', 'lgw'), im = document.createElement('img');
      var SRC = { moncash: ['https://cdn.aptoide.com/imgs/d/6/f/d6fb107b85364c2fc2e2376995f3aed3_icon.jpg', 'https://kominotek.com/wp-content/uploads/2024/04/moncash.png', '/icons/pay/moncash.png'], natcash: ['/icons/natcash.svg'], stripe: ['/icons/pay/stripe.png', '/icons/pay/stripe.svg'] }[m[0]] || [], si = 0;
      im.className = 'lg'; im.alt = m[1]; im.width = 44; im.height = 44; im.referrerPolicy = 'no-referrer'; im.src = SRC[0] || '';
      im.onerror = function () {
        si++;
        if (si < SRC.length) { im.src = SRC[si]; return; }
        if (m[0] === 'moncash') { var fb = el('span', 'MC', 'lg lgfb'); if (im.parentNode) im.parentNode.replaceChild(fb, im); } else im.remove();
      };
      add(lw, im, info);
      add(b, lw, el('span', state.method === m[0] ? '✓' : '', 'dot'));
      b.addEventListener('click', function () { if (state.busy || isCard) return; state.method = m[0]; render(); });
      pay.appendChild(b);
    });
    var warn = el('div', '', 'pv-warn'); add(warn, el('b', t.checkTitle), el('span', t.checkBody)); pay.appendChild(warn);
    var go = el('button', state.vip ? t.renew : t.go, 'pv-go', { type: 'button' });
    if (state.busy) go.disabled = true;
    go.addEventListener('click', checkout);
    pay.appendChild(go);
    add(pay, el('p', t.note1, 'pv-note'), el('p', t.note2, 'pv-note'));
    msgEl = el('div', '', 'pv-msg'); msgEl.hidden = true; pay.appendChild(msgEl);
    say(state.msg, state.bad);
    root.appendChild(pay);
  }

  function checkout() {
    if (state.busy) return;
    if (!tok()) { say(t.needLogin, true); return; }
    state.busy = true; say(t.redirect, false);
    var btn = root.querySelector('.pv-go'); if (btn) btn.disabled = true;
    fetch('/api/vip/checkout', {
      method: 'POST', cache: 'no-store', credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + tok() },
      body: JSON.stringify({ method: state.method })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j || {} }; });
    }).then(function (x) {
      var j = x.j;
      if (x.status === 200 && j.ok && typeof j.paymentUrl === 'string' && /^https:\/\//i.test(j.paymentUrl)) {
        try { localStorage.setItem(REF_KEY, JSON.stringify({ r: j.reference, t: Date.now() })); } catch (_) {}
        window.location.href = j.paymentUrl; return;
      }
      state.busy = false; if (btn) btn.disabled = false;
      say(x.status === 401 ? t.needLogin : (t.errors[j.code] || (x.status === 429 ? t.errors.too_many : t.fail)), true);
    }).catch(function () { state.busy = false; if (btn) btn.disabled = false; say(t.fail, true); });
  }

  function loadStatus() {
    return fetch('/api/vip/status', { headers: { Accept: 'application/json', Authorization: 'Bearer ' + tok() }, cache: 'no-store', credentials: 'include' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.ok) { state.vip = !!j.vip; state.until = j.vipUntil || null; } })
      .catch(function () {});
  }

  // Retou apre peman: verifye referans lan (menm lojik ak offers.js)
  function checkReturn() {
    var raw = ''; try { raw = localStorage.getItem(REF_KEY) || ''; } catch (_) {}
    if (!raw || !tok()) return;
    var o = null; try { o = JSON.parse(raw); } catch (_) {}
    function clear() { try { localStorage.removeItem(REF_KEY); } catch (_) {} }
    if (!o || !/^VIP-[a-f0-9]{18}$/.test(String(o.r || '')) || !o.t || Date.now() - o.t > 2 * 3600 * 1000) { clear(); return; }
    var tries = 0;
    (function poll() {
      tries++;
      fetch('/api/vip/payment/' + o.r, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + tok() }, cache: 'no-store', credentials: 'include' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (j) {
          if (j.status === 'paid') { clear(); state.msg = t.paid; state.bad = false; loadStatus().then(render); }
          else if (j.status === 'pending') { if (tries < 8) { say(t.checking, false); setTimeout(poll, 5000); } else { say('', false); } }
          else { clear(); say('', false); }
        })
        .catch(function () { if (tries < 3) setTimeout(poll, 5000); });
    })();
  }

  if (!tok()) { root.appendChild(el('div', t.needLogin, 'card')); return; }
  root.appendChild(el('div', '', 'pv-skel')); root.appendChild(el('div', '', 'pv-skel s'));
  loadStatus().then(function () { render(); checkReturn(); });
})();
