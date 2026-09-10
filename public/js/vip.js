(() => {
  'use strict';

  const COPY={
    ht:{
      pageTitle:'DOBERTO VCF — VIP',back:'Retounen',heroTitle:'Sync san tann',heroDesc:'Plan Standard lan senkronize otomatikman apre 10 minit. Avèk VIP, Google Contacts ou ka resevwa nouvo kontak yo imedyatman lè sistèm nan detekte yo.',checkingPlan:'N ap verifye plan ou…',
      b1:'Sync imedyat',b1d:'Pa tann sik Standard 10 minit la.',b2:'Google Contacts otomatik',b2d:'Kenbe Auto-Sync aktive epi sistèm nan fè rès la.',b3:'Peman verifye',b3d:'MonCash ka verifye otomatikman. NatCash ak Binance bezwen referans tranzaksyon pou owner valide yo.',
      payment:'Peman VIP',choose:'Chwazi yon metòd',checkoutDesc:'Montan ak dire VIP yo soti dirèkteman nan konfigirasyon owner lan.',loading:'N ap chaje metòd peman yo…',destination:'Destinasyon',transactionRef:'Referans tranzaksyon',transactionPh:'Egzanp: TX123456',note:'Nòt',optional:'opsyonèl',notePh:'Ajoute yon detay si sa nesesè',submit:'Voye pou verifikasyon',privacy:'Konfidansyalite',terms:'Kondisyon',
      active:'VIP aktif',until:'jiska {date}',standard:'Plan aktyèl: Standard · Auto-Sync apre 10 minit',empty:'Metòd peman VIP yo poko configure pa owner lan.',available:'Disponib',notConfigured:'Poko configure',days:'{count} jou VIP',payMoncash:'Peye {amount} ak MonCash',loadError:'Nou pa ka chaje metòd peman yo kounye a.',invalidRef:'Mete yon referans tranzaksyon valid.',paymentSendError:'Peman an pa t voye.',paymentSent:'Demann peman an voye. VIP ap aktive apre owner verifye tranzaksyon an.',moncashUnavailable:'MonCash pa disponib.',verifying:'N ap verifye peman MonCash la…',verifyPending:'Verifikasyon MonCash la poko fini.',confirmed:'Peman konfime. VIP aktif epi Auto-Sync imedyat disponib.'
    },
    fr:{
      pageTitle:'DOBERTO VCF — VIP',back:'Retour',heroTitle:'Synchronisation instantanée',heroDesc:'Le plan Standard synchronise automatiquement après 10 minutes. Avec VIP, Google Contacts peut recevoir les nouveaux contacts immédiatement dès que le système les détecte.',checkingPlan:'Vérification de votre plan…',
      b1:'Synchronisation immédiate',b1d:'N’attendez pas le cycle Standard de 10 minutes.',b2:'Google Contacts automatique',b2d:'Gardez Auto-Sync activé et le système s’occupe du reste.',b3:'Paiement vérifié',b3d:'MonCash peut être vérifié automatiquement. NatCash et Binance nécessitent une référence de transaction pour validation par le propriétaire.',
      payment:'Paiement VIP',choose:'Choisissez un moyen de paiement',checkoutDesc:'Le montant et la durée VIP proviennent directement de la configuration du propriétaire.',loading:'Chargement des moyens de paiement…',destination:'Destination',transactionRef:'Référence de transaction',transactionPh:'Exemple : TX123456',note:'Note',optional:'facultatif',notePh:'Ajoutez un détail si nécessaire',submit:'Envoyer pour vérification',privacy:'Confidentialité',terms:'Conditions',
      active:'VIP actif',until:'jusqu’au {date}',standard:'Plan actuel : Standard · Auto-Sync après 10 minutes',empty:'Aucun moyen de paiement VIP n’est encore configuré.',available:'Disponible',notConfigured:'Non configuré',days:'{count} jours VIP',payMoncash:'Payer {amount} avec MonCash',loadError:'Impossible de charger les moyens de paiement pour le moment.',invalidRef:'Saisissez une référence de transaction valide.',paymentSendError:'Le paiement n’a pas été envoyé.',paymentSent:'Demande de paiement envoyée. Le VIP sera activé après vérification de la transaction.',moncashUnavailable:'MonCash est indisponible.',verifying:'Vérification du paiement MonCash…',verifyPending:'La vérification MonCash n’est pas encore terminée.',confirmed:'Paiement confirmé. Le VIP est actif et la synchronisation immédiate est disponible.'
    },
    en:{
      pageTitle:'DOBERTO VCF — VIP',back:'Back',heroTitle:'Instant sync',heroDesc:'The Standard plan syncs automatically after 10 minutes. With VIP, Google Contacts can receive new contacts immediately when the system detects them.',checkingPlan:'Checking your plan…',
      b1:'Instant sync',b1d:'Skip the 10-minute Standard cycle.',b2:'Automatic Google Contacts',b2d:'Keep Auto-Sync enabled and the system handles the rest.',b3:'Verified payments',b3d:'MonCash can be verified automatically. NatCash and Binance require a transaction reference for owner approval.',
      payment:'VIP payment',choose:'Choose a payment method',checkoutDesc:'VIP pricing and duration come directly from the owner configuration.',loading:'Loading payment methods…',destination:'Destination',transactionRef:'Transaction reference',transactionPh:'Example: TX123456',note:'Note',optional:'optional',notePh:'Add a detail if needed',submit:'Send for verification',privacy:'Privacy',terms:'Terms',
      active:'VIP active',until:'until {date}',standard:'Current plan: Standard · Auto-Sync after 10 minutes',empty:'No VIP payment method is configured yet.',available:'Available',notConfigured:'Not configured',days:'{count} VIP days',payMoncash:'Pay {amount} with MonCash',loadError:'Payment methods cannot be loaded right now.',invalidRef:'Enter a valid transaction reference.',paymentSendError:'The payment request was not sent.',paymentSent:'Payment request sent. VIP will activate after the transaction is verified.',moncashUnavailable:'MonCash is unavailable.',verifying:'Verifying MonCash payment…',verifyPending:'MonCash verification is not complete yet.',confirmed:'Payment confirmed. VIP is active and instant Auto-Sync is available.'
    }
  };

  const token=()=>{try{return localStorage.getItem('dv_auth_token')||'';}catch(_){return '';}};
  const headers=(json=false)=>{const h=json?{'Content-Type':'application/json'}:{};if(token())h.Authorization=`Bearer ${token()}`;return h;};
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const methodsRoot=document.getElementById('vipMethods');
  const statusEl=document.getElementById('vipStatus');
  const manual=document.getElementById('manualPay');
  const moncashBtn=document.getElementById('startMoncashVip');
  const message=document.getElementById('vipMessage');
  const select=document.getElementById('langSelect');
  let methods=[];
  let selected=null;
  let lang='ht';

  try{const saved=localStorage.getItem('doberto_lang');lang=COPY[saved]?saved:'ht';}catch(_){}
  if(select)select.value=lang;

  function tr(key,vars={}){
    let out=(COPY[lang]&&COPY[lang][key])||COPY.ht[key]||key;
    Object.entries(vars).forEach(([k,v])=>{out=out.replace(`{${k}}`,String(v));});
    return out;
  }
  function applyStatic(){
    document.documentElement.lang=lang;
    document.title=tr('pageTitle');
    document.querySelectorAll('[data-vip-key]').forEach(el=>{const key=el.dataset.vipKey;if(COPY[lang][key]!=null)el.textContent=tr(key);});
    document.querySelectorAll('[data-vip-placeholder]').forEach(el=>{const key=el.dataset.vipPlaceholder;if(COPY[lang][key]!=null)el.placeholder=tr(key);});
  }
  function show(text,error=false){if(!message)return;message.textContent=text;message.className=`vip-message show${error?' error':''}`;}
  function money(v,c){const locale=lang==='en'?'en-US':'fr-FR';return `${Number(v||0).toLocaleString(locale,{maximumFractionDigits:2})} ${c||''}`.trim();}
  function mark(m){return ({natcash:'NC',moncash:'MC',binance:'BN'})[m]||String(m||'').slice(0,2).toUpperCase();}

  async function loadStatus(){
    if(!token()){location.replace('/register.html');return;}
    const r=await fetch('/api/vip/status',{headers:headers(),cache:'no-store'});
    if(r.status===401){location.replace('/register.html');return;}
    const d=await r.json().catch(()=>({}));
    if(!r.ok)return;
    if(!statusEl)return;
    statusEl.classList.toggle('is-active',Boolean(d.active));
    if(d.active){
      const locale=lang==='en'?'en-US':'fr-FR';
      const suffix=d.expiresAt?` · ${tr('until',{date:new Date(d.expiresAt).toLocaleDateString(locale)})}`:'';
      statusEl.textContent=`${tr('active')}${suffix}`;
    }else statusEl.textContent=tr('standard');
  }

  function render(){
    if(!methodsRoot)return;
    if(!methods.length){methodsRoot.innerHTML=`<div class="vip-empty">${esc(tr('empty'))}</div>`;if(manual)manual.hidden=true;if(moncashBtn)moncashBtn.hidden=true;return;}
    methodsRoot.innerHTML=methods.map(m=>`<button type="button" class="vip-method ${!m.configured?'disabled':''} ${selected?.method===m.method?'selected':''}" data-method="${esc(m.method)}" ${!m.configured?'disabled':''}><span class="vip-method-mark">${esc(mark(m.method))}</span><span><strong>${esc(m.displayName||m.method)}</strong><small>${esc(m.configured?tr('available'):tr('notConfigured'))}</small></span><span class="vip-method-price"><strong>${m.configured?esc(money(m.amount,m.currency)):'—'}</strong><small>${m.durationDays?esc(tr('days',{count:m.durationDays})):''}</small></span></button>`).join('');
    methodsRoot.querySelectorAll('[data-method]').forEach(btn=>btn.addEventListener('click',()=>{selected=methods.find(x=>x.method===btn.dataset.method);render();renderCheckout();}));
  }

  function renderCheckout(){
    if(!selected||!selected.configured){if(manual)manual.hidden=true;if(moncashBtn)moncashBtn.hidden=true;return;}
    if(selected.method==='moncash'){
      if(manual)manual.hidden=true;
      if(moncashBtn){moncashBtn.hidden=false;moncashBtn.textContent=tr('payMoncash',{amount:money(selected.amount,selected.currency)});}
      return;
    }
    if(moncashBtn)moncashBtn.hidden=true;
    if(manual)manual.hidden=false;
    const recipientLabel=document.getElementById('recipientLabel');
    const recipientValue=document.getElementById('recipientValue');
    if(recipientLabel)recipientLabel.textContent=selected.recipientLabel||tr('destination');
    if(recipientValue)recipientValue.textContent=selected.recipientValue||'—';
  }

  async function loadMethods(){
    if(!methodsRoot)return;
    const r=await fetch('/api/vip/methods',{headers:headers(),cache:'no-store'});
    if(r.status===401){location.replace('/register.html');return;}
    const d=await r.json().catch(()=>({}));
    if(!r.ok){methodsRoot.innerHTML=`<div class="vip-empty">${esc(tr('loadError'))}</div>`;return;}
    const previous=selected?.method;
    methods=d.methods||[];
    selected=methods.find(m=>m.method===previous&&m.configured)||methods.find(m=>m.configured)||null;
    render();renderCheckout();
  }

  document.getElementById('submitManualVip')?.addEventListener('click',async()=>{
    if(!selected)return;
    const ref=document.getElementById('transactionRef')?.value.trim()||'';
    const note=document.getElementById('paymentNote')?.value.trim()||'';
    if(ref.length<4){show(tr('invalidRef'),true);return;}
    const btn=document.getElementById('submitManualVip');btn.disabled=true;
    try{
      const r=await fetch('/api/vip/payment/request',{method:'POST',headers:headers(true),body:JSON.stringify({method:selected.method,transactionRef:ref,note})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||tr('paymentSendError'));
      document.getElementById('transactionRef').value='';document.getElementById('paymentNote').value='';show(tr('paymentSent'));
    }catch(e){show(e.message||tr('paymentSendError'),true);}finally{btn.disabled=false;}
  });

  moncashBtn?.addEventListener('click',async()=>{
    moncashBtn.disabled=true;
    try{
      const r=await fetch('/api/vip/moncash/create',{method:'POST',headers:headers(true),body:'{}'});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||tr('moncashUnavailable'));
      sessionStorage.setItem('dv_vip_moncash_order',d.orderId||'');location.href=d.redirectUrl;
    }catch(e){show(e.message||tr('moncashUnavailable'),true);moncashBtn.disabled=false;}
  });

  async function verifyReturn(){
    const q=new URLSearchParams(location.search);if(q.get('moncash')!=='return')return;
    const transactionId=q.get('transactionId')||'';
    const orderId=q.get('orderId')||sessionStorage.getItem('dv_vip_moncash_order')||'';
    show(tr('verifying'));
    try{
      const r=await fetch('/api/vip/moncash/verify',{method:'POST',headers:headers(true),body:JSON.stringify({transactionId:transactionId||undefined,orderId:orderId||undefined})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||tr('verifyPending'));
      sessionStorage.removeItem('dv_vip_moncash_order');history.replaceState({},'',location.pathname);show(tr('confirmed'));await loadStatus();
    }catch(e){show(e.message||tr('verifyPending'),true);}
  }

  select?.addEventListener('change',async()=>{
    lang=COPY[select.value]?select.value:'ht';
    try{localStorage.setItem('doberto_lang',lang);}catch(_){}
    applyStatic();render();renderCheckout();await loadStatus();
  });

  async function boot(){applyStatic();await loadStatus();await loadMethods();await verifyReturn();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();