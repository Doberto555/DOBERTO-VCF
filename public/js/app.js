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
const WHATSAPP_GROUP_URL='https://chat.whatsapp.com/GySPeuvDlI14BnWWvdm7U4?s=sh&p=a&mlu=4&ilr=4';
let communityPopup=null;

function currentLang(){
  const select=document.getElementById('langSelect');
  return select && ['ht','fr','en'].includes(select.value) ? select.value : 'ht';
}

const COPY={
  ht:{headline:'Antre nan rezo a',lead:'Konekte kont Google ou, ajoute nimewo WhatsApp ou epi fini enskripsyon an. Apre sa n ap mennen w nan kominote WhatsApp DOBERTO VCF la.',submit:'Fini enskripsyon an',success:'Enskripsyon fini. N ap ouvri group WhatsApp la epi mennen w sou paj kominote a…',consent:'Mwen dakò ak <a href="privacy.html" target="_blank" rel="noopener">Politik konfidansyalite</a> ak <a href="terms.html" target="_blank" rel="noopener">Kondisyon itilizasyon</a>.'},
  fr:{headline:'Rejoignez le réseau',lead:'Connectez votre compte Google, ajoutez votre numéro WhatsApp puis terminez l’inscription. Ensuite, nous vous dirigeons vers la communauté WhatsApp DOBERTO VCF.',submit:'Terminer l’inscription',success:'Inscription terminée. Nous ouvrons le groupe WhatsApp puis la page communauté…',consent:'J’accepte la <a href="privacy.html" target="_blank" rel="noopener">Politique de confidentialité</a> et les <a href="terms.html" target="_blank" rel="noopener">Conditions d’utilisation</a>.'},
  en:{headline:'Join the network',lead:'Connect your Google account, add your WhatsApp number, and complete registration. Then we’ll take you to the DOBERTO VCF WhatsApp community.',submit:'Complete registration',success:'Registration complete. Opening the WhatsApp group and community page…',consent:'I agree to the <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a> and <a href="terms.html" target="_blank" rel="noopener">Terms of Use</a>.'}
};

function applyCopy(){
  const c=COPY[currentLang()]||COPY.ht;
  const headline=document.getElementById('registrationHeadline');
  const lead=document.getElementById('registrationLead');
  const consent=document.querySelector('.privacy-consent .privacy-copy');
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

function rememberRegistration(registration){
  try{
    localStorage.setItem('dv_registered','1');
    localStorage.setItem('dv_member_name',registration.name||'');
    localStorage.setItem('dv_member_dial',registration.dial_code||registration.dialCode||'');
    localStorage.setItem('dv_member_phone',registration.phone||'');
  }catch(_){}
}

function prepareCommunityPopup(){
  try{
    communityPopup=window.open('about:blank','dobertoVcfCommunity');
    if(communityPopup){
      communityPopup.document.open();
      communityPopup.document.write('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>DOBERTO VCF</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#06100c;color:#dff7ed;font:600 14px Arial,sans-serif}.box{text-align:center;padding:28px}.dot{width:34px;height:34px;margin:0 auto 16px;border:3px solid rgba(80,230,175,.18);border-top-color:#50e6af;border-radius:50%;animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}</style></head><body><div class="box"><div class="dot"></div>DOBERTO VCF<br><small>N ap fini enskripsyon an…</small></div></body></html>');
      communityPopup.document.close();
    }else{
      sessionStorage.setItem('dv_group_popup_blocked','1');
    }
  }catch(_){
    communityPopup=null;
    try{sessionStorage.setItem('dv_group_popup_blocked','1')}catch(__){}
  }
}

function cancelCommunityPopup(){
  try{if(communityPopup && !communityPopup.closed)communityPopup.close()}catch(_){}
  communityPopup=null;
}

function finishRegistration(registration){
  const normalized={
    name:registration.name||'',
    email:registration.email||document.getElementById('email')?.value.trim()||'',
    dial_code:registration.dial_code||registration.dialCode||dialSelect?.value||'',
    phone:registration.phone||phoneInput?.value.replace(/\D/g,'')||''
  };
  rememberRegistration(normalized);
  if(window.DobertoGoogle) window.DobertoGoogle.registrationCompleted(normalized);
  triggerVipInstantSync();
  markStep(3);
  showMsg(COPY[currentLang()].success,true);
  try{sessionStorage.setItem('dv_community_new','1')}catch(_){}
  try{
    if(communityPopup && !communityPopup.closed){
      communityPopup.location.replace(WHATSAPP_GROUP_URL);
    }else{
      sessionStorage.setItem('dv_group_popup_blocked','1');
    }
  }catch(_){try{sessionStorage.setItem('dv_group_popup_blocked','1')}catch(__){}}
  window.setTimeout(()=>location.assign('community.html?welcome=1'),420);
}

async function reconcileRegistration(fallback){
  if(!window.DobertoGoogle) return false;
  try{
    const response=await fetch('/api/auth/session',{headers:window.DobertoGoogle.authHeaders(false),cache:'no-store'});
    if(!response.ok) return false;
    const session=await response.json().catch(()=>null);
    if(!session?.registered) return false;
    finishRegistration({...fallback,...(session.registration||{}),email:session.user?.email||fallback.email||''});
    return true;
  }catch(_){return false;}
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
  const registration={name,email,dialCode,dial_code:dialCode,countryName,phone};
  const rule=getValidationRule(dialCode);
  if(rule.exact && phone.length!==rule.exact){showMsg(t('hint_exact',{n:rule.exact}),false);return;}
  if(!rule.exact && (phone.length<rule.min || phone.length>rule.max)){showMsg(t('hint_generic'),false);return;}

  prepareCommunityPopup();
  submitBtn.disabled=true;
  submitBtn.textContent=t('btn_sending');
  try{
    const res=await fetch('/api/register',{
      method:'POST',
      headers:window.DobertoGoogle?window.DobertoGoogle.authHeaders(true):{'Content-Type':'application/json'},
      body:JSON.stringify({name,email,dialCode,countryName,phone})
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      if((res.status>=500 || res.status===409) && await reconcileRegistration(registration)) return;
      cancelCommunityPopup();
      showMsg(typeof errT==='function'?errT(data):(data.error||'Enskripsyon an pa fini.'),false);
      return;
    }
    finishRegistration(registration);
  }catch(err){
    if(!(await reconcileRegistration(registration))){cancelCommunityPopup();showMsg(t('err_no_connection'),false);}
  }
  finally{submitBtn.disabled=false;applyCopy();}
});

document.addEventListener('DOMContentLoaded',()=>{
  applyCopy();
  updateHint();
  document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(()=>{applyCopy();updateHint();},0));
});
