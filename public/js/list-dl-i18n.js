(function () {
  "use strict";
  var T = {
    ht: {
      title: "Telechaje fichye VCF la",
      desc: "Telechajman an ap louvri otomatikman lè kantite manm yo rive nan limit admin lan chwazi. Admin lan ka bloke oswa debloke li nenpòt lè.",
      gTitle: "Verifye ak kont Google ou",
      gText: "Si w konekte ak menm kont Google ou te itilize lè w te enskri a, sistèm nan ap jwenn enskripsyon ou otomatikman.",
      gBtn: "Konekte ak Google",
      name: "Non ou te itilize",
      country: "Peyi",
      phone: "Nimewo WhatsApp",
      dialAria: "Kòd peyi",
      phonePh: "Nimewo san kòd peyi"
    },
    fr: {
      title: "Télécharger le fichier VCF",
      desc: "Le téléchargement s’ouvrira automatiquement lorsque le nombre de membres atteindra la limite fixée par l’administrateur. L’administrateur peut le bloquer ou le débloquer à tout moment.",
      gTitle: "Vérifier avec votre compte Google",
      gText: "Si vous vous connectez avec le même compte Google que celui utilisé lors de votre inscription, le système retrouvera automatiquement votre inscription.",
      gBtn: "Se connecter avec Google",
      name: "Nom utilisé lors de l’inscription",
      country: "Pays",
      phone: "Numéro WhatsApp",
      dialAria: "Indicatif du pays",
      phonePh: "Numéro sans indicatif du pays"
    },
    en: {
      title: "Download the VCF file",
      desc: "The download will open automatically once the number of members reaches the limit set by the admin. The admin can lock or unlock it at any time.",
      gTitle: "Verify with your Google account",
      gText: "If you sign in with the same Google account you used to register, the system will find your registration automatically.",
      gBtn: "Sign in with Google",
      name: "Name you used",
      country: "Country",
      phone: "WhatsApp number",
      dialAria: "Country code",
      phonePh: "Number without country code"
    }
  };

  function lang() {
    var s = document.getElementById("langSelect");
    return s && T[s.value] ? s.value : "ht";
  }
  function setText(id, v) {
    var e = document.getElementById(id);
    if (e && e.textContent !== v) e.textContent = v;
  }
  function apply() {
    var t = T[lang()];
    setText("vcfDownloadTitle", t.title);
    setText("vcfDownloadDesc", t.desc);
    setText("vcfGoogleTitle", t.gTitle);
    setText("vcfGoogleText", t.gText);
    setText("vcfGoogleLoginBtn", t.gBtn);
    var spans = document.querySelectorAll("#vcfDownloadForm > label > span");
    [t.name, t.country, t.phone].forEach(function (v, i) {
      if (spans[i] && spans[i].textContent !== v) spans[i].textContent = v;
    });
    var dial = document.getElementById("vcfDial");
    if (dial) dial.setAttribute("aria-label", t.dialAria);
    var ph = document.getElementById("vcfPhone");
    if (ph) ph.setAttribute("placeholder", t.phonePh);
  }

  function init() {
    apply();
    var s = document.getElementById("langSelect");
    if (s) s.addEventListener("change", apply);
    /* list.js applyLanguage() ekri document.documentElement.lang a chak fwa: sa a se siyal nou */
    new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    window.addEventListener("pageshow", apply);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
