/* DOBERTO VCF - panno eksplikasyon bò Ajout automatique (style Shizzy) */
(function () {
  'use strict';
  var CSS =
    '.sy-wrap{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px;align-items:start}' +
    '.sy-wrap:has(#syncSec[hidden]){display:none}' +
    '@media(max-width:1100px){.sy-wrap{grid-template-columns:1fr}}' +
    '.sy-guide{background:#0c1712;border:1px solid rgba(25,229,155,.14);border-radius:24px;padding:26px 24px;color:#f4fbf8}' +
    '.sy-guide h3{margin:0 0 8px;font-size:18px;font-weight:800;color:#f4fbf8}' +
    '.sy-guide .sg-lead{margin:0 0 20px;color:#9aa9a1;font-size:13.5px;line-height:1.6}' +
    '.sy-guide ol,.sy-guide ul{list-style:none;margin:0;padding:0;display:grid}' +
    '.sy-guide ol{gap:16px;margin-bottom:24px;counter-reset:sg}' +
    '.sy-guide ul{gap:10px}' +
    '.sy-guide li{display:grid;grid-template-columns:30px 1fr;gap:12px;align-items:start;font-size:14.5px;line-height:1.55;color:#f4fbf8}' +
    '.sy-guide ol li::before{counter-increment:sg;content:counter(sg);display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:rgba(241,201,107,.12);color:#f1c96b;font-weight:800;font-size:13px}' +
    '.sy-guide h4{margin:0 0 10px;color:#f1c96b;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}' +
    '.sy-guide ul li{grid-template-columns:20px 1fr;gap:10px;font-size:13px;color:#9aa9a1}' +
    '.sy-guide ul li::before{content:"✓";display:grid;place-items:center;width:18px;height:18px;border-radius:50%;border:1px solid rgba(25,229,155,.5);color:#19e59b;font-size:11px}';

  function build() {
    var sec = document.getElementById('syncSec');
    if (!sec || document.getElementById('syGuide')) return;
    var st = document.createElement('style');
    st.id = 'syGuideStyle';
    st.textContent = CSS;
    document.head.appendChild(st);

    var wrap = document.createElement('div');
    wrap.className = 'sy-wrap';
    sec.parentNode.insertBefore(wrap, sec);
    wrap.appendChild(sec);

    var g = document.createElement('aside');
    g.id = 'syGuide';
    g.className = 'sy-guide';
    g.innerHTML =
      '<h3>Comment ajouter les contacts automatiquement</h3>' +
      '<p class="sg-lead">Ajoutez d’abord votre numéro, puis connectez Google Contacts. Les nouveaux membres seront ajoutés à votre téléphone.</p>' +
      '<ol>' +
        '<li>Entrez votre nom et votre numéro dans Mon profil pour apparaître dans la liste des membres.</li>' +
        '<li>Activez l’ajout automatique et choisissez le compte Google qui recevra les contacts. Google affichera « Shizzy Connect », notre partenaire de synchronisation.</li>' +
        '<li>Les nouveaux membres arrivent dans vos Google Contacts peu après leur inscription.</li>' +
      '</ol>' +
      '<h4>Pourquoi activer l’ajout automatique ?</h4>' +
      '<ul>' +
        '<li>Les nouveaux membres sont ajoutés à vos contacts sans que vous ayez à les télécharger.</li>' +
        '<li>Vos statuts WhatsApp peuvent être vus par plus de membres.</li>' +
        '<li>Vous gardez le contrôle : désactivez l’option quand vous voulez.</li>' +
      '</ul>';
    wrap.appendChild(g);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();
