(function loadDobertoBrand(){
  const manifest=document.querySelector('link[rel="manifest"]');
  if(manifest) manifest.href='manifest.webmanifest?v=20260910-3';
  document.querySelectorAll('link[rel~="icon"]').forEach((el)=>el.remove());
  const icon=document.createElement('link');
  icon.rel='icon'; icon.type='image/png'; icon.href='icons/doberto-vcf-192.png?v=20260904-1';
  document.head.appendChild(icon);
})();

const dialSelect=document.getElementById('dial');
const phoneInput=document.getElementById('phone');
const phoneHint=document.getElementById('phoneHint');
const form=document.getElementById('regForm');
const msg=document.getElementById('formMsg');
const submitBtn=document.getElementById('submitBtn');

function currentHomeLang(){
  const select=document.getElementById('langSelect');
  return select && ['ht','fr','en'].includes(select.value) ? select.value : (window.currentLang || 'ht');
}

const REGISTER_PAGE_COPY={
  ht:{title:'Antre nan rezo DOBERTO VCF la',desc:'Konekte ak Google, ajoute nimewo WhatsApp ou epi chwazi apa si ou vle aktive Google Contacts.',submit:'Fini enskripsyon an',already:'Mwen deja enskri'},
  fr:{title:'Rejoignez le réseau DOBERTO VCF',desc:'Connectez-vous avec Google, ajoutez votre numéro WhatsApp puis choisissez séparément si vous souhaitez activer Google Contacts.',submit:'Terminer l’inscription',already:'Je suis déjà inscrit'},
  en:{title:'Join the DOBERTO VCF network',desc:'Sign in with Google, add your WhatsApp number, then separately choose whether you want to enable Google Contacts.',submit:'Complete registration',already:'I am already registered'}
};

function applyRegisterPageCopy(){
  const lang=currentHomeLang();
  const c=REGISTER_PAGE_COPY[lang]||REGISTER_PAGE_COPY.ht;
  const title=document.querySelector('.page-hero h1 [data-i18n="hero_title_1"]');
  const desc=document.querySelector('.page-hero [data-i18n="hero_desc"]');
  const already=document.getElementById('alreadyRegisteredLink');
  if(title) title.textContent=c.title;
  if(desc) desc.textContent=c.desc;
  if(submitBtn && !submitBtn.disabled) submitBtn.textContent=c.submit;
  if(already) already.textContent=c.already;
}

if(dialSelect && typeof COUNTRIES!=='undefined'){
  COUNTRIES.forEach(c=>{
    const opt=document.createElement('option');
    opt.value=c.dial;
    opt.textContent=`${c.name} (+${c.dial})`;
    dialSelect.appendChild(opt);
  });
  dialSelect.value='509';
  enhancePhoneSelect('dial');
}

function updateHint(){
  if(!dialSelect || !phoneHint) return;
  const rule=getValidationRule(dialSelect.value);
  phoneHint.textContent=rule.exact ? t('hint_exact',{n:rule.exact}) : t('hint_generic');
}
if(dialSelect) dialSelect.addEventListener('change',updateHint);

function showMsg(text,ok){
  if(!msg) return;
  msg.textContent=text;
  msg.className='msg show '+(ok?'ok':'err');
}

if(form) form.addEventListener('submit',async(e)=>{
  e.preventDefault();
  if(msg) msg.className='msg';
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
    const data=await res.json();
    if(!res.ok){showMsg(errT(data),false);}
    else{
      showMsg(t('msg_register_success'),true);
      try{
        localStorage.setItem('dv_registered','1');
        localStorage.setItem('dv_member_name',name);
        localStorage.setItem('dv_member_dial',dialCode);
        localStorage.setItem('dv_member_phone',phone);
        sessionStorage.setItem('dv_show_welcome','1');
      }catch(_){}
      if(window.DobertoGoogle) window.DobertoGoogle.registrationCompleted({name,email,dial_code:dialCode,phone});
      window.setTimeout(()=>window.location.replace('/?welcome=1'),280);
      return;
    }
  }catch(err){showMsg(t('err_no_connection'),false);}
  finally{submitBtn.disabled=false;applyRegisterPageCopy();}
});

let lastStats=null;

function uiText(){
  const l=currentHomeLang();
  if(l==='fr') return {email:'Vous serez averti automatiquement lorsque le VCF sera prêt.',readyTitle:'Votre VCF est prêt',readyDesc:'Le fichier est généré automatiquement. Ouvrez la page Membres pour y accéder.',readyBtn:'Accéder à mon VCF'};
  if(l==='en') return {email:'You will be notified automatically when the VCF is ready.',readyTitle:'Your VCF is ready',readyDesc:'The file is generated automatically. Open the Members page to access it.',readyBtn:'Access my VCF'};
  return {email:'W ap resevwa yon avètisman otomatik lè VCF la pare.',readyTitle:'VCF ou pare',readyDesc:'Sistèm nan jenere fichye a otomatikman. Louvri paj Manm yo pou jwenn aksè.',readyBtn:'Jwenn VCF mwen'};
}

function renderEmailNotificationNote(){
  const emailInput=document.getElementById('email');
  if(!emailInput) return;
  let note=document.getElementById('emailNotifyNote');
  if(!lastStats || !lastStats.emailNotificationsEnabled){if(note) note.remove();return;}
  if(!note){note=document.createElement('div');note.id='emailNotifyNote';note.className='pro-email-notice';emailInput.insertAdjacentElement('afterend',note);}
  note.textContent=uiText().email;
}

function renderUnlockCard(){
  const panel=document.querySelector('[data-tour="form"]');
  if(!panel) return;
  let card=document.getElementById('vcfUnlockCard');
  if(!lastStats || !lastStats.unlocked){if(card) card.remove();return;}
  const ui=uiText();
  if(!card){card=document.createElement('div');card.id='vcfUnlockCard';card.className='pro-unlock-card';panel.insertAdjacentElement('afterend',card);}
  card.innerHTML=`<h2>${ui.readyTitle}</h2><p>${ui.readyDesc}</p><a href="list.html#download" class="pro-unlock-btn">${ui.readyBtn}</a>`;
}

async function loadStats(){
  try{const res=await fetch('/api/stats',{cache:'no-store'});lastStats=await res.json();renderStats();}catch(e){}
}

function renderStats(){
  if(!lastStats) return;
  const bar=document.getElementById('statBar');
  const text=document.getElementById('statText');
  const fill=document.getElementById('statFill');
  if(bar) bar.style.display='flex';
  const pct=Math.min(100,Math.round((lastStats.total/lastStats.minRequired)*100));
  if(fill) fill.style.width=pct+'%';
  if(text) text.textContent=lastStats.unlocked?t('stat_unlocked',{total:lastStats.total}):t('stat_locked',{total:lastStats.total,min:lastStats.minRequired});
  renderCapacityBanner();renderEmailNotificationNote();renderUnlockCard();
}

function renderCapacityBanner(){
  if(!lastStats) return;
  const max=lastStats.maxInFile||50000;
  const current=document.getElementById('capacityCurrent');
  const maxEl=document.getElementById('capacityMax');
  const fill=document.getElementById('capacityFill');
  const pctEl=document.getElementById('capacityPct');
  if(!current||!maxEl||!fill||!pctEl) return;
  const pct=Math.min(100,Math.round((lastStats.total/max)*100));
  current.textContent=lastStats.total.toLocaleString('fr-FR');
  maxEl.textContent=max.toLocaleString('fr-FR');
  fill.style.width=pct+'%';
  pctEl.textContent=pct+'%';
}

function onLangChange(){updateHint();renderStats();applyRegisterPageCopy();}

document.addEventListener('DOMContentLoaded',()=>{
  applyRegisterPageCopy();
  const select=document.getElementById('langSelect');
  if(select) select.addEventListener('change',()=>setTimeout(applyRegisterPageCopy,0));
});

loadStats();
