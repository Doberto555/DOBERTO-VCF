/* DOBERTO VCF - dashboard: tradiksyon FR -> EN / HT (swiv doberto_lang) */
(function () {
  'use strict';
  var DEFAULT = 'ht';           // chanje an 'fr' si w vle franse pa defo
  var D = {                      // 'fraz franse': [anglè, kreyòl]
    'Accueil': ['Home', 'Akèy'],
    'Ajout automatique': ['Automatic add', 'Ajout otomatik'],
    'Aperçu': ['Overview', 'Apèsi'],
    'COMPTE GOOGLE': ['GOOGLE ACCOUNT', 'KONT GOOGLE'],
    'CONNEXION GOOGLE': ['GOOGLE CONNECTION', 'KONEKSYON GOOGLE'],
    'CONTACT (optionnel)': ['CONTACT (optional)', 'KONTAK (opsyonèl)'],
    'Cette semaine': ['This week', 'Semèn sa a'],
    'Compte': ['Account', 'Kont'],
    'Conditions': ['Terms', 'Kondisyon'],
    'Confidentialité': ['Privacy', 'Konfidansyalite'],
    'DERNIÈRE MISE À JOUR': ['LAST UPDATE', 'DÈNYE MIZAJOU'],
    'Depuis 7 jours': ['Last 7 days', 'Depi 7 jou'],
    'Direct': ['Live', 'An dirèk'],
    'DÉTAILS': ['DETAILS', 'DETAY'],
    'Déconnectez cet appareil. Vous pourrez vous reconnecter avec Google à tout moment.': ['Sign out of this device. You can sign back in with Google at any time.', 'Dekonekte aparèy sa a. Ou ka rekonekte ak Google nenpòt ki lè.'],
    'Désactivé': ['Off', 'Dezaktive'],
    'Enregistrer': ['Save', 'Anrejistre'],
    'Envoyer le signalement': ['Send report', 'Voye siyalman an'],
    'Google affichera « Shizzy Connect », notre partenaire de synchronisation. C’est normal : choisissez le compte Google qui recevra les contacts. Ajoutez d’abord votre numéro dans Mon profil.': ['Google will show “Shizzy Connect”, our sync partner. This is normal: choose the Google account that will receive the contacts. Add your number in My profile first.', 'Google ap montre « Shizzy Connect », patnè sinkwonizasyon nou an. Sa nòmal: chwazi kont Google ki pral resevwa kontak yo. Ajoute nimewo ou nan Mon profil an premye.'],
    'Google protège votre compte et vérifie votre connexion.': ['Google protects your account and verifies your sign-in.', 'Google pwoteje kont ou epi li verifye koneksyon ou.'],
    'Gérer mon compte': ['Manage my account', 'Jere kont mwen'],
    'Gérez votre compte et la langue du site.': ['Manage your account and the site language.', 'Jere kont ou ak lang sit la.'],
    'Inscrits depuis minuit': ['Registered since midnight', 'Enskri depi minwi'],
    'J’accepte la politique de confidentialité (voir Confidentialité).': ['I accept the privacy policy (see Privacy).', 'Mwen dakò ak politik konfidansyalite a (gade Konfidansyalite).'],
    'LANGUE DU SITE': ['SITE LANGUAGE', 'LANG SIT LA'],
    'Les inscriptions de votre réseau, mises à jour en direct.': ['Your network’s registrations, updated live.', 'Enskripsyon rezo ou a, mete ajou an dirèk.'],
    'Les inscriptions par jour ne sont pas encore disponibles.': ['Daily registrations are not available yet.', 'Enskripsyon pa jou poko disponib.'],
    'Les nouveaux membres sont ajoutés à vos Google Contacts peu après leur inscription.': ['New members are added to your Google Contacts shortly after they register.', 'Nouvo manm yo ajoute nan Google Contacts ou yon ti tan apre yo fin enskri.'],
    'MON COMPTE': ['MY ACCOUNT', 'KONT MWEN'],
    'Membre': ['Member', 'Manm'],
    'Membres': ['Members', 'Manm yo'],
    'Membres dans le monde': ['Members worldwide', 'Manm nan mond lan'],
    'Mettre à jour maintenant': ['Update now', 'Mete ajou kounye a'],
    'Modifier mon nom et mon numéro': ['Edit my name and number', 'Modifye non ak nimewo mwen'],
    'Mon profil': ['My profile', 'Pwofil mwen'],
    'NOM COMPLET': ['FULL NAME', 'NON KONPLÈ'],
    'NUMÉRO DE TÉLÉPHONE': ['PHONE NUMBER', 'NIMEWO TELEFÒN'],
    'NUMÉRO DU MEMBRE': ['MEMBER NUMBER', 'NIMEWO MANM NAN'],
    'Notifications e-mail': ['Email notifications', 'Notifikasyon imèl'],
    'Nouveaux aujourd’hui': ['New today', 'Nouvo jodi a'],
    'Nouveaux membres chaque jour': ['New members each day', 'Nouvo manm chak jou'],
    'Numéro WhatsApp': ['WhatsApp number', 'Nimewo WhatsApp'],
    'Numéro WhatsApp recommandé': ['WhatsApp number recommended', 'Nimewo WhatsApp rekòmande'],
    'POURQUOI LE SIGNALEZ-VOUS ?': ['WHY ARE YOU REPORTING THIS?', 'POUKISA W AP SIYALE L ?'],
    'Pas encore mis à jour': ['Not updated yet', 'Poko mete ajou'],
    'Pays': ['Country', 'Peyi'],
    'Pays avec des membres': ['Countries with members', 'Peyi ki gen manm'],
    'Plus': ['More', 'Plis'],
    'SESSION': ['SESSION', 'SESYON'],
    'Se déconnecter de cet appareil': ['Sign out of this device', 'Dekonekte aparèy sa a'],
    'Signalement': ['Report', 'Siyalman'],
    'Signaler un membre': ['Report a member', 'Siyale yon manm'],
    'Signaler un problème': ['Report a problem', 'Siyale yon pwoblèm'],
    'Signalez un mauvais comportement ou un faux numéro. Nous examinerons votre signalement.': ['Report bad behavior or a fake number. We will review your report.', 'Siyale move konpòtman oswa yon fo nimewo. N ap egzamine siyalman ou an.'],
    'SÉCURITÉ': ['SECURITY', 'SEKIRITE'],
    'Tableau de bord': ['Dashboard', 'Tablo de bò'],
    'Tous les contacts': ['All contacts', 'Tout kontak yo'],
    'VOTRE COMPTE': ['YOUR ACCOUNT', 'KONT OU'],
    'Voir et télécharger les contacts': ['View and download contacts', 'Gade epi telechaje kontak yo'],
    'Votre choix est enregistré sur cet appareil.': ['Your choice is saved on this device.', 'Chwa ou an sere sou aparèy sa a.'],
    'Votre nom et votre numéro apparaissent dans la liste des membres.': ['Your name and number appear in the members list.', 'Non ak nimewo ou parèt nan lis manm yo.'],
    'Votre statut': ['Your status', 'Estati ou'],
    'À propos': ['About', 'Konsènan'],
    /* mesaj JS */
    'Acceptez la politique de confidentialité.': ['Accept the privacy policy.', 'Aksepte politik konfidansyalite a.'],
    'Activé — les nouveaux membres arrivent dans vos contacts.': ['On — new members arrive in your contacts.', 'Aktive — nouvo manm yo antre nan kontak ou.'],
    'Ajout automatique désactivé.': ['Automatic add turned off.', 'Ajout otomatik la dezaktive.'],
    'Ajoutez d’abord votre numéro dans Mon profil.': ['Add your number in My profile first.', 'Ajoute nimewo ou nan Mon profil an premye.'],
    'Connectez-vous avec Google pour gérer votre compte.': ['Sign in with Google to manage your account.', 'Konekte ak Google pou w jere kont ou.'],
    'Connectez-vous d’abord avec Google pour modifier votre profil.': ['Sign in with Google first to edit your profile.', 'Konekte ak Google an premye pou w modifye pwofil ou.'],
    'Connectez-vous d’abord avec Google pour utiliser cette option.': ['Sign in with Google first to use this option.', 'Konekte ak Google an premye pou w itilize opsyon sa a.'],
    'Connexion impossible.': ['Unable to connect.', 'Koneksyon an pa posib.'],
    'Connecté': ['Connected', 'Konekte'],
    'Désactiver l’ajout automatique ?': ['Turn off automatic add?', 'Dezaktive ajout otomatik la ?'],
    'Désactivé — connectez Google Contacts pour activer.': ['Off — connect Google Contacts to turn on.', 'Dezaktive — konekte Google Contacts pou aktive.'],
    'Enregistrement impossible. Réessayez.': ['Could not save. Try again.', 'Pa ka anrejistre. Eseye ankò.'],
    'Entrez votre nom complet.': ['Enter your full name.', 'Antre non konplè ou.'],
    'Envoi impossible. Réessayez.': ['Could not send. Try again.', 'Pa ka voye. Eseye ankò.'],
    'Erreur réseau. Réessayez.': ['Network error. Try again.', 'Erè rezo. Eseye ankò.'],
    'Faux numéro': ['Fake number', 'Fo nimewo'],
    'Impossible de lire le statut.': ['Unable to read the status.', 'Pa ka li estati a.'],
    'La mise à jour a échoué.': ['The update failed.', 'Mizajou a echwe.'],
    'La mise à jour continue en arrière-plan.': ['The update is continuing in the background.', 'Mizajou a ap kontinye an background.'],
    'Langue enregistrée sur cet appareil.': ['Language saved on this device.', 'Lang lan sere sou aparèy sa a.'],
    'Le service de synchronisation n’est pas encore configuré.': ['The sync service is not configured yet.', 'Sèvis sinkwonizasyon an poko konfigire.'],
    'Merci ! Votre signalement a été envoyé.': ['Thank you! Your report was sent.', 'Mèsi ! Siyalman ou an voye.'],
    'Mise à jour en cours…': ['Updating…', 'Mizajou a ap fèt…'],
    'Modifier mon profil': ['Edit my profile', 'Modifye pwofil mwen'],
    'Non connecté': ['Not connected', 'Pa konekte'],
    'Numéro invalide.': ['Invalid number.', 'Nimewo a pa valid.'],
    'Ouverture de Google…': ['Opening Google…', 'N ap louvri Google…'],
    'Problème technique': ['Technical problem', 'Pwoblèm teknik'],
    'Profil enregistré. Vous pouvez maintenant activer l’ajout automatique.': ['Profile saved. You can now turn on automatic add.', 'Pwofil anrejistre. Kounye a ou ka aktive ajout otomatik la.'],
    'Se connecter avec Google': ['Sign in with Google', 'Konekte ak Google'],
    'Se connecter': ['Sign in', 'Konekte'],
    'Se déconnecter de cet appareil ?': ['Sign out of this device?', 'Dekonekte aparèy sa a ?'],
    'Session expirée. Reconnectez-vous avec Google.': ['Session expired. Sign in with Google again.', 'Sesyon an ekspire. Rekonekte ak Google.'],
    'Terminer mon profil': ['Complete my profile', 'Fini pwofil mwen'],
    'Vie privée': ['Privacy', 'Vi prive'],
    'À compléter': ['To complete', 'Pou konplete'],
    'À reconnecter': ['Reconnect needed', 'Bezwen rekonekte'],
    'Échec de la mise à jour.': ['Update failed.', 'Mizajou a echwe.'],
    'Écrivez une petite explication (au moins 10 caractères).': ['Write a short explanation (at least 10 characters).', 'Ekri yon ti eksplikasyon (omwen 10 karaktè).'],
    /* placeholder + aria-label */
    'E-mail ou numéro WhatsApp': ['Email or WhatsApp number', 'Imèl oswa nimewo WhatsApp'],
    'Expliquez le problème...': ['Explain the problem...', 'Eksplike pwoblèm nan...'],
    'ex. Jean Constant': ['e.g. Jean Constant', 'egz. Jean Constant'],
    'Courbe des nouveaux membres sur 7 jours': ['New members curve over 7 days', 'Kòb nouvo manm yo sou 7 jou'],
    'Navigation principale': ['Main navigation', 'Navigasyon prensipal'],
    'Navigation': ['Navigation', 'Navigasyon'],
    'Statistiques': ['Statistics', 'Estatistik']
  };
  var P = [
    [/^Contacts mis à jour \((\d+) envoyés\)\.$/, ['Contacts updated ($1 sent).', 'Kontak yo mete ajou ($1 voye).']],
    [/^Le numéro doit avoir (\d+) chiffres\.$/, ['The number must have $1 digits.', 'Nimewo a dwe gen $1 chif.']]
  ];
  var TITLE_RE = /^(.+) — DOBERTO VCF$/;

  function lang() { try { return localStorage.getItem('doberto_lang') || DEFAULT; } catch (_) { return DEFAULT; } }
  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function tr(src, l) {
    if (l === 'fr') return null;
    var i = l === 'en' ? 0 : 1, e = D[src];
    if (e) return e[i];
    for (var k = 0; k < P.length; k++) if (P[k][0].test(src)) return src.replace(P[k][0], P[k][1][i]);
    var m = src.match(TITLE_RE);
    if (m && D[m[1]]) return D[m[1]][i] + ' — DOBERTO VCF';
    return null;
  }

  var meta = new WeakMap();
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  function allowed(n) {
    var p = n.parentNode;
    if (!p || SKIP[p.nodeName]) return false;
    return !(p.closest && p.closest('#syGuide'));
  }

  function applyText(n) {
    if (!allowed(n)) return;
    var v = n.nodeValue;
    if (!v || !v.trim()) return;
    var m = meta.get(n), l = lang();
    var fresh = !(m && v === m.out);
    var src = fresh ? norm(v) : m.src;
    var t = tr(src, l);
    if (!t) {
      if (!fresh) { n.nodeValue = m.full; meta.delete(n); }
      return;
    }
    var out = v.match(/^\s*/)[0] + t + v.match(/\s*$/)[0];
    if (!fresh) out = m.full.match(/^\s*/)[0] + t + m.full.match(/\s*$/)[0];
    meta.set(n, { src: src, out: out, full: fresh ? v : m.full });
    if (n.nodeValue !== out) n.nodeValue = out;
  }

  var ATTRS = ['placeholder', 'aria-label', 'title'];
  function applyAttr(el) {
    if (!el.hasAttribute || (el.closest && el.closest('#syGuide'))) return;
    var l = lang();
    ATTRS.forEach(function (a) {
      if (!el.hasAttribute(a)) return;
      var v = el.getAttribute(a), kf = 'data-fr-' + a, ko = 'data-out-' + a;
      var orig = el.getAttribute(kf), last = el.getAttribute(ko);
      var ours = orig !== null && v === last;
      var src = ours ? orig : v;
      var t = tr(norm(src), l);
      if (!t) {
        if (ours) { el.setAttribute(a, orig); el.removeAttribute(kf); el.removeAttribute(ko); }
        return;
      }
      el.setAttribute(kf, src);
      el.setAttribute(ko, t);
      if (v !== t) el.setAttribute(a, t);
    });
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { applyText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    var el = root.nodeType === 9 ? root.documentElement : root;
    if (SKIP[el.nodeName]) return;
    if (el.nodeType === 1) applyAttr(el);
    if (el.querySelectorAll) el.querySelectorAll('[placeholder],[aria-label],[title]').forEach(applyAttr);
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(applyText);
  }

  function run() { walk(document.documentElement); }

  function boot() {
    run();
    try {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          if (m.type === 'characterData') applyText(m.target);
          else if (m.type === 'attributes') applyAttr(m.target);
          else m.addedNodes.forEach(walk);
        });
      }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    } catch (_) {}
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('#acLang button, .dv-langbar button')) setTimeout(run, 150);
    });
    window.addEventListener('storage', run);
  }

  /* confirm() natif */
  var _c = window.confirm;
  window.confirm = function (msg) { var t = tr(norm(msg), lang()); return _c.call(window, t || msg); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
