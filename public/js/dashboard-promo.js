/* DOBERTO VCF - onglet Promotion (dashboard.html?tab=promotion): lyen pataje, pwogrè, rekonpans. */
(function () {
  'use strict';
  if (new URLSearchParams(location.search).get('tab') !== 'promotion') return;
  var main = document.querySelector('main');
  if (!main) return;

  var T = {
    fr: {
      title: 'Promotion', badge: 'OFFRE POUR LES MEMBRES', heroA: 'Recevez', vip: 'Badge Premium VIP à vie',
      lead: function (n, r) { return 'Partagez votre lien avec ' + n + ' personnes ou plus. Pour recevoir ' + r + ' USD et le badge Premium VIP à vie, au moins ' + n + ' personnes doivent s’inscrire avec votre lien.'; },
      allCountries: 'Tous les pays sont éligibles', delay: 'Le paiement est vérifié par notre équipe avant d’être envoyé.',
      progress: 'Votre progression', total: 'Inscriptions avec votre lien', validated: 'Inscriptions validées', pending: 'En attente de vérification', rejected: 'Refusées',
      remaining: function (n) { return n + ' · Inscriptions validées restantes'; },
      linkTitle: 'Votre lien à partager', needProfile: 'Complétez votre profil pour obtenir votre lien personnel.', goProfile: 'Ouvrir Mon profil',
      copy: 'Copier', copied: 'Lien copié ✓', share: 'Partager sur WhatsApp',
      shareText: 'Rejoins DOBERTO VCF et ajoute automatiquement des contacts :',
      recent: 'Dernières inscriptions', none: 'Personne ne s’est encore inscrit avec votre lien. Partagez-le pour commencer.',
      st: { validated: 'Validée', pending: 'En attente', rejected: 'Refusée' },
      howTitle: 'Comment recevoir votre récompense',
      howLead: 'Choisissez un seul moyen de paiement et entrez les informations du compte qui recevra l’argent. Vous pourrez les modifier ou les supprimer avant le début du paiement.',
      accNatcash: 'Numéro NatCash destinataire', accMoncash: 'Numéro MonCash destinataire', accCashapp: 'Votre $cashtag Cash App', accPaypal: 'Adresse e-mail PayPal',
      phHt: '+509 3X XX XXXX', phCash: '$votrenom', phMail: 'vous@exemple.com',
      check: 'Vérifiez bien vos informations', checkBody: 'Un numéro ou une adresse incorrects peuvent retarder votre paiement.',
      confirm: 'Je confirme que ces informations sont correctes.', save: 'Enregistrer', remove: 'Supprimer',
      saved: 'Informations enregistrées ✓', removed: 'Informations supprimées.', saving: 'Enregistrement…',
      claim: 'Demander ma récompense', claiming: 'Envoi…', claimed: 'Demande envoyée ✓ Nous vérifions vos inscriptions.',
      locked: 'Le paiement a commencé : les informations ne peuvent plus être modifiées.',
      stTitle: 'Statut de la récompense', stNone: 'En cours', stNoneBody: 'Atteignez l’objectif, enregistrez vos informations de paiement, puis demandez votre récompense.',
      stPending: 'Paiement en cours de vérification', stPendingBody: 'Votre demande est envoyée. Nous vérifions vos inscriptions avant de payer.',
      stPaid: 'Récompense payée ✓', stPaidBody: 'Votre badge Premium VIP à vie est actif.',
      stRejected: 'Demande refusée', stRejectedBody: 'Vous pouvez corriger vos informations et faire une nouvelle demande.',
      needLogin: 'Connectez-vous avec Google pour voir votre promotion.',
      errors: { bad_account: 'Informations invalides.', confirm_required: 'Cochez la confirmation.', payout_locked: 'Le paiement a déjà commencé.', not_enough: 'Objectif pas encore atteint.', no_payout_info: 'Enregistrez d’abord vos informations de paiement.', already_claimed: 'Vous avez déjà demandé votre récompense.', no_registration: 'Complétez d’abord votre profil.', session_expired: 'Session expirée. Reconnectez-vous avec Google.', auth_required: 'Connectez-vous avec Google.' },
      fail: 'Une erreur est survenue. Réessayez.'
    },
    ht: {
      title: 'Pwomosyon', badge: 'OFRI POU MANM YO', heroA: 'Resevwa', vip: 'Badj Premium VIP pou lavi',
      lead: function (n, r) { return 'Pataje lyen ou ak ' + n + ' moun oswa plis. Pou resevwa ' + r + ' USD ak badj Premium VIP pou lavi a, omwen ' + n + ' moun dwe enskri ak lyen ou.'; },
      allCountries: 'Tout peyi kalifye', delay: 'Ekip nou an verifye peman an anvan l voye l.',
      progress: 'Pwogrè ou', total: 'Enskripsyon ak lyen ou', validated: 'Enskripsyon valide', pending: 'Ap tann verifikasyon', rejected: 'Refize',
      remaining: function (n) { return n + ' · Enskripsyon valide ki rete'; },
      linkTitle: 'Lyen ou pou pataje', needProfile: 'Konplete pwofil ou pou jwenn lyen pèsonèl ou.', goProfile: 'Louvri Pwofil mwen',
      copy: 'Kopye', copied: 'Lyen kopye ✓', share: 'Pataje sou WhatsApp',
      shareText: 'Antre nan DOBERTO VCF epi ajoute kontak otomatikman :',
      recent: 'Dènye enskripsyon yo', none: 'Pèsonn poko enskri ak lyen ou. Pataje l pou kòmanse.',
      st: { validated: 'Valide', pending: 'An atant', rejected: 'Refize' },
      howTitle: 'Kijan pou resevwa rekonpans ou',
      howLead: 'Chwazi yon sèl mwayen peman epi antre enfòmasyon kont ki pral resevwa lajan an. Ou ka modifye yo oswa siprime yo anvan peman an kòmanse.',
      accNatcash: 'Nimewo NatCash ki pral resevwa', accMoncash: 'Nimewo MonCash ki pral resevwa', accCashapp: '$cashtag Cash App ou', accPaypal: 'Adrès imèl PayPal',
      phHt: '+509 3X XX XXXX', phCash: '$non', phMail: 'ou@egzanp.com',
      check: 'Verifye byen enfòmasyon ou yo', checkBody: 'Yon nimewo oswa yon adrès ki pa kòrèk ka retade peman ou.',
      confirm: 'Mwen konfime enfòmasyon sa yo kòrèk.', save: 'Anrejistre', remove: 'Siprime',
      saved: 'Enfòmasyon anrejistre ✓', removed: 'Enfòmasyon siprime.', saving: 'Ap anrejistre…',
      claim: 'Mande rekonpans mwen', claiming: 'Ap voye…', claimed: 'Demann voye ✓ N ap verifye enskripsyon ou yo.',
      locked: 'Peman an kòmanse: ou pa ka modifye enfòmasyon yo ankò.',
      stTitle: 'Estati rekonpans lan', stNone: 'An kou', stNoneBody: 'Rive nan objektif la, anrejistre enfòmasyon peman ou, epi mande rekonpans ou.',
      stPending: 'Peman an ap verifye', stPendingBody: 'Demann ou voye. N ap verifye enskripsyon ou yo anvan n peye.',
      stPaid: 'Rekonpans peye ✓', stPaidBody: 'Badj Premium VIP pou lavi ou aktif.',
      stRejected: 'Demann refize', stRejectedBody: 'Ou ka korije enfòmasyon ou yo epi fè yon nouvo demann.',
      needLogin: 'Konekte ak Google pou wè pwomosyon ou.',
      errors: { bad_account: 'Enfòmasyon pa valid.', confirm_required: 'Make konfimasyon an.', payout_locked: 'Peman an deja kòmanse.', not_enough: 'Ou poko rive nan objektif la.', no_payout_info: 'Anrejistre enfòmasyon peman ou dabò.', already_claimed: 'Ou deja mande rekonpans lan.', no_registration: 'Konplete pwofil ou dabò.', session_expired: 'Sesyon an ekspire. Rekonekte ak Google.', auth_required: 'Konekte ak Google.' },
      fail: 'Yon erè rive. Eseye ankò.'
    },
    en: {
      title: 'Promotion', badge: 'MEMBER OFFER', heroA: 'Get', vip: 'Lifetime Premium VIP badge',
      lead: function (n, r) { return 'Share your link with ' + n + ' people or more. To receive ' + r + ' USD and the lifetime Premium VIP badge, at least ' + n + ' people must sign up with your link.'; },
      allCountries: 'All countries are eligible', delay: 'Our team checks the payment before it is sent.',
      progress: 'Your progress', total: 'Sign-ups with your link', validated: 'Validated sign-ups', pending: 'Pending review', rejected: 'Rejected',
      remaining: function (n) { return n + ' · Validated sign-ups remaining'; },
      linkTitle: 'Your link to share', needProfile: 'Complete your profile to get your personal link.', goProfile: 'Open My profile',
      copy: 'Copy', copied: 'Link copied ✓', share: 'Share on WhatsApp',
      shareText: 'Join DOBERTO VCF and add contacts automatically:',
      recent: 'Latest sign-ups', none: 'Nobody has signed up with your link yet. Share it to get started.',
      st: { validated: 'Validated', pending: 'Pending', rejected: 'Rejected' },
      howTitle: 'How to receive your reward',
      howLead: 'Choose one payment method and enter the details of the account that will receive the money. You can edit or delete them before the payment starts.',
      accNatcash: 'NatCash recipient number', accMoncash: 'MonCash recipient number', accCashapp: 'Your Cash App $cashtag', accPaypal: 'PayPal e-mail address',
      phHt: '+509 3X XX XXXX', phCash: '$yourname', phMail: 'you@example.com',
      check: 'Double-check your details', checkBody: 'A wrong number or address can delay your payment.',
      confirm: 'I confirm that this information is correct.', save: 'Save', remove: 'Delete',
      saved: 'Details saved ✓', removed: 'Details deleted.', saving: 'Saving…',
      claim: 'Request my reward', claiming: 'Sending…', claimed: 'Request sent ✓ We are checking your sign-ups.',
      locked: 'Payment has started: details can no longer be changed.',
      stTitle: 'Reward status', stNone: 'In progress', stNoneBody: 'Reach the goal, save your payment details, then request your reward.',
      stPending: 'Payment under review', stPendingBody: 'Your request was sent. We check your sign-ups before paying.',
      stPaid: 'Reward paid ✓', stPaidBody: 'Your lifetime Premium VIP badge is active.',
      stRejected: 'Request rejected', stRejectedBody: 'You can fix your details and make a new request.',
      needLogin: 'Sign in with Google to see your promotion.',
      errors: { bad_account: 'Invalid details.', confirm_required: 'Tick the confirmation.', payout_locked: 'Payment has already started.', not_enough: 'Goal not reached yet.', no_payout_info: 'Save your payment details first.', already_claimed: 'You already requested your reward.', no_registration: 'Complete your profile first.', session_expired: 'Session expired. Sign in with Google again.', auth_required: 'Sign in with Google.' },
      fail: 'Something went wrong. Try again.'
    }
  };
  var METHODS = [['natcash', 'NatCash'], ['moncash', 'MonCash'], ['cashapp', 'Cash App'], ['paypal', 'PayPal']];

  function lang() { try { var l = localStorage.getItem('doberto_lang'); return T[l] ? l : 'ht'; } catch (_) { return 'ht'; } }
  function tok() { try { return localStorage.getItem('dv_auth_token') || ''; } catch (_) { return ''; } }
  var t = T[lang()];

  // --- layout: kache aperçu a, make nav la ---
  document.querySelectorAll('main > h1, main > .sub, main > .stats, main > .grid, main > .actions').forEach(function (e) { e.hidden = true; });
  var cur = document.querySelector('nav a.on'); if (cur) cur.classList.remove('on');
  var tOn = document.querySelector('.tabbar .tab.on'); if (tOn) tOn.classList.remove('on');
  var nv = document.getElementById('navPromo'); if (nv) nv.classList.add('on');
  var mb = document.getElementById('moreBtn'); if (mb) mb.classList.add('on');
  document.title = t.title + ' — DOBERTO VCF';

  var css = document.createElement('style');
  css.textContent =
    '.pm{max-width:1000px;display:grid;gap:16px}' +
    '.pm .pm-hero{padding:26px;border:1px solid rgba(245,196,81,.25);background:linear-gradient(135deg,rgba(245,196,81,.08),rgba(10,26,19,.95))}' +
    '.pm-tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.12em;color:var(--sun);border:1px solid rgba(245,196,81,.35);border-radius:99px;padding:5px 12px}' +
    '.pm-hero h2{font-size:clamp(30px,6vw,46px);margin:14px 0 8px;letter-spacing:-.02em}' +
    '.pm-hero p{color:var(--muted);max-width:760px}' +
    '.pm-pills{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}' +
    '.pm-pill{font-size:13px;border:1px solid var(--line);border-radius:99px;padding:6px 12px;color:#a8bbb4}' +
    '.pm-pill.vip{color:var(--sun);border-color:rgba(245,196,81,.4);font-weight:700}' +
    '.pm-cols{display:grid;grid-template-columns:1.1fr 1fr;gap:16px;align-items:start}' +
    '@media(max-width:900px){.pm-cols{grid-template-columns:1fr}}' +
    '.pm h3{font-size:19px;margin-bottom:12px}' +
    '.pm-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}' +
    '.pm-stat{border:1px solid var(--line);border-radius:14px;padding:12px}' +
    '.pm-stat small{display:block;color:var(--muted);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}' +
    '.pm-stat b{display:block;font-size:26px;margin-top:6px}' +
    '.pm-bar{height:10px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden;margin:14px 0 8px}' +
    '.pm-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#36e7a7,#12d78e);border-radius:99px;transition:width .4s}' +
    '.pm-row{display:flex;justify-content:space-between;gap:10px;color:#a8bbb4;font-size:14px}' +
    '.pm-link{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}' +
    '.pm-link input{flex:1;min-width:200px}' +
    '.pm input[type=text],.pm input[type=email]{width:100%;padding:13px 14px;border-radius:12px;border:1px solid #2a3a33;background:#07100c;color:var(--text);font:inherit}' +
    '.pm input:focus{outline:none;border-color:var(--signal)}' +
    '.pm-btn{appearance:none;padding:12px 18px;border-radius:12px;border:1px solid var(--line);background:var(--panel-solid);color:var(--text);font:inherit;font-weight:700;cursor:pointer}' +
    '.pm-btn.main{background:var(--signal);border-color:var(--signal);color:#04110c}' +
    '.pm-btn:disabled{opacity:.45;cursor:not-allowed}' +
    '.pm-methods{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}' +
    '.pm-m{appearance:none;padding:14px;border-radius:14px;border:1px solid var(--line);background:transparent;color:var(--text);font:inherit;font-weight:700;cursor:pointer}' +
    '.pm-m.on{border-color:var(--signal);background:rgba(54,231,167,.08)}' +
    '.pm-m:disabled{opacity:.5;cursor:not-allowed}' +
    '.pm-warn{margin:14px 0;padding:14px;border:1px solid rgba(245,196,81,.3);border-radius:14px;background:rgba(245,196,81,.05)}' +
    '.pm-warn b{display:block;color:var(--sun)}.pm-warn span{color:var(--muted);font-size:14px}' +
    '.pm-chk{display:flex;gap:10px;align-items:flex-start;margin:12px 0;font-size:14px;color:#a8bbb4}' +
    '.pm-actions{display:flex;gap:10px;flex-wrap:wrap}' +
    '.pm-msg{margin-top:12px;padding:12px 14px;border-radius:12px;border:1px solid rgba(54,231,167,.3);color:var(--signal);font-size:14px}' +
    '.pm-msg.bad{border-color:rgba(245,196,81,.4);color:var(--sun)}' +
    '.pm-status{border:1px solid var(--line);border-radius:14px;padding:14px;margin-top:14px}' +
    '.pm-status small{color:var(--muted);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}' +
    '.pm-status b{display:block;margin:6px 0 4px;font-size:17px}' +
    '.pm-status span{color:var(--muted);font-size:14px}' +
    '.pm-list{display:grid;gap:8px;margin-top:6px}' +
    '.pm-item{display:flex;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px 12px;font-size:14px}' +
    '.pm-item em{font-style:normal;font-size:12px;font-weight:800}' +
    '.pm-empty{border:1px dashed var(--line);border-radius:14px;padding:16px;color:var(--muted);text-align:center}' +
    '.pm-skel{border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.04);height:260px;animation:pmPulse 1.1s ease-in-out infinite alternate}.pm-skel.s{height:150px}@keyframes pmPulse{from{opacity:.45}to{opacity:1}}';
  document.head.appendChild(css);

  function el(tag, text, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null && text !== '') n.textContent = text;
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function add(parent) { for (var i = 1; i < arguments.length; i++) if (arguments[i]) parent.appendChild(arguments[i]); return parent; }
  function hdrs() { var h = { Accept: 'application/json', 'Content-Type': 'application/json' }, k = tok(); if (k) h.Authorization = 'Bearer ' + k; return h; }
  function api(method, path, body) {
    return fetch(path, { method: method, headers: hdrs(), credentials: 'include', cache: 'no-store', body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, d: d }; }); });
  }
  function errText(d) { return (d && t.errors[d.code]) || (d && d.error) || t.fail; }

  var root = el('div', '', 'pm');
  var box = el('section', '', 'tsec', { id: 'promoSec' }); box.style.maxWidth = 'none';
  add(box, root);
  main.appendChild(box);

  var state = null, selMethod = '', msgEl = null;

  function say(text, bad) {
    if (!msgEl) return;
    msgEl.hidden = !text; msgEl.textContent = text || ''; msgEl.className = 'pm-msg' + (bad ? ' bad' : '');
  }

  function accLabel(m) { return { natcash: t.accNatcash, moncash: t.accMoncash, cashapp: t.accCashapp, paypal: t.accPaypal }[m] || ''; }
  function accHolder(m) { return { natcash: t.phHt, moncash: t.phHt, cashapp: t.phCash, paypal: t.phMail }[m] || ''; }

  function render() {
    root.textContent = '';
    var s = state, c = s.counts || {};
    var hero = el('div', '', 'card pm-hero');
    add(hero, el('span', t.badge, 'pm-tag'), el('h2', t.heroA + ' ' + s.rewardUsd + ' USD'), el('p', t.lead(s.target, s.rewardUsd)));
    var pills = el('div', '', 'pm-pills');
    add(pills, el('span', t.vip, 'pm-pill vip'), el('span', (c.validated || 0) + ' / ' + s.target, 'pm-pill'), el('span', t.allCountries, 'pm-pill'), el('span', t.delay, 'pm-pill'));
    hero.appendChild(pills);
    root.appendChild(hero);

    var cols = el('div', '', 'pm-cols');
    var left = el('div', '', ''); left.style.display = 'grid'; left.style.gap = '16px';
    var right = el('div', '', ''); right.style.display = 'grid'; right.style.gap = '16px';

    // Pwogrè
    var prog = el('div', '', 'card');
    prog.appendChild(el('h3', t.progress));
    var stats = el('div', '', 'pm-stats');
    [['total', t.total], ['validated', t.validated], ['pending', t.pending], ['rejected', t.rejected]].forEach(function (p) {
      var cell = el('div', '', 'pm-stat'); add(cell, el('small', p[1]), el('b', String(c[p[0]] || 0))); stats.appendChild(cell);
    });
    prog.appendChild(stats);
    var pct = Math.min(100, Math.floor(((c.validated || 0) / s.target) * 100));
    var bar = el('div', '', 'pm-bar'); var fill = el('i'); fill.style.width = pct + '%'; bar.appendChild(fill);
    var prow = el('div', '', 'pm-row'); add(prow, el('span', (c.validated || 0) + ' / ' + s.target), el('span', pct + '%'));
    add(prog, prow, bar, el('div', t.remaining(Math.max(0, s.target - (c.validated || 0))), 'pm-row'));
    left.appendChild(prog);

    // Dènye enskripsyon
    var rec = el('div', '', 'card');
    rec.appendChild(el('h3', t.recent));
    if (!s.recent || !s.recent.length) rec.appendChild(el('div', t.none, 'pm-empty'));
    else {
      var list = el('div', '', 'pm-list');
      s.recent.forEach(function (r) {
        var it = el('div', '', 'pm-item');
        var color = r.status === 'validated' ? 'var(--signal)' : r.status === 'rejected' ? '#ff7676' : 'var(--sun)';
        var st = el('em', t.st[r.status] || r.status); st.style.color = color;
        add(it, el('span', r.name), st); list.appendChild(it);
      });
      rec.appendChild(list);
    }
    left.appendChild(rec);

    // Lyen pataje
    var lk = el('div', '', 'card');
    lk.appendChild(el('h3', t.linkTitle));
    if (s.needsProfile) {
      add(lk, el('p', t.needProfile, '', { style: 'color:var(--muted);margin-bottom:12px' }));
      var go = el('a', t.goProfile, 'pm-btn main', { href: 'dashboard.html?tab=profile' }); go.style.display = 'inline-block';
      lk.appendChild(go);
    } else {
      var row = el('div', '', 'pm-link');
      var inp = el('input', '', '', { type: 'text', readonly: 'readonly', value: s.link, 'aria-label': t.linkTitle });
      inp.addEventListener('focus', function () { inp.select(); });
      var cp = el('button', t.copy, 'pm-btn main', { type: 'button' });
      cp.addEventListener('click', function () {
        function ok() { say(t.copied); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s.link).then(ok, function () { inp.select(); document.execCommand('copy'); ok(); });
        else { inp.select(); try { document.execCommand('copy'); } catch (_) {} ok(); }
      });
      var wa = el('a', t.share, 'pm-btn', { href: 'https://wa.me/?text=' + encodeURIComponent(t.shareText + ' ' + s.link), target: '_blank', rel: 'noopener noreferrer' });
      wa.style.display = 'inline-block';
      add(row, inp, cp, wa); lk.appendChild(row);
    }
    right.appendChild(lk);

    // FAQ (ouvri/fèmen)
    var fq = el('details', '', 'card');
    fq.appendChild(el('summary', t.faqTitle || 'Quelles inscriptions sont acceptées ?', '', { style: 'font-weight:700;cursor:pointer;font-size:16px' }));
    fq.appendChild(el('p', t.faqBody || 'Seules les inscriptions faites avec votre lien, avec e-mail confirmé et validées par notre équipe comptent. Tous les pays sont acceptés.', '', { style: 'color:var(--muted);font-size:14px;margin-top:10px' }));
    right.appendChild(fq);

    // Kijan pou resevwa rekonpans lan
    var how = el('div', '', 'card');
    how.appendChild(el('h3', t.howTitle));
    how.appendChild(el('p', t.howLead, '', { style: 'color:var(--muted);font-size:14px' }));
    var pay = s.payout || null;
    var active = pay && (pay.status === 'pending' || pay.status === 'paid');
    var info = s.payoutInfo || null;
    if (!selMethod) selMethod = info ? info.method : '';
    var ms = el('div', '', 'pm-methods');
    METHODS.forEach(function (m) {
      var b = el('button', m[1], 'pm-m' + (selMethod === m[0] ? ' on' : ''), { type: 'button' });
      if (active) b.disabled = true;
      b.addEventListener('click', function () { selMethod = m[0]; render(); });
      ms.appendChild(b);
    });
    how.appendChild(ms);

    var acc = null, chk = null;
    if (selMethod) {
      how.appendChild(el('label', accLabel(selMethod), '', { for: 'pmAcc', style: 'display:block;font-weight:700;margin:6px 0' }));
      acc = el('input', '', '', { id: 'pmAcc', type: selMethod === 'paypal' ? 'email' : 'text', placeholder: accHolder(selMethod), autocomplete: 'off', maxlength: '254' });
      if (info && info.method === selMethod) acc.value = info.account;
      if (active) acc.disabled = true;
      how.appendChild(acc);
    }
    var warn = el('div', '', 'pm-warn'); add(warn, el('b', t.check), el('span', t.checkBody)); how.appendChild(warn);
    if (!active) {
      var lab = el('label', '', 'pm-chk');
      chk = el('input', '', '', { type: 'checkbox' });
      add(lab, chk, el('span', t.confirm)); how.appendChild(lab);
      var acts = el('div', '', 'pm-actions');
      var sv = el('button', t.save, 'pm-btn main', { type: 'button' });
      sv.addEventListener('click', function () {
        if (!selMethod || !acc) return;
        sv.disabled = true; say(t.saving);
        api('PUT', '/api/promo/payout-info', { method: selMethod, account: acc.value, confirm: !!(chk && chk.checked) }).then(function (r) {
          if (!r.ok) { sv.disabled = false; say(errText(r.d), true); return; }
          state.payoutInfo = r.d.payoutInfo; render(); say(t.saved);
        }).catch(function () { sv.disabled = false; say(t.fail, true); });
      });
      acts.appendChild(sv);
      if (info) {
        var rm = el('button', t.remove, 'pm-btn', { type: 'button' });
        rm.addEventListener('click', function () {
          rm.disabled = true;
          api('DELETE', '/api/promo/payout-info').then(function (r) {
            if (!r.ok) { rm.disabled = false; say(errText(r.d), true); return; }
            state.payoutInfo = null; selMethod = ''; render(); say(t.removed);
          }).catch(function () { rm.disabled = false; say(t.fail, true); });
        });
        acts.appendChild(rm);
      }
      how.appendChild(acts);
    } else {
      how.appendChild(el('p', t.locked, '', { style: 'color:var(--muted);font-size:14px' }));
    }

    // Estati rekonpans lan + bouton demann
    var stBox = el('div', '', 'pm-status');
    var key = !pay ? 'None' : pay.status === 'paid' ? 'Paid' : pay.status === 'pending' ? 'Pending' : 'Rejected';
    add(stBox, el('small', t.stTitle), el('b', t['st' + key]), el('span', t['st' + key + 'Body']));
    how.appendChild(stBox);
    if (s.eligible) {
      var cl = el('button', t.claim, 'pm-btn main', { type: 'button' }); cl.style.marginTop = '12px'; cl.style.width = '100%';
      cl.addEventListener('click', function () {
        cl.disabled = true; cl.textContent = t.claiming;
        api('POST', '/api/promo/claim', {}).then(function (r) {
          if (!r.ok) { cl.disabled = false; cl.textContent = t.claim; say(errText(r.d), true); return; }
          load(function () { say(t.claimed); });
        }).catch(function () { cl.disabled = false; cl.textContent = t.claim; say(t.fail, true); });
      });
      how.appendChild(cl);
    }
    msgEl = el('div', '', 'pm-msg', { role: 'status' }); msgEl.hidden = true;
    how.appendChild(msgEl);
    right.appendChild(how);

    add(cols, left, right);
    root.appendChild(cols);
  }

  function load(done) {
    if (!tok()) { root.textContent = ''; root.appendChild(el('div', t.needLogin, 'pm-empty')); return; }
    if (!root.firstChild) { root.appendChild(el('div', '', 'pm-skel')); root.appendChild(el('div', '', 'pm-skel s')); }
    api('GET', '/api/promo/status').then(function (r) {
      if (!r.ok || !r.d || !r.d.ok) {
        root.textContent = ''; root.appendChild(el('div', errText(r.d), 'pm-empty')); return;
      }
      state = r.d; render(); if (done) done();
    }).catch(function () { root.textContent = ''; root.appendChild(el('div', t.fail, 'pm-empty')); });
  }
  load();
})();
