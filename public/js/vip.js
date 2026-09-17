(() => {
'use strict';

const COPY={
ht:{pageTitle:'DOBERTO VCF — VIP',back:'Retounen',heroTitle:'Sync san tann',heroDesc:'Plan Standard lan senkronize otomatikman apre 10 minit. Avèk VIP, Google Contacts ou resevwa nouvo kontak yo imedyatman.',checkingPlan:'N ap verifye plan ou…',plansKicker:'PLAN VIP',plansTitle:'Chwazi plan VIP ou',plansDesc:'Chwazi dire ki bon pou ou anvan ou chwazi metòd peman an.',secure:'Peman an sekirite',b1:'Sync imedyat',b1d:'Pa tann sik Standard 10 minit la.',b2:'Google Contacts otomatik',b2d:'Kenbe Auto-Sync aktive epi sistèm nan fè rès la.',b3:'Peman an sekirite',b3d:'MonCash verifye otomatikman. NatCash sèvi ak referans tranzaksyon.',payment:'Peman VIP',choose:'Chwazi metòd peman',checkoutDesc:'Pri plan ou chwazi a ap parèt sou chak metòd ki disponib.',loading:'N ap chaje metòd peman yo…',destination:'Destinasyon',transactionRef:'Referans tranzaksyon',transactionPh:'Egzanp: TX123456',note:'Nòt',optional:'opsyonèl',notePh:'Ajoute yon detay si sa nesesè',submit:'Voye pou verifikasyon',privacy:'Konfidansyalite',terms:'Kondisyon',active:'VIP aktif',until:'jiska {date}',lifetimeActive:'VIP À vie aktif',standard:'Ou sou plan Standard. Auto-Sync kòmanse apre 10 minit.',pending:'Peman {method} pou {plan} ap verifye.',pendingHelp:'Ou pa bezwen voye yon lòt peman pandan verifikasyon an ap fèt.',empty:'Pa gen okenn metòd peman VIP disponib pou kounye a.',available:'Disponib',notConfigured:'Poko disponib',payMoncash:'Peye {amount} ak MonCash',loadError:'Nou pa ka chaje opsyon peman yo kounye a.',invalidRef:'Mete yon referans tranzaksyon valid.',paymentSendError:'Peman an pa t voye.',paymentSent:'Demann peman an voye. N ap verifye tranzaksyon an anvan VIP aktive.',moncashUnavailable:'MonCash pa disponib.',verifying:'N ap verifye peman MonCash la…',verifyPending:'Verifikasyon MonCash la poko fini.',confirmed:'Peman konfime. VIP aktif epi Auto-Sync imedyat disponib.',manualDefault:'Fè peman an nan destinasyon ki parèt la epi antre referans tranzaksyon an egzakteman jan li parèt sou resi a.',selected:'Chwazi ✓',choosePlan:'Chwazi plan sa',planLabel:'Plan chwazi',amountLabel:'Montan',once:'yon sèl fwa',perMonth:'pou 1 mwa',for3:'pou 3 mwa',perYear:'pou 1 an',popular:'POPILÈ',best:'PI BON VALÈ',life:'À VIE',preview:'Gade plan VIP yo. Konekte pou verifye plan ou epi peye.',loginTitle:'Konekte pou aktive VIP',loginText:'Plan ak pri yo vizib. Konekte ak Google anvan ou fè yon peman oswa aktive VIP.',loginButton:'Konekte / Enskri',retry:'Eseye ankò'},
fr:{pageTitle:'DOBERTO VCF — VIP',back:'Retour',heroTitle:'Synchronisation instantanée',heroDesc:'Le plan Standard synchronise automatiquement après 10 minutes. Avec VIP, Google Contacts reçoit les nouveaux contacts immédiatement.',checkingPlan:'Vérification de votre plan…',plansKicker:'FORMULES VIP',plansTitle:'Choisissez votre formule VIP',plansDesc:'Sélectionnez la durée qui vous convient avant de choisir votre moyen de paiement.',secure:'Paiement sécurisé',b1:'Synchronisation immédiate',b1d:'Plus besoin d’attendre le cycle Standard de 10 minutes.',b2:'Google Contacts automatique',b2d:'Gardez Auto-Sync activé et le système s’occupe du reste.',b3:'Paiement sécurisé',b3d:'MonCash est vérifié automatiquement. NatCash utilise la référence de transaction.',payment:'Paiement VIP',choose:'Choisissez un moyen de paiement',checkoutDesc:'Le tarif de la formule sélectionnée s’affiche pour chaque moyen disponible.',loading:'Chargement des moyens de paiement…',destination:'Destination',transactionRef:'Référence de transaction',transactionPh:'Exemple : TX123456',note:'Note',optional:'facultatif',notePh:'Ajoutez un détail si nécessaire',submit:'Envoyer pour vérification',privacy:'Confidentialité',terms:'Conditions',active:'VIP actif',until:'jusqu’au {date}',lifetimeActive:'VIP À vie actif',standard:'Vous êtes sur le plan Standard. Auto-Sync démarre après 10 minutes.',pending:'Votre paiement {method} pour {plan} est en cours de vérification.',pendingHelp:'N’effectuez pas un second paiement pendant la vérification.',empty:'Aucun moyen de paiement VIP n’est disponible pour le moment.',available:'Disponible',notConfigured:'Bientôt disponible',payMoncash:'Payer {amount} avec MonCash',loadError:'Impossible de charger les options de paiement pour le moment.',invalidRef:'Saisissez une référence de transaction valide.',paymentSendError:'Le paiement n’a pas été envoyé.',paymentSent:'Demande de paiement envoyée. La transaction sera vérifiée avant l’activation du VIP.',moncashUnavailable:'MonCash est indisponible.',verifying:'Vérification du paiement MonCash…',verifyPending:'La vérification MonCash n’est pas encore terminée.',confirmed:'Paiement confirmé. Le VIP est actif et la synchronisation immédiate est disponible.',manualDefault:'Effectuez le paiement vers la destination affichée puis saisissez exactement la référence indiquée sur votre reçu.',selected:'Sélectionné ✓',choosePlan:'Choisir cette formule',planLabel:'Formule sélectionnée',amountLabel:'Montant',once:'paiement unique',perMonth:'pour 1 mois',for3:'pour 3 mois',perYear:'pour 1 an',popular:'POPULAIRE',best:'MEILLEURE VALEUR',life:'À VIE',preview:'Consultez les formules VIP. Connectez-vous pour vérifier votre plan et payer.',loginTitle:'Connectez-vous pour activer VIP',loginText:'Les formules et tarifs restent visibles. Connectez-vous avec Google avant d’effectuer un paiement ou d’activer VIP.',loginButton:'Se connecter / S’inscrire',retry:'Réessayer'},
en:{pageTitle:'DOBERTO VCF — VIP',back:'Back',heroTitle:'Instant sync',heroDesc:'The Standard plan syncs automatically after 10 minutes. With VIP, Google Contacts receives new contacts immediately.',checkingPlan:'Checking your plan…',plansKicker:'VIP PLANS',plansTitle:'Choose your VIP plan',plansDesc:'Select the duration that works for you before choosing a payment method.',secure:'Secure payment',b1:'Instant synchronization',b1d:'No need to wait for the 10-minute Standard cycle.',b2:'Automatic Google Contacts',b2d:'Keep Auto-Sync enabled and the system handles the rest.',b3:'Secure payment',b3d:'MonCash is verified automatically. NatCash uses the transaction reference.',payment:'VIP payment',choose:'Choose a payment method',checkoutDesc:'The selected plan price appears for each available payment method.',loading:'Loading payment methods…',destination:'Destination',transactionRef:'Transaction reference',transactionPh:'Example: TX123456',note:'Note',optional:'optional',notePh:'Add a detail if needed',submit:'Send for verification',privacy:'Privacy',terms:'Terms',active:'VIP active',until:'until {date}',lifetimeActive:'Lifetime VIP active',standard:'You are on the Standard plan. Auto-Sync starts after 10 minutes.',pending:'Your {method} payment for {plan} is being verified.',pendingHelp:'Do not send another payment while verification is in progress.',empty:'No VIP payment method is available right now.',available:'Available',notConfigured:'Coming soon',payMoncash:'Pay {amount} with MonCash',loadError:'Payment options cannot be loaded right now.',invalidRef:'Enter a valid transaction reference.',paymentSendError:'The payment request was not sent.',paymentSent:'Payment request sent. The transaction will be verified before VIP is activated.',moncashUnavailable:'MonCash is unavailable.',verifying:'Verifying MonCash payment…',verifyPending:'MonCash verification is not complete yet.',confirmed:'Payment confirmed. VIP is active and instant Auto-Sync is available.',manualDefault:'Send the payment to the destination shown then enter the transaction reference exactly as it appears on your receipt.',selected:'Selected ✓',choosePlan:'Choose this plan',planLabel:'Selected plan',amountLabel:'Amount',once:'one-time payment',perMonth:'for 1 month',for3:'for 3 months',perYear:'for 1 year',popular:'POPULAR',best:'BEST VALUE',life:'LIFETIME',preview:'Browse VIP plans. Sign in to check your plan and pay.',loginTitle:'Sign in to activate VIP',loginText:'Plans and prices remain visible. Sign in with Google before making a payment or activating VIP.',loginButton:'Sign in / Register',retry:'Try again'}};

const token=()=>{try{return localStorage.getItem('dv_auth_token')||''}catch(_){return ''}};
const headers=(j=false)=>{const h=j?{'Content-Type':'application/json'}:{};if(token())h.Authorization=`Bearer ${token()}`;return h};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plansRoot=document.getElementById('vipPlans');
const methodsRoot=document.getElementById('vipMethods');
const statusEl=document.getElementById('vipStatus');
const manual=document.getElementById('manualPay');
const moncashBtn=document.getElementById('startMoncashVip');
const message=document.getElementById('vipMessage');
const select=document.getElementById('langSelect');
const summary=document.getElementById('vipCheckoutSummary');

let plans=[];
let methods=[];
let prices=[];
let selectedPlan=null;
let selectedMethod=null;
let paymentPending=null;
let lastStatus=null;
let lang='ht';
try{const s=localStorage.getItem('doberto_lang');lang=COPY[s]?s:'ht'}catch(_){}
if(select)select.value=lang;

function tr(k,v={}){let out=COPY[lang]?.[k]??COPY.ht[k]??k;Object.entries(v).forEach(([a,b])=>out=out.replace(`{${a}}`,String(b)));return out}
function applyStatic(){document.documentElement.lang=lang;document.title=tr('pageTitle');document.querySelectorAll('[data-vip-key]').forEach(el=>{if(COPY[lang][el.dataset.vipKey]!=null)el.textContent=tr(el.dataset.vipKey)});document.querySelectorAll('[data-vip-placeholder]').forEach(el=>{if(COPY[lang][el.dataset.vipPlaceholder]!=null)el.placeholder=tr(el.dataset.vipPlaceholder)});renderLoginGate()}
function money(v,c='HTG'){const n=Number(v);return Number.isFinite(n)&&n>0?`${n.toLocaleString(lang==='en'?'en-US':'fr-FR',{maximumFractionDigits:2})} ${c}`:'—'}
function show(text,error=false){if(!message)return;if(!text){message.textContent='';message.className='vip-message';return}message.textContent=text;message.className=`vip-message show${error?' error':''}`}
function planName(code){const n={ht:{monthly:'1 mwa',quarterly:'3 mwa',yearly:'1 an',lifetime:'À vie'},fr:{monthly:'1 mois',quarterly:'3 mois',yearly:'1 an',lifetime:'À vie'},en:{monthly:'1 month',quarterly:'3 months',yearly:'1 year',lifetime:'Lifetime'}};return n[lang]?.[code]||plans.find(p=>p.code===code)?.displayName||code||'—'}
function planCycle(p){if(p.isLifetime)return tr('once');return p.code==='monthly'?tr('perMonth'):p.code==='quarterly'?tr('for3'):p.code==='yearly'?tr('perYear'):''}
function badge(p){if(!p.badge)return '';return p.code==='quarterly'?tr('popular'):p.code==='yearly'?tr('best'):p.code==='lifetime'?tr('life'):p.badge}
function priceFor(method,code){return prices.find(p=>p.method===method&&p.planCode===code)||null}
function methodName(method){return methods.find(x=>x.method===method)?.displayName||method||'—'}
function rememberPlan(code){try{localStorage.setItem('dv_vip_plan',code)}catch(_){}const q=new URLSearchParams(location.search);if(!q.get('moncash')){q.set('plan',code);history.replaceState({},'',`${location.pathname}?${q}`)}}
function requestedPlan(){const q=new URLSearchParams(location.search).get('plan');if(plans.some(p=>p.code===q))return q;try{const s=localStorage.getItem('dv_vip_plan');if(plans.some(p=>p.code===s))return s}catch(_){}return 'monthly'}

function ensureLoginGate(){
  let gate=document.getElementById('vipLoginGate');
  if(gate)return gate;
  gate=document.createElement('div');
  gate.id='vipLoginGate';
  gate.className='vip-login-gate';
  gate.hidden=true;
  const anchor=message||manual||moncashBtn;
  if(anchor&&anchor.parentElement)anchor.parentElement.insertBefore(gate,anchor);
  return gate;
}
function renderLoginGate(){
  const gate=ensureLoginGate();
  if(!gate)return;
  gate.hidden=Boolean(token());
  if(gate.hidden)return;
  gate.innerHTML=`<strong>${esc(tr('loginTitle'))}</strong><p>${esc(tr('loginText'))}</p><a href="register.html?next=vip">${esc(tr('loginButton'))} →</a>`;
}
function setPublicStatus(){
  lastStatus=null;
  paymentPending=null;
  if(!statusEl)return;
  statusEl.classList.remove('is-active','is-pending');
  statusEl.classList.add('is-public');
  statusEl.textContent=tr('preview');
}
function renderStatus(){
  if(!token()){setPublicStatus();return}
  if(!lastStatus)return;
  const d=lastStatus;
  if(!statusEl)return;
  statusEl.classList.remove('is-public');
  statusEl.classList.toggle('is-active',!!d.active);
  statusEl.classList.toggle('is-pending',!!(!d.active&&paymentPending));
  if(d.active){
    if(d.isLifetime||d.planCode==='lifetime')statusEl.textContent=tr('lifetimeActive');
    else{
      const date=d.expiresAt?new Date(d.expiresAt).toLocaleDateString(lang==='en'?'en-US':'fr-FR'):'';
      statusEl.textContent=`${tr('active')} · VIP ${planName(d.planCode)}${date?` · ${tr('until',{date})}`:''}`;
    }
  }else if(paymentPending){
    statusEl.textContent=tr('pending',{method:methodName(paymentPending.method),plan:planName(paymentPending.planCode)});
  }else statusEl.textContent=tr('standard');
}

function renderPlans(){
  if(!plansRoot)return;
  if(!plans.length){plansRoot.innerHTML=`<div class="vip-retry"><span>${esc(tr('loadError'))}</span><button type="button" id="vipRetryPlans">${esc(tr('retry'))}</button></div>`;document.getElementById('vipRetryPlans')?.addEventListener('click',()=>loadOptions(true));return}
  plansRoot.innerHTML=plans.map(p=>`<button type="button" class="vip-plan ${selectedPlan?.code===p.code?'selected':''}" data-plan="${esc(p.code)}" aria-pressed="${selectedPlan?.code===p.code?'true':'false'}">${badge(p)?`<span class="vip-plan-badge">${esc(badge(p))}</span>`:''}<span class="vip-plan-name">VIP ${esc(planName(p.code))}</span><span class="vip-plan-price">${esc(money(p.amountHTG,'HTG'))}</span><span class="vip-plan-cycle">${esc(planCycle(p))}</span><span class="vip-plan-desc">${esc(p.description||'')}</span><span class="vip-plan-select">${esc(selectedPlan?.code===p.code?tr('selected'):tr('choosePlan'))}</span></button>`).join('');
  plansRoot.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>{selectedPlan=plans.find(p=>p.code===b.dataset.plan)||selectedPlan;if(selectedPlan)rememberPlan(selectedPlan.code);const a=methods.find(m=>m.configured&&priceFor(m.method,selectedPlan?.code));if(!selectedMethod||!priceFor(selectedMethod.method,selectedPlan?.code))selectedMethod=a||null;renderAll()});
}
function renderMethods(){
  if(!methodsRoot)return;
  if(!methods.length){methodsRoot.innerHTML=`<div class="vip-empty">${esc(tr('empty'))}</div>`;return}
  const blocked=!!paymentPending;
  methodsRoot.innerHTML=methods.map(m=>{const p=selectedPlan?priceFor(m.method,selectedPlan.code):null;const canSelect=m.configured&&p&&!blocked;return `<button type="button" class="vip-method ${(!m.configured||!p)?'disabled':''} ${blocked?'pending-lock':''} ${selectedMethod?.method===m.method?'selected':''}" data-method="${esc(m.method)}" ${canSelect?'':'disabled'}><span class="vip-method-mark">${esc(({natcash:'NC',moncash:'MC',binance:'BN'})[m.method]||'PAY')}</span><span><strong>${esc(m.displayName||m.method)}</strong><small>${esc(m.configured&&p?tr('available'):tr('notConfigured'))}</small></span><span class="vip-method-price"><strong>${p?esc(money(p.amount,p.currency)):'—'}</strong><small>${selectedPlan?esc(planName(selectedPlan.code)):''}</small></span></button>`}).join('');
  methodsRoot.querySelectorAll('[data-method]').forEach(b=>b.onclick=()=>{selectedMethod=methods.find(m=>m.method===b.dataset.method)||selectedMethod;renderAll()});
}
function renderSummary(){if(!summary||!selectedPlan){if(summary)summary.hidden=true;return}const p=selectedMethod?priceFor(selectedMethod.method,selectedPlan.code):null;summary.hidden=false;summary.innerHTML=`<div><span>${esc(tr('planLabel'))}</span><strong>VIP ${esc(planName(selectedPlan.code))}</strong></div><div><span>${esc(tr('amountLabel'))}</span><strong>${esc(money(p?.amount??selectedPlan.amountHTG,p?.currency||'HTG'))}</strong></div>`}
function renderCheckout(){
  const ins=document.getElementById('vipMethodInstructions');
  renderLoginGate();
  if(!token()){if(manual)manual.hidden=true;if(moncashBtn)moncashBtn.hidden=true;if(ins)ins.hidden=true;return}
  const gate=ensureLoginGate();if(gate)gate.hidden=true;
  if(paymentPending||!selectedMethod||!selectedPlan){if(manual)manual.hidden=true;if(moncashBtn)moncashBtn.hidden=true;if(ins)ins.hidden=true;return}
  const p=priceFor(selectedMethod.method,selectedPlan.code);
  if(!selectedMethod.configured||!p){if(manual)manual.hidden=true;if(moncashBtn)moncashBtn.hidden=true;if(ins)ins.hidden=true;return}
  if(selectedMethod.method==='moncash'){
    if(manual)manual.hidden=true;if(ins)ins.hidden=true;
    if(moncashBtn){moncashBtn.hidden=false;moncashBtn.textContent=tr('payMoncash',{amount:money(p.amount,p.currency)})}
    return;
  }
  if(moncashBtn)moncashBtn.hidden=true;
  if(manual)manual.hidden=false;
  const rl=document.getElementById('recipientLabel'),rv=document.getElementById('recipientValue');
  if(rl)rl.textContent=selectedMethod.recipientLabel||tr('destination');
  if(rv)rv.textContent=selectedMethod.recipientValue||'—';
  if(ins){ins.hidden=false;ins.textContent=selectedMethod.instructions||tr('manualDefault')}
}
function renderAll(){renderPlans();renderMethods();renderSummary();renderCheckout();renderStatus()}

async function loadStatus(){
  if(!token()){setPublicStatus();renderCheckout();return}
  try{
    const r=await fetch('/api/vip/status',{headers:headers(),cache:'no-store'});
    if(r.status===401){try{localStorage.removeItem('dv_auth_token')}catch(_){}setPublicStatus();renderCheckout();return}
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||tr('loadError'));
    lastStatus=d;
    paymentPending=d.paymentPending||null;
    if(paymentPending)show(tr('pendingHelp'));
    renderAll();
  }catch(e){console.error('[VIP status]',e);if(statusEl)statusEl.textContent=tr('checkingPlan')}
}

async function fetchCatalog(endpoint){
  const r=await fetch(endpoint,{headers:endpoint.includes('/methods')?headers():{},cache:'no-store'});
  const d=await r.json().catch(()=>({}));
  return {r,d};
}
async function loadOptions(force=false){
  if(plansRoot)plansRoot.innerHTML='<div class="vip-plan-skeleton"></div><div class="vip-plan-skeleton"></div><div class="vip-plan-skeleton"></div><div class="vip-plan-skeleton"></div>';
  if(methodsRoot)methodsRoot.innerHTML=`<div class="vip-loading">${esc(tr('loading'))}</div>`;
  try{
    let result=await fetchCatalog(token()?'/api/vip/methods':'/api/vip/catalog');
    if(result.r.status===401){try{localStorage.removeItem('dv_auth_token')}catch(_){}result=await fetchCatalog('/api/vip/catalog')}
    if(!result.r.ok)throw new Error(result.d.error||tr('loadError'));
    plans=Array.isArray(result.d.plans)?result.d.plans:[];
    methods=Array.isArray(result.d.methods)?result.d.methods:[];
    prices=Array.isArray(result.d.prices)?result.d.prices:[];
    selectedPlan=plans.find(p=>p.code===requestedPlan())||plans.find(p=>p.code==='monthly')||plans[0]||null;
    if(selectedPlan)rememberPlan(selectedPlan.code);
    selectedMethod=methods.find(m=>m.method==='moncash'&&m.configured&&priceFor(m.method,selectedPlan?.code))||methods.find(m=>m.configured&&priceFor(m.method,selectedPlan?.code))||null;
    renderAll();
  }catch(e){
    console.error('[VIP options]',e);
    plans=[];methods=[];prices=[];selectedPlan=null;selectedMethod=null;
    renderPlans();
    if(methodsRoot)methodsRoot.innerHTML=`<div class="vip-retry"><span>${esc(e.message||tr('loadError'))}</span><button type="button" id="vipRetryMethods">${esc(tr('retry'))}</button></div>`;
    document.getElementById('vipRetryMethods')?.addEventListener('click',()=>loadOptions(true));
    renderCheckout();
  }
}

function requireLogin(){if(token())return true;location.href='register.html?next=vip';return false}

document.getElementById('submitManualVip')?.addEventListener('click',async()=>{
  if(!requireLogin()||!selectedMethod||!selectedPlan||paymentPending)return;
  const ref=document.getElementById('transactionRef')?.value.trim()||'';
  const note=document.getElementById('paymentNote')?.value.trim()||'';
  if(ref.length<4){show(tr('invalidRef'),true);return}
  const btn=document.getElementById('submitManualVip');btn.disabled=true;
  try{
    const r=await fetch('/api/vip/payment/request',{method:'POST',headers:headers(true),body:JSON.stringify({method:selectedMethod.method,planCode:selectedPlan.code,transactionRef:ref,note})});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||tr('paymentSendError'));
    document.getElementById('transactionRef').value='';document.getElementById('paymentNote').value='';show(tr('paymentSent'));await loadStatus();
  }catch(e){show(e.message||tr('paymentSendError'),true)}finally{btn.disabled=false}
});

moncashBtn?.addEventListener('click',async()=>{
  if(!requireLogin()||!selectedPlan||paymentPending)return;
  moncashBtn.disabled=true;
  try{
    const r=await fetch('/api/vip/moncash/create',{method:'POST',headers:headers(true),body:JSON.stringify({planCode:selectedPlan.code})});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||tr('moncashUnavailable'));
    try{sessionStorage.setItem('dv_vip_moncash_order',d.orderId||'');sessionStorage.setItem('dv_vip_moncash_plan',selectedPlan.code)}catch(_){}
    location.href=d.redirectUrl;
  }catch(e){show(e.message||tr('moncashUnavailable'),true);moncashBtn.disabled=false}
});

async function verifyReturn(){
  const q=new URLSearchParams(location.search);if(q.get('moncash')!=='return')return;
  if(!token()){renderLoginGate();return}
  const transactionId=q.get('transactionId')||'';
  let stored='';try{stored=sessionStorage.getItem('dv_vip_moncash_order')||localStorage.getItem('dv_vip_moncash_order')||''}catch(_){}
  const orderId=q.get('orderId')||stored;
  show(tr('verifying'));
  try{
    const r=await fetch('/api/vip/moncash/verify',{method:'POST',headers:headers(true),body:JSON.stringify({transactionId:transactionId||undefined,orderId:orderId||undefined})});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||tr('verifyPending'));
    try{sessionStorage.removeItem('dv_vip_moncash_order');sessionStorage.removeItem('dv_vip_moncash_plan');localStorage.removeItem('dv_vip_moncash_order')}catch(_){}
    history.replaceState({},'',location.pathname);paymentPending=null;show(tr('confirmed'));await loadStatus();
  }catch(e){show(e.message||tr('verifyPending'),true)}
}

select?.addEventListener('change',()=>{lang=COPY[select.value]?select.value:'ht';try{localStorage.setItem('doberto_lang',lang)}catch(_){}applyStatic();renderAll()});

async function boot(){
  applyStatic();
  setPublicStatus();
  await loadOptions();
  await loadStatus();
  await verifyReturn();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
