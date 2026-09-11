(() => {
  'use strict';
  if (window.__DOBERTO_UI_L10N_V18__) return;
  window.__DOBERTO_UI_L10N_V18__ = true;

  const COPY = {
    ht: {
      dock:['Akèy','Enskri','Manm'], logout:'Dekonekte',
      homeSyncTitle:'Kenbe kontak ou ajou otomatikman',
      homeSyncDesc:'Aktive Google Contacts sèlman si ou vle. Plan Standard lan kòmanse Auto-Sync apre 10 minit. VIP senkronize touswit.',
      homeAuto:'Kenbe Auto-Sync aktive',
      regIntroTitle:'Antre nan rezo a',
      regIntroDesc:'Konekte ak Google. Ajoute nimewo WhatsApp ou. Apre sa aktive Google Contacts si ou vle Auto-Sync.',
      flow:['Google','Profil','Sync'],
      gateKicker:'Kont Google', gateTitle:'Konekte pou kontinye', gateDesc:'Google sèvi pou idantifye kont ou. Otorizasyon Google Contacts fèt apa.', login:'Kontinye ak Google',
      formSmall:'Profil', formTitle:'Enfòmasyon ou', consentStart:'Mwen dakò ak', privacy:'Politik konfidansyalite', and:'ak', terms:'Kondisyon itilizasyon', finish:'Fini enskripsyon an', already:'Mwen deja enskri',
      syncKicker:'Google Contacts', syncTitle:'Aktive senkronizasyon', syncDesc:'Standard kòmanse otomatikman apre 10 minit. VIP senkronize touswit.', syncAuto:'Kenbe Auto-Sync aktive', vipLink:'VIP: senkronizasyon imedyat',
      standard:'Auto-Sync apre 10 minit', standardDesc:'Aktive Google Contacts yon sèl fwa. Sistèm nan ap kontinye ajoute nouvo kontak otomatikman.',
      vip:'Auto-Sync imedyat', vipDesc:'Nouvo kontak yo antre san tann sik Standard la.', discover:'Dekouvri VIP',
      privacyNoteTitle:'Nimewo ou rete prive.', privacyNoteDesc:'Li pa parèt sou anyè piblik manm yo.'
    },
    fr: {
      dock:['Accueil','Inscription','Membres'], logout:'Se déconnecter',
      homeSyncTitle:'Gardez vos contacts à jour automatiquement',
      homeSyncDesc:'Activez Google Contacts uniquement si vous le souhaitez. Le plan Standard démarre Auto-Sync après 10 minutes. VIP synchronise immédiatement.',
      homeAuto:'Maintenir Auto-Sync activé',
      regIntroTitle:'Rejoignez le réseau',
      regIntroDesc:'Connectez-vous avec Google. Ajoutez votre numéro WhatsApp. Activez ensuite Google Contacts si vous souhaitez Auto-Sync.',
      flow:['Google','Profil','Sync'],
      gateKicker:'Compte Google', gateTitle:'Connectez-vous pour continuer', gateDesc:'Google sert à identifier votre compte. L’autorisation Google Contacts est demandée séparément.', login:'Continuer avec Google',
      formSmall:'Profil', formTitle:'Vos informations', consentStart:'J’accepte la', privacy:'Politique de confidentialité', and:'et les', terms:'Conditions d’utilisation', finish:'Terminer l’inscription', already:'Je suis déjà inscrit',
      syncKicker:'Google Contacts', syncTitle:'Activer la synchronisation', syncDesc:'Standard démarre automatiquement après 10 minutes. VIP synchronise immédiatement.', syncAuto:'Maintenir Auto-Sync activé', vipLink:'VIP : synchronisation immédiate',
      standard:'Auto-Sync après 10 minutes', standardDesc:'Activez Google Contacts une seule fois. Le système continuera ensuite à ajouter automatiquement les nouveaux contacts.',
      vip:'Auto-Sync immédiat', vipDesc:'Les nouveaux contacts sont ajoutés sans attendre le cycle Standard.', discover:'Découvrir VIP',
      privacyNoteTitle:'Votre numéro reste privé.', privacyNoteDesc:'Il n’apparaît pas dans l’annuaire public des membres.'
    },
    en: {
      dock:['Home','Register','Members'], logout:'Sign out',
      homeSyncTitle:'Keep your contacts updated automatically',
      homeSyncDesc:'Enable Google Contacts only if you want to. Standard starts Auto-Sync after 10 minutes. VIP syncs immediately.',
      homeAuto:'Keep Auto-Sync enabled',
      regIntroTitle:'Join the network',
      regIntroDesc:'Sign in with Google. Add your WhatsApp number. Then enable Google Contacts if you want Auto-Sync.',
      flow:['Google','Profile','Sync'],
      gateKicker:'Google account', gateTitle:'Sign in to continue', gateDesc:'Google is used to identify your account. Google Contacts permission is requested separately.', login:'Continue with Google',
      formSmall:'Profile', formTitle:'Your information', consentStart:'I agree to the', privacy:'Privacy Policy', and:'and', terms:'Terms of Use', finish:'Complete registration', already:'I am already registered',
      syncKicker:'Google Contacts', syncTitle:'Enable synchronization', syncDesc:'Standard starts automatically after 10 minutes. VIP syncs immediately.', syncAuto:'Keep Auto-Sync enabled', vipLink:'VIP: instant synchronization',
      standard:'Auto-Sync after 10 minutes', standardDesc:'Enable Google Contacts once. The system will then continue adding new contacts automatically.',
      vip:'Instant Auto-Sync', vipDesc:'New contacts are added without waiting for the Standard cycle.', discover:'Discover VIP',
      privacyNoteTitle:'Your number stays private.', privacyNoteDesc:'It is not shown in the public member directory.'
    }
  };

  function lang(){
    const select=document.getElementById('langSelect');
    if(select && COPY[select.value]) return select.value;
    try { const saved=localStorage.getItem('doberto_lang'); if(COPY[saved]) return saved; } catch(_){}
    return 'ht';
  }
  function text(sel,value){const el=document.querySelector(sel);if(el&&value!=null&&el.textContent!==value)el.textContent=value;}

  function applyDock(c){
    const links=document.querySelectorAll('.dv-mobile-dock a span');
    if(links.length>=3){links[0].textContent=c.dock[0];links[1].textContent=c.dock[1];links[2].textContent=c.dock[2];}
  }

  function applyHome(c){
    if(!document.body.classList.contains('home-page')) return;
    text('#googleLogoutBtn',c.logout);
    text('.google-home-sync #googleSyncPanel h3',c.homeSyncTitle);
    text('.google-home-sync #googleSyncDescription',c.homeSyncDesc);
    text('.google-home-sync #googleAutoSyncWrap span',c.homeAuto);
    const consoleSync=document.querySelector('.console-stat strong');
    document.querySelectorAll('.console-stat').forEach(card=>{
      const label=card.querySelector('span');
      if(label && /Auto-Sync/i.test(label.textContent||'')){
        const value=card.querySelector('strong'); if(value)value.textContent='10 min';
      }
    });
  }

  function applyRegister(c){
    if(!document.body.classList.contains('register-page')) return;
    text('#registrationHeadline',c.regIntroTitle); text('#registrationLead',c.regIntroDesc);
    document.querySelectorAll('.flow-step span').forEach((el,i)=>{if(c.flow[i])el.textContent=c.flow[i];});
    text('#googleAuthGate .google-auth-kicker',c.gateKicker); text('#googleAuthGate h2',c.gateTitle); text('#googleAuthGate p',c.gateDesc); text('#googleLoginBtn span',c.login);
    text('#googleLogoutBtn',c.logout);
    const fh=document.querySelector('.form-section-head'); if(fh){text('.form-section-head span',c.formSmall);text('.form-section-head strong',c.formTitle);}
    const consent=document.querySelector('.privacy-consent .privacy-copy');
    if(consent) consent.innerHTML=`${c.consentStart} <a href="privacy.html" target="_blank" rel="noopener">${c.privacy}</a> ${c.and} <a href="terms.html" target="_blank" rel="noopener">${c.terms}</a>.`;
    text('#submitBtn',c.finish); text('#alreadyRegisteredLink',c.already);
    text('#googleSyncPanel .google-auth-kicker',c.syncKicker); text('#googleSyncPanel h3',c.syncTitle); text('#googleSyncDescription',c.syncDesc); text('#googleAutoSyncWrap span',c.syncAuto);
    const vipLink=document.querySelector('.vip-inline-link'); if(vipLink){vipLink.childNodes[0].nodeValue=c.vipLink+' ';}
    const tiers=document.querySelectorAll('.sync-tier-card');
    if(tiers[0]){text('.sync-tier-card:nth-of-type(1) strong',c.standard);text('.sync-tier-card:nth-of-type(1) p',c.standardDesc);}
    if(tiers[1]){text('.sync-tier-card:nth-of-type(2) strong',c.vip);text('.sync-tier-card:nth-of-type(2) p',c.vipDesc);text('.sync-tier-card:nth-of-type(2) a',c.discover);}
    text('.privacy-note strong',c.privacyNoteTitle);
    const privacyP=document.querySelector('.privacy-note p'); if(privacyP){const strong=privacyP.querySelector('strong'); if(strong){let node=[...privacyP.childNodes].find(n=>n.nodeType===3); if(node)node.nodeValue=' '+c.privacyNoteDesc;}}
  }

  function apply(){const c=COPY[lang()]||COPY.ht;applyDock(c);applyHome(c);applyRegister(c);}
  function schedule(){setTimeout(apply,20);setTimeout(apply,220);}

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true}); else schedule();
  document.getElementById('langSelect')?.addEventListener('change',schedule);
  window.addEventListener('pageshow',schedule);
})();
