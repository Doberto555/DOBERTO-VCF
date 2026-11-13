/* DOBERTO VCF - selekte lang anba sidebar + tradiksyon panno eksplikasyon */
(function () {
  'use strict';
  var LANGS = [['en', 'EN'], ['fr', 'FR'], ['ht', 'HT']];
  var GUIDE = {
    fr: {
      t: "Comment ajouter les contacts automatiquement",
      lead: "Ajoutez d’abord votre numéro, puis connectez Google Contacts. Les nouveaux membres seront ajoutés à votre téléphone.",
      steps: [
        "Entrez votre nom et votre numéro dans Mon profil pour apparaître dans la liste des membres.",
        "Activez l’ajout automatique et choisissez le compte Google qui recevra les contacts. Google affichera « Shizzy Connect », notre partenaire de synchronisation.",
        "Les nouveaux membres arrivent dans vos Google Contacts peu après leur inscription."
      ],
      h: "Pourquoi activer l’ajout automatique ?",
      why: [
        "Les nouveaux membres sont ajoutés à vos contacts sans que vous ayez à les télécharger.",
        "Vos statuts WhatsApp peuvent être vus par plus de membres.",
        "Vous gardez le contrôle : désactivez l’option quand vous voulez."
      ]
    },
    en: {
      t: "How to add contacts automatically",
      lead: "First add your number, then connect Google Contacts. New members will be added to your phone.",
      steps: [
        "Enter your name and number in My profile to appear in the members list.",
        "Turn on automatic add and choose the Google account that will receive the contacts. Google will show “Shizzy Connect”, our sync partner.",
        "New members arrive in your Google Contacts shortly after they register."
      ],
      h: "Why turn on automatic add?",
      why: [
        "New members are added to your contacts without you having to download them.",
        "More members can see your WhatsApp statuses.",
        "You stay in control: turn the option off whenever you want."
      ]
    },
    ht: {
      t: "Kijan pou ajoute kontak yo otomatikman",
      lead: "Ajoute nimewo ou an premye, apresa konekte Google Contacts. Nouvo manm yo ap ajoute sou telefòn ou.",
      steps: [
        "Antre non ak nimewo ou nan Mon profil pou w parèt nan lis manm yo.",
        "Aktive ajout otomatik la epi chwazi kont Google ki pral resevwa kontak yo. Google ap montre « Shizzy Connect », patnè sinkwonizasyon nou an.",
        "Nouvo manm yo antre nan Google Contacts ou yon ti tan apre yo fin enskri."
      ],
      h: "Poukisa aktive ajout otomatik la ?",
      why: [
        "Nouvo manm yo ajoute nan kontak ou san ou pa bezwen telechaje yo.",
        "Plis manm ka wè statu WhatsApp ou.",
        "Ou kenbe kontwòl: ou ka dezaktive opsyon an nenpòt ki lè."
      ]
    }
  };

  function cur() { try { return localStorage.getItem('doberto_lang') || 'ht'; } catch (_) { return 'ht'; } }

  function renderGuide() {
    var g = document.getElementById('syGuide');
    if (!g) return;
    var c = GUIDE[cur()] || GUIDE.ht;
    g.innerHTML =
      '<h3>' + c.t + '</h3><p class="sg-lead">' + c.lead + '</p>' +
      '<ol>' + c.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
      '<h4>' + c.h + '</h4>' +
      '<ul>' + c.why.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>';
  }

  function mark() {
    var l = cur();
    document.querySelectorAll('.dv-langbar button').forEach(function (b) {
      b.className = b.getAttribute('data-l') === l ? 'on' : '';
    });
  }

  function pickLang(l) {
    var btn = document.querySelector('#acLang button[data-l="' + l + '"]');
    if (btn) {
      btn.click();
    } else {
      try { localStorage.setItem('doberto_lang', l); } catch (_) {}
      location.reload();
      return;
    }
    mark();
    setTimeout(function () { renderGuide(); mark(); }, 80);
  }

  function bar() {
    var side = document.querySelector('.side');
    if (!side || document.getElementById('dvLangBar')) return;
    var st = document.createElement('style');
    st.textContent =
      '.dv-langbar{margin:auto 0 0;padding:6px;display:flex;gap:4px;border:1px solid rgba(25,229,155,.14);border-radius:14px;background:rgba(255,255,255,.02)}' +
      '.dv-langbar button{flex:1;appearance:none;border:0;background:transparent;color:#9aa9a1;font:inherit;font-weight:800;font-size:12px;letter-spacing:.08em;padding:9px 0;border-radius:10px;cursor:pointer}' +
      '.dv-langbar button.on{background:rgba(25,229,155,.14);color:#f4fbf8}' +
      '.dv-langbar button:hover{color:#f4fbf8}';
    document.head.appendChild(st);
    var d = document.createElement('div');
    d.id = 'dvLangBar'; d.className = 'dv-langbar';
    d.innerHTML = LANGS.map(function (x) { return '<button type="button" data-l="' + x[0] + '">' + x[1] + '</button>'; }).join('');
    d.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-l]');
      if (b) pickLang(b.getAttribute('data-l'));
    });
    side.appendChild(d);
    mark();
  }

  function run() { bar(); renderGuide(); mark(); }
  function boot() {
    run();
    [300, 900, 2000].forEach(function (ms) { setTimeout(run, ms); });
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('#acLang button')) setTimeout(function () { renderGuide(); mark(); }, 80);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
