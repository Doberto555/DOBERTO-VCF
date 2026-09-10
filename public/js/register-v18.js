(() => {
  'use strict';

  const COPY = {
    ht: {
      title:'DOBERTO VCF — Enskripsyon', headline:'Antre nan rezo a', lead:'Konekte kont Google ou, ajoute nimewo WhatsApp ou epi aktive Google Contacts. Apre sa sistèm nan pran swen senkronizasyon an.',
      stepProfile:'Pwofil', account:'Kont Google', loginTitle:'Konekte pou kontinye', loginDesc:'Google sèvi sèlman pou idantifye kont ou. Aksè Google Contacts mande yon lòt otorizasyon apa.', loginBtn:'Kontinye ak Google',
      profile:'Pwofil', yourInfo:'Enfòmasyon ou', consent:'Mwen dakò ak {privacy} ak {terms}.', privacy:'Politik konfidansyalite', terms:'Kondisyon itilizasyon', submit:'Fini enskripsyon an', already:'Mwen deja enskri', logout:'Dekonekte',
      contacts:'Google Contacts', syncTitle:'Aktive senkronizasyon', syncDesc:'Apre ou bay otorizasyon an, plan Standard la kòmanse senkronize otomatikman apre 10 minit. VIP senkronize touswit.', notConnected:'Google Contacts poko konekte.', connect:'Aktive Google Contacts', reconnect:'Rekonekte Google Contacts', syncNow:'Senkronize kounye a', auto:'Kenbe Auto-Sync aktive', vipLink:'VIP: senkronizasyon imedyat',
      standardTitle:'Auto-Sync apre 10 minit', standardDesc:'Aktive Google Contacts yon sèl fwa. Sistèm nan ap kontinye mete nouvo kontak yo ajou otomatikman.', vipTitle:'Auto-Sync imedyat', vipDesc:'Nouvo kontak yo antre san tann pwochen sik Standard la.', discoverVip:'Dekouvri VIP', privacyTitle:'Nimewo ou rete prive.', privacyDesc:'Li pa parèt sou anyè piblik manm yo.',
      wait:'Tanpri tann...', syncing:'Senkronizasyon...', connected:'Google Contacts konekte. Premye senkronizasyon an pare.', lastSync:'Dènye senkronizasyon: {date}', syncError:'Dènye sync la gen yon pwoblèm: {error}', offline:'Pa gen koneksyon entènèt kounye a. Sync la ap retounen lè koneksyon an disponib.', contactsConnected:'Google Contacts konekte. {count} kontak senkronize.', contactsAdded:'{count} nouvo kontak ajoute nan Google Contacts ou.'
    },
    fr: {
      title:'DOBERTO VCF — Inscription', headline:'Rejoignez le réseau', lead:'Connectez votre compte Google, ajoutez votre numéro WhatsApp puis activez Google Contacts. Le système gère ensuite la synchronisation automatiquement.',
      stepProfile:'Profil', account:'Compte Google', loginTitle:'Connectez-vous pour continuer', loginDesc:'Google sert uniquement à identifier votre compte. L’accès à Google Contacts nécessite une autorisation distincte.', loginBtn:'Continuer avec Google',
      profile:'Profil', yourInfo:'Vos informations', consent:'J’accepte la {privacy} et les {terms}.', privacy:'Politique de confidentialité', terms:'Conditions d’utilisation', submit:'Terminer l’inscription', already:'Je suis déjà inscrit', logout:'Se déconnecter',
      contacts:'Google Contacts', syncTitle:'Activer la synchronisation', syncDesc:'Après autorisation, le plan Standard démarre automatiquement la synchronisation après 10 minutes. Le plan VIP synchronise immédiatement.', notConnected:'Google Contacts n’est pas encore connecté.', connect:'Activer Google Contacts', reconnect:'Reconnecter Google Contacts', syncNow:'Synchroniser maintenant', auto:'Maintenir Auto-Sync activé', vipLink:'VIP : synchronisation immédiate',
      standardTitle:'Auto-Sync après 10 minutes', standardDesc:'Activez Google Contacts une seule fois. Le système continuera ensuite à ajouter automatiquement les nouveaux contacts.', vipTitle:'Auto-Sync immédiat', vipDesc:'Les nouveaux contacts sont ajoutés sans attendre le prochain cycle Standard.', discoverVip:'Découvrir VIP', privacyTitle:'Votre numéro reste privé.', privacyDesc:'Il n’apparaît pas dans l’annuaire public des membres.',
      wait:'Veuillez patienter…', syncing:'Synchronisation…', connected:'Google Contacts est connecté. La première synchronisation est prête.', lastSync:'Dernière synchronisation : {date}', syncError:'La dernière synchronisation a rencontré un problème : {error}', offline:'Aucune connexion Internet actuellement. La synchronisation reprendra dès que la connexion sera disponible.', contactsConnected:'Google Contacts est connecté. {count} contact(s) synchronisé(s).', contactsAdded:'{count} nouveau(x) contact(s) ajouté(s) à Google Contacts.'
    },
    en: {
      title:'DOBERTO VCF — Registration', headline:'Join the network', lead:'Connect your Google account, add your WhatsApp number, then enable Google Contacts. The system handles synchronization automatically after that.',
      stepProfile:'Profile', account:'Google account', loginTitle:'Sign in to continue', loginDesc:'Google is used only to identify your account. Google Contacts requires a separate permission.', loginBtn:'Continue with Google',
      profile:'Profile', yourInfo:'Your information', consent:'I agree to the {privacy} and {terms}.', privacy:'Privacy Policy', terms:'Terms of Use', submit:'Complete registration', already:'I am already registered', logout:'Sign out',
      contacts:'Google Contacts', syncTitle:'Enable synchronization', syncDesc:'After permission is granted, the Standard plan starts syncing automatically after 10 minutes. VIP syncs immediately.', notConnected:'Google Contacts is not connected yet.', connect:'Enable Google Contacts', reconnect:'Reconnect Google Contacts', syncNow:'Sync now', auto:'Keep Auto-Sync enabled', vipLink:'VIP: instant synchronization',
      standardTitle:'Auto-Sync after 10 minutes', standardDesc:'Enable Google Contacts once. The system will then continue adding new contacts automatically.', vipTitle:'Instant Auto-Sync', vipDesc:'New contacts are added without waiting for the next Standard cycle.', discoverVip:'Explore VIP', privacyTitle:'Your number stays private.', privacyDesc:'It is not shown in the public member directory.',
      wait:'Please wait…', syncing:'Synchronizing…', connected:'Google Contacts is connected. The first synchronization is ready.', lastSync:'Last synchronization: {date}', syncError:'The last sync encountered a problem: {error}', offline:'There is no Internet connection right now. Sync will resume when the connection is available.', contactsConnected:'Google Contacts connected. {count} contact(s) synchronized.', contactsAdded:'{count} new contact(s) added to your Google Contacts.'
    }
  };

  function lang(){
    const select=document.getElementById('langSelect');
    const value=select && ['ht','fr','en'].includes(select.value) ? select.value : (window.currentLang || 'ht');
    return COPY[value] ? value : 'ht';
  }
  function tr(key,vars){
    let value=(COPY[lang()]&&COPY[lang()][key])||COPY.ht[key]||key;
    Object.entries(vars||{}).forEach(([k,v])=>{value=value.replace(`{${k}}`,String(v));});
    return value;
  }
  function text(selector,value){const el=document.querySelector(selector);if(el)el.textContent=value;}

  function apply(){
    document.title=tr('title');
    text('#registrationHeadline',tr('headline'));
    text('#registrationLead',tr('lead'));
    const steps=document.querySelectorAll('.flow-step span');
    if(steps[1])steps[1].textContent=tr('stepProfile');
    text('#googleAuthGate .google-auth-kicker',tr('account'));
    text('#googleAuthGate [data-google-copy="title"]',tr('loginTitle'));
    text('#googleAuthGate [data-google-copy="desc"]',tr('loginDesc'));
    text('#googleLoginBtn span',tr('loginBtn'));
    text('#googleLogoutBtn',tr('logout'));
    const formHead=document.querySelectorAll('.form-section-head > *');
    if(formHead[0])formHead[0].textContent=tr('profile');
    if(formHead[1])formHead[1].textContent=tr('yourInfo');
    const consent=document.querySelector('.privacy-copy');
    if(consent){
      const html=tr('consent',{privacy:`<a href="privacy.html" target="_blank" rel="noopener">${tr('privacy')}</a>`,terms:`<a href="terms.html" target="_blank" rel="noopener">${tr('terms')}</a>`});
      consent.innerHTML=html;
    }
    text('#submitBtn',tr('submit'));
    text('#alreadyRegisteredLink',tr('already'));
    text('#googleSyncPanel .google-auth-kicker',tr('contacts'));
    text('#googleSyncPanel h3',tr('syncTitle'));
    text('#googleSyncDescription',tr('syncDesc'));
    const status=document.getElementById('googleSyncStatus');
    if(status && (!status.dataset.dynamic || status.dataset.dynamic==='initial'))status.textContent=tr('notConnected');
    const connect=document.getElementById('googleConnectBtn');
    if(connect && !connect.dataset.connected)connect.textContent=tr('connect');
    text('#googleSyncNowBtn',tr('syncNow'));
    text('#googleAutoSyncWrap span',tr('auto'));
    const vipInline=document.querySelector('.vip-inline-link');
    if(vipInline)vipInline.innerHTML=`${tr('vipLink')} <span>→</span>`;
    const tiers=document.querySelectorAll('.sync-tier-card');
    if(tiers[0]){const strong=tiers[0].querySelector('strong'),p=tiers[0].querySelector('p');if(strong)strong.textContent=tr('standardTitle');if(p)p.textContent=tr('standardDesc');}
    if(tiers[1]){const strong=tiers[1].querySelector('strong'),p=tiers[1].querySelector('p'),a=tiers[1].querySelector('a');if(strong)strong.textContent=tr('vipTitle');if(p)p.textContent=tr('vipDesc');if(a)a.textContent=tr('discoverVip');}
    const privacy=document.querySelector('.privacy-note p');
    if(privacy)privacy.innerHTML=`<strong>${tr('privacyTitle')}</strong>${tr('privacyDesc')}`;
  }

  window.DVRegisterI18n={t:tr,lang,apply};

  const ready=()=>{
    apply();
    document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(apply,0));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
