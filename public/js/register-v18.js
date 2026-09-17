(() => {
  'use strict';
  const COPY={
    ht:{title:'DOBERTO VCF — Enskripsyon',headline:'Antre nan rezo a',lead:'Konekte ak Google pou verifye kont ou, ajoute nimewo WhatsApp ou epi fini enskripsyon an.',flow:'Pwogrè enskripsyon',s1:'Google',s2:'Pwofil',s3:'Kominote',account:'Kont Google',loginTitle:'Konekte pou kontinye',loginDesc:'Google sèvi sèlman pou konekte ak idantifye kont ou pandan enskripsyon an.',login:'Kontinye ak Google',logout:'Dekonekte',profile:'Pwofil',info:'Enfòmasyon ou',submit:'Fini enskripsyon an',already:'Mwen deja enskri'},
    fr:{title:'DOBERTO VCF — Inscription',headline:'Rejoignez le réseau',lead:'Connectez-vous avec Google pour vérifier votre compte, ajoutez votre numéro WhatsApp puis terminez l’inscription.',flow:'Progression de l’inscription',s1:'Google',s2:'Profil',s3:'Communauté',account:'Compte Google',loginTitle:'Connectez-vous pour continuer',loginDesc:'Google sert uniquement à connecter et identifier votre compte pendant l’inscription.',login:'Continuer avec Google',logout:'Se déconnecter',profile:'Profil',info:'Vos informations',submit:'Terminer l’inscription',already:'Je suis déjà inscrit'},
    en:{title:'DOBERTO VCF — Registration',headline:'Join the network',lead:'Sign in with Google to verify your account, add your WhatsApp number, and complete registration.',flow:'Registration progress',s1:'Google',s2:'Profile',s3:'Community',account:'Google account',loginTitle:'Sign in to continue',loginDesc:'Google is used only to sign in and identify your account during registration.',login:'Continue with Google',logout:'Sign out',profile:'Profile',info:'Your information',submit:'Complete registration',already:'I am already registered'}
  };
  const lang=()=>{const s=document.getElementById('langSelect');return s&&COPY[s.value]?s.value:'ht'};
  const tr=k=>COPY[lang()]?.[k]||COPY.ht[k]||k;
  const text=(q,v)=>{const el=document.querySelector(q);if(el)el.textContent=v};
  function updateFlow(){
    const steps=[...document.querySelectorAll('.flow-step')];
    const lines=[...document.querySelectorAll('.flow-line')];
    if(steps.length<3)return;
    const current=window.DobertoGoogle?.currentSession?.()||null;
    const hasAccount=Boolean(current?.user)||Boolean(document.getElementById('googleAccountBar')&&!document.getElementById('googleAccountBar').hidden);
    const registered=Boolean(current?.registered)||Boolean(document.getElementById('registeredDone')&&!document.getElementById('registeredDone').hidden);
    let stage=hasAccount?1:0;if(registered)stage=3;
    steps.forEach((step,index)=>{step.classList.toggle('complete',index<stage);step.classList.toggle('active',stage<3&&index===stage)});
    lines.forEach((line,index)=>line.classList.toggle('complete',stage>index));
  }
  function apply(){
    document.documentElement.lang=lang();document.title=tr('title');
    text('#registrationHeadline',tr('headline'));text('#registrationLead',tr('lead'));
    const flow=document.querySelector('.flow-steps');if(flow)flow.setAttribute('aria-label',tr('flow'));
    const steps=document.querySelectorAll('.flow-step span');if(steps[0])steps[0].textContent=tr('s1');if(steps[1])steps[1].textContent=tr('s2');if(steps[2])steps[2].textContent=tr('s3');
    text('#googleAuthGate .google-auth-kicker',tr('account'));text('#googleAuthGate [data-google-copy="title"]',tr('loginTitle'));text('#googleAuthGate [data-google-copy="desc"]',tr('loginDesc'));text('#googleLoginBtn span',tr('login'));text('#googleLogoutBtn',tr('logout'));
    const heads=document.querySelectorAll('.form-section-head > *');if(heads[0])heads[0].textContent=tr('profile');if(heads[1])heads[1].textContent=tr('info');
    text('#submitBtn',tr('submit'));text('#alreadyRegisteredLink',tr('already'));updateFlow();
  }
  function ready(){apply();document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(apply,0));if('MutationObserver'in window){const o=new MutationObserver(updateFlow);['googleAuthGate','googleAccountBar','regForm','registeredDone'].forEach(id=>{const el=document.getElementById(id);if(el)o.observe(el,{attributes:true,attributeFilter:['hidden']})})}[120,420,900].forEach(ms=>setTimeout(updateFlow,ms));}
  window.DVRegisterI18n={t:tr,lang,apply,updateFlow};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
