(function () {
  "use strict";
  var LANGS = ["ht", "fr", "en"];
  var E = [
    /* ---------- terms.html (source: ht) ---------- */
    { ht: "Kondisyon — DOBERTO VCF", fr: "Conditions — DOBERTO VCF", en: "Terms — DOBERTO VCF" },
    { ht: "Kondisyon itilizasyon DOBERTO VCF.", fr: "Conditions d’utilisation de DOBERTO VCF.", en: "DOBERTO VCF terms of use." },
    { ht: "LEGAL · TERMS", fr: "JURIDIQUE · CONDITIONS", en: "LEGAL · TERMS" },
    { ht: "Kondisyon itilizasyon", fr: "Conditions d’utilisation", en: "Terms of Use" },
    { ht: "Lè ou itilize DOBERTO VCF, ou dakò pou bay enfòmasyon ki kòrèk epi itilize sèvis la yon fason lejitim.",
      fr: "En utilisant DOBERTO VCF, vous vous engagez à fournir des informations exactes et à utiliser le service de manière légitime.",
      en: "By using DOBERTO VCF, you agree to provide accurate information and to use the service lawfully." },
    { ht: "Enskripsyon", fr: "Inscription", en: "Registration" },
    { ht: "Google Sign-In sèvi sèlman pou konekte ak idantifye kont ou pandan enskripsyon an. DOBERTO VCF pa mande aksè Google Contacts. Ou dwe enskri sèlman yon nimewo ou gen otorizasyon pou itilize.",
      fr: "Google Sign-In sert uniquement à connecter et identifier votre compte pendant l’inscription. DOBERTO VCF ne demande pas l’accès à Google Contacts. Vous ne devez inscrire qu’un numéro que vous avez l’autorisation d’utiliser.",
      en: "Google Sign-In is used only to sign in and identify your account during registration. DOBERTO VCF does not request access to Google Contacts. You must register only a number you are authorized to use." },
    { ht: "Group WhatsApp", fr: "Groupe WhatsApp", en: "WhatsApp Group" },
    { ht: "Apre enskripsyon an, sit la voye itilizatè a sou envitasyon group WhatsApp ofisyèl DOBERTO VCF la. WhatsApp toujou mande itilizatè a konfime si li vle antre nan group la, epi règleman WhatsApp yo aplike.",
      fr: "Après l’inscription, le site redirige l’utilisateur vers l’invitation du groupe WhatsApp officiel de DOBERTO VCF. WhatsApp demande toujours à l’utilisateur de confirmer s’il souhaite rejoindre le groupe, et les règles de WhatsApp s’appliquent.",
      en: "After registration, the site sends the user to the official DOBERTO VCF WhatsApp group invitation. WhatsApp always asks the user to confirm whether they want to join the group, and WhatsApp’s rules apply." },
    { ht: "Sèvis VCF ak VIP", fr: "Service VCF et VIP", en: "VCF and VIP service" },
    { ht: "Disponiblite telechajman VCF, plan VIP ak lòt avantaj yo ka depann de kondisyon ak konfigirasyon ki afiche sou sit la. Sèvis la ka evolye pou amelyore sekirite ak fonksyònman li.",
      fr: "La disponibilité du téléchargement VCF, des formules VIP et des autres avantages peut dépendre des conditions et configurations affichées sur le site. Le service peut évoluer pour améliorer sa sécurité et son fonctionnement.",
      en: "The availability of VCF downloads, VIP plans and other benefits may depend on the conditions and settings shown on the site. The service may evolve to improve its security and operation." },
    { ht: "Responsablite", fr: "Responsabilité", en: "Responsibility" },
    { ht: "Chak itilizatè responsab fason li itilize sèvis la ak kontak li jwenn yo epi li dwe respekte vi prive lòt itilizatè yo ak règleman ki aplikab yo.",
      fr: "Chaque utilisateur est responsable de la façon dont il utilise le service et les contacts qu’il obtient, et doit respecter la vie privée des autres utilisateurs ainsi que les règles applicables.",
      en: "Each user is responsible for how they use the service and the contacts they obtain, and must respect other users’ privacy and the applicable rules." },
    { ht: "Dènye mizajou: 17 septanm 2026.", fr: "Dernière mise à jour : 17 septembre 2026.", en: "Last updated: September 17, 2026." },
    { ht: "Retounen sou Akèy", fr: "Retour à l’accueil", en: "Back to Home" },

    /* ---------- about.html (source: fr) ---------- */
    { ht: "DOBERTO VCF — Konsènan", fr: "DOBERTO VCF — À propos", en: "DOBERTO VCF — About" },
    { ht: "Prezantasyon ofisyèl DOBERTO VCF, rezo WhatsApp, sinkronizasyon Google Contacts.",
      fr: "Présentation officielle de DOBERTO VCF, réseau WhatsApp, synchronisation Google Contacts.",
      en: "Official overview of DOBERTO VCF, the WhatsApp network, Google Contacts sync." },
    { ht: "Konfidansyalite", fr: "Confidentialité", en: "Privacy" },
    { ht: "REZO DOBERTO VCF", fr: "DOBERTO VCF NETWORK", en: "DOBERTO VCF NETWORK" },
    { ht: "Fè rezo ou grandi.", fr: "Développez votre réseau.", en: "Grow your network." },
    { ht: "Antre nan kominote a.", fr: "Rejoignez la communauté.", en: "Join the community." },
    { ht: "DOBERTO VCF rasanble enskripsyon, manm, ak sinkronizasyon Google Contacts nan yon eksperyans senp. Google sèvi sèlman kòm metòd koneksyon pandan enskripsyon an.",
      fr: "DOBERTO VCF rassemble inscription, membres, et synchronisation Google Contacts dans une expérience simple. Google est utilisé uniquement comme méthode de connexion pendant l’inscription.",
      en: "DOBERTO VCF brings registration, members, and Google Contacts sync together in one simple experience. Google is used only as a sign-in method during registration." },
    { ht: "Antre nan DOBERTO VCF", fr: "Rejoindre DOBERTO VCF", en: "Join DOBERTO VCF" },
    { ht: "Gade group la", fr: "Voir le groupe", en: "View the group" },
    { ht: "01 · Enskripsyon senp", fr: "01 · Inscription simple", en: "01 · Simple registration" },
    { ht: "Konekte ak Google, ajoute enfòmasyon ou ak nimewo WhatsApp ou.",
      fr: "Connectez-vous avec Google, ajoutez vos informations et votre numéro WhatsApp.",
      en: "Sign in with Google, then add your details and your WhatsApp number." },
    { ht: "02 · Group WhatsApp", fr: "02 · Groupe WhatsApp", en: "02 · WhatsApp Group" },
    { ht: "Apre enskripsyon an, sit la voye w sou envitasyon group ofisyèl la.",
      fr: "Après l’inscription, le site vous dirige vers l’invitation du groupe officiel.",
      en: "After registration, the site takes you to the official group invitation." },
    { ht: "03 · Vi prive", fr: "03 · Vie privée", en: "03 · Privacy" },
    { ht: "Nimewo WhatsApp yo pa afiche nan anyè piblik la.",
      fr: "Les numéros WhatsApp ne sont pas affichés dans l’annuaire public.",
      en: "WhatsApp numbers are not shown in the public directory." },
    { ht: "FONKSYONMAN", fr: "FONCTIONNEMENT", en: "HOW IT WORKS" },
    { ht: "Yon rezo senp e dirèk", fr: "Un réseau simple et direct", en: "A simple, direct network" },
    { ht: "Kont verifye", fr: "Compte vérifié", en: "Verified account" },
    { ht: "Google Sign-In sèvi sèlman pou konekte ak idantifye kont ou pandan enskripsyon an. DOBERTO VCF pa itilize Google Contacts.",
      fr: "Google Sign-In sert uniquement à connecter et identifier votre compte pendant l’inscription. DOBERTO VCF n’utilise pas Google Contacts.",
      en: "Google Sign-In is used only to sign in and identify your account during registration. DOBERTO VCF does not use Google Contacts." },
    { ht: "Rezo manm", fr: "Réseau de membres", en: "Member network" },
    { ht: "Manm yo ajoute non, peyi ak nimewo WhatsApp yo pou antre nan rezo a, san nimewo yo pa parèt nan anyè piblik la.",
      fr: "Les membres ajoutent leur nom, pays et numéro WhatsApp pour rejoindre le réseau tout en gardant leur numéro hors de l’annuaire public.",
      en: "Members add their name, country and WhatsApp number to join the network while keeping their number out of the public directory." },
    { ht: "Group & VIP", fr: "Groupe & VIP", en: "Group & VIP" },
    { ht: "Group WhatsApp ofisyèl la ak fòmil VIP yo pèmèt ou rete konekte ak enfòmasyon ak avantaj rezo a.",
      fr: "Le groupe WhatsApp officiel et les formules VIP permettent de rester connecté aux informations et avantages du réseau.",
      en: "The official WhatsApp group and the VIP plans keep you connected to the network’s news and benefits." },
    { ht: "Politik konfidansyalite", fr: "Politique de confidentialité", en: "Privacy policy" },
    { ht: "Kondisyon", fr: "Conditions", en: "Terms" }
  ];
  var PFX = [
    { ht: "Pwopriyetè / kontak :", fr: "Propriétaires / contacts :", en: "Owners / contacts:" }
  ];

  function norm(s) { return String(s).replace(/\s+/g, " ").trim(); }
  var IDX = {};
  E.forEach(function (e) { LANGS.forEach(function (l) { IDX[norm(e[l])] = e; }); });

  var DEBUG = /[?&]i18ndebug\b/.test(location.search);
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|CODE|PRE|SELECT|OPTION)$/;

  function translateNode(t, lang) {
    var raw = t.nodeValue;
    var lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
    var core = norm(raw), arrow = false;
    if (/\s→$/.test(core)) { core = core.slice(0, -1).trim(); arrow = true; }
    var e = IDX[core];
    if (e) {
      var out = lead + e[lang] + (arrow ? " →" : "") + trail;
      if (out !== raw) t.nodeValue = out;
      return;
    }
    for (var i = 0; i < PFX.length; i++) {
      for (var j = 0; j < LANGS.length; j++) {
        var k = norm(PFX[i][LANGS[j]]);
        if (core.indexOf(k) === 0) {
          var res = lead + PFX[i][lang] + core.slice(k.length) + trail;
          if (res !== raw) t.nodeValue = res;
          return;
        }
      }
    }
    if (DEBUG && lang !== "ht" && core.length > 3) console.log("[legal-i18n] pa tradui:", core);
  }

  function apply(lang) {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || SKIP.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [], n;
    while ((n = w.nextNode())) nodes.push(n);
    nodes.forEach(function (t) { translateNode(t, lang); });

    var te = IDX[norm(document.title)];
    if (te) document.title = te[lang];
    var m = document.querySelector('meta[name="description"]');
    if (m) { var me = IDX[norm(m.getAttribute("content") || "")]; if (me) m.setAttribute("content", me[lang]); }
    document.documentElement.lang = lang;
  }

  function initialLang() {
    try { var x = localStorage.getItem("doberto_lang"); if (LANGS.indexOf(x) > -1) return x; } catch (_) {}
    var d = (document.documentElement.lang || "ht").slice(0, 2);
    return LANGS.indexOf(d) > -1 ? d : "ht";
  }

  function mountSelect(cur) {
    var s = document.getElementById("langSelect");
    if (!s) {
      s = document.createElement("select");
      s.id = "langSelect";
      s.className = "lang-select";
      s.setAttribute("aria-label", "Language");
      [["ht", "KR"], ["fr", "FR"], ["en", "EN"]].forEach(function (o) {
        var op = document.createElement("option");
        op.value = o[0]; op.textContent = o[1];
        s.appendChild(op);
      });
      var host = document.querySelector(".legal-head");
      if (host) host.appendChild(s);
      else {
        s.style.cssText = "position:fixed;top:12px;right:12px;z-index:60;padding:8px 10px;border-radius:10px;border:1px solid rgba(66,232,180,.3);background:#0f1a16;color:#e8fff6";
        document.body.appendChild(s);
      }
    }
    s.value = cur;
    s.addEventListener("change", function () {
      var v = s.value;
      try { localStorage.setItem("doberto_lang", v); } catch (_) {}
      apply(v);
    });
  }

  function init() {
    var cur = initialLang();
    mountSelect(cur);
    apply(cur);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
