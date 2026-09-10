(function loadDobertoBrand(){
  const manifest=document.querySelector('link[rel="manifest"]');
  if(manifest) manifest.href='manifest.webmanifest?v=20260910-4';
})();

const dialSelect=document.getElementById('dial');
const phoneInput=document.getElementById('phone');
const phoneHint=document.getElementById('phoneHint');
const form=document.getElementById('regForm');
const msg=document.getElementById('formMsg');
const submitBtn=document.getElementById('submitBtn');

function currentLang(){
  const select=document.getElementById('langSelect');
  return select && ['ht','fr','en'].includes(select.value) ? select.value : 'ht';
}

const COPY={
  ht:{headline:'Antre nan rezo a',lead:'Konekte kont Google ou, ajoute nimewo WhatsApp ou epi aktive Google Contacts. Apre sa sistèm nan pran swen senkronizasyon an.',submit:'Fini enskripsyon an',success:'Enskripsyon fini. Kounye a aktive Google Contacts pou kòmanse Auto-Sync.',consent:'Mwen dakò ak <a href="privacy.html" target="_blank" rel="noopener">Politik konfidansyalite</a> ak <a href="terms.html" target="_blank" rel="noopener">Kondisyon itilizasyon</a>.'},
  fr:{headline:'Rejoignez le réseau',lead:'Connectez votre compte Google, ajoutez votre numéro WhatsApp puis activez Google Contacts. Ensuite la synchronisation fonctionne automatiquement.',submit:'Terminer l’inscription',success:'Inscription terminée. Activez maintenant Google Contacts pour démarrer la synchronisation automatique.',consent:'J’accepte la <a href="privacy.html" target="_blank" rel="noopener">Politique de confidentialité</a> et les <a href="terms.html" target="_blank" rel="noopener">Conditions d’utilisation</a>.'},
  en:{headline:'Join the network',lead:'Connect your Google account, add your WhatsApp number, then enable Google Contacts. Sync runs automatically after that.',submit:'Complete registration',success:'Registration complete. Enable Google Contacts now to start automatic sync.',consent:'I agree to the <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a> and <a href="terms.html" target="_blank" rel="noopener">Terms of Use</a>.'}
};

function applyCopy(){
  const c=COPY[currentLang()]||COPY.ht;
  const headline=document.getElementById('registrationHeadline');
  const lead=document.getElementById('registrationLead');
  const consent=document.querySelector('.privacy-consent span');
  if(headline) headline.textContent=c.headline;
  if(lead) lead.textContent=c.lead;
  if(consent) consent.innerHTML=c.consent;
  if(submitBtn && !submitBtn.disabled) submitBtn.textContent=c.submit;
}

if(dialSelect && typeof COUNTRIES!=='undefined'){
  COUNTRIES.forEach(c=>{
    const opt=document.createElement('option');
    opt.value=c.dial;
    opt.textContent=`${c.name} (+${c.dial})`;
    dialSelect.appendChild(opt);
  });
  dialSelect.value='509';
  if(typeof enhancePhoneSelect==='function') enhancePhoneSelect('dial');
}

function updateHint(){
  if(!dialSelect || !phoneHint || typeof getValidationRule!=='function') return;
  const rule=getValidationRule(dialSelect.value);
  phoneHint.textContent=rule.exact ? t('hint_exact',{n:rule.exact}) : t('hint_generic');
}
if(dialSelect) dialSelect.addEventListener('change',updateHint);

function showMsg(text,ok){
  if(window.DobertoUI && typeof window.DobertoUI.toast==='function') window.DobertoUI.toast(text,ok?'info':'error');
  if(!msg) return;
  msg.textContent=text;
  msg.className='msg show '+(ok?'ok':'err');
}

function markStep(number){
  document.querySelectorAll('.flow-step').forEach((step,index)=>step.classList.toggle('active',index<number));
}

async function triggerVipInstantSync(){
  if(!window.DobertoGoogle) return;
  try{
    await fetch('/api/vip/trigger-sync',{method:'POST',headers:window.DobertoGoogle.authHeaders(true),body:'{}'});
  }catch(_){/* Standard registration must never fail because a VIP background sync failed. */}
}

if(form) form.addEventListener('submit',async(e)=>{
  e.preventDefault();
  if(msg) msg.className='msg';
  const consent=document.getElementById('privacyConsent');
  if(consent && !consent.checked){showMsg(currentLang()==='fr'?'Acceptez la politique de confidentialité pour continuer.':currentLang()==='en'?'Accept the privacy policy to continue.':'Aksepte politik konfidansyalite a pou kontinye.',false);return;}
  const name=document.getElementById('name').value.trim();
  const email=document.getElementById('email').value.trim();
  const dialCode=dialSelect.value;
  const countryName=dialSelect.options[dialSelect.selectedIndex].textContent;
  const phone=phoneInput.value.replace(/\D/g,'');
  const rule=getValidationRule(dialCode);
  if(rule.exact && phone.length!==rule.exact){showMsg(t('hint_exact',{n:rule.exact}),false);return;}
  if(!rule.exact && (phone.length<rule.min || phone.length>rule.max)){showMsg(t('hint_generic'),false);return;}

  submitBtn.disabled=true;
  submitBtn.textContent=t('btn_sending');
  try{
    const res=await fetch('/api/register',{
      method:'POST',
      headers:window.DobertoGoogle?window.DobertoGoogle.authHeaders(true):{'Content-Type':'application/json'},
      body:JSON.stringify({name,email,dialCode,countryName,phone})
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok){showMsg(typeof errT==='function'?errT(data):(data.error||'Enskripsyon an pa fini.'),false);return;}

    try{
      localStorage.setItem('dv_registered','1');
      localStorage.setItem('dv_member_name',name);
      localStorage.setItem('dv_member_dial',dialCode);
      localStorage.setItem('dv_member_phone',phone);
    }catch(_){}

    if(window.DobertoGoogle) window.DobertoGoogle.registrationCompleted({name,email,dial_code:dialCode,phone});
    triggerVipInstantSync();
    markStep(3);
    showMsg(COPY[currentLang()].success,true);
    const syncPanel=document.getElementById('googleSyncPanel');
    if(syncPanel){
      syncPanel.hidden=false;
      window.setTimeout(()=>syncPanel.scrollIntoView({behavior:'smooth',block:'center'}),120);
    }
  }catch(err){showMsg(t('err_no_connection'),false);}
  finally{submitBtn.disabled=false;applyCopy();}
});

document.addEventListener('DOMContentLoaded',()=>{
  applyCopy();
  updateHint();
  document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(()=>{applyCopy();updateHint();},0));
});
