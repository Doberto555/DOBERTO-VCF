(() => {
'use strict';

const COPY={
  ht:{pageTitle:'DOBERTO VCF — VIP',back:'Retounen',heroTitle:'Estati VIP. Plis avantaj.',heroDesc:'Chwazi plan VIP ou pou jwenn estati VIP ak avantaj eksklizif sou DOBERTO VCF.',checkingPlan:'N ap verifye plan ou…',plansKicker:'PLAN VIP',plansTitle:'Chwazi plan VIP ou',plansDesc:'Chwazi dire ki bon pou ou anvan ou chwazi metòd peman an.',secure:'Peman an sekirite',b1:'Estati VIP',b1d:'Kont ou montre kòm VIP pandan plan ou aktif.',b2:'Aksè eksklizif',b2d:'Jwenn avantaj ak fonksyon ki rezève pou manm VIP.',b3:'Peman an sekirite',b3d:'MonCash verifye otomatikman. NatCash sèvi ak referans tranzaksyon.',payment:'Peman VIP',choose:'Chwazi metòd peman',checkoutDesc:'Pri plan ou chwazi a ap parèt sou chak metòd ki disponib.',loading:'N ap chaje metòd peman yo…',destination:'Destinasyon',transactionRef:'Referans tranzaksyon',transactionPh:'Egzanp: TX123456',note:'Nòt',optional:'opsyonèl',notePh:'Ajoute yon detay si sa nesesè',submit:'Voye pou verifikasyon',privacy:'Konfidansyalite',terms:'Kondisyon',active:'VIP aktif',until:'jiska {date}',lifetimeActive:'VIP À vie aktif',standard:'Ou sou plan Standard.',pending:'Peman {method} pou {plan} ap verifye.',pendingHelp:'Ou pa bezwen voye yon lòt peman pandan verifikasyon an ap fèt.',empty:'Pa gen okenn metòd peman VIP disponib pou kounye a.',available:'Disponib',notConfigured:'Poko disponib',payMoncash:'Peye {amount} ak MonCash',loadError:'Nou pa ka chaje opsyon peman yo kounye a.',invalidRef:'Mete yon referans tranzaksyon valid.',paymentSendError:'Peman an pa t voye.',paymentSent:'Demann peman an voye. N ap verifye tranzaksyon an anvan VIP aktive.',moncashUnavailable:'MonCash pa disponib.',verifying:'N ap verifye peman MonCash la…',verifyPending:'Verifikasyon MonCash la poko fini.',confirmed:'Peman konfime. VIP ou aktif kounye a.',manualDefault:'Fè peman an nan destinasyon ki parèt la epi antre referans tranzaksyon an egzakteman jan li parèt sou resi a.',selected:'Chwazi ✓',choosePlan:'Chwazi plan sa',planLabel:'Plan chwazi',amountLabel:'Montan',once:'yon sèl fwa',perMonth:'pou 1 mwa',for3:'pou 3 mwa',perYear:'pou 1 an',popular:'POPILÈ',best:'PI BON VALÈ',life:'À VIE',preview:'Gade plan VIP yo. Konekte pou verifye plan ou epi peye.',loginTitle:'Konekte pou kontinye ak VIP',loginText:'Plan ak pri yo vizib. Konekte sou kont ou oswa fini enskripsyon an anvan ou fè yon peman VIP.',loginButton:'Konekte / Enskri',retry:'Eseye ankò'},
  fr:{pageTitle:'DOBERTO VCF — VIP',back:'Retour',heroTitle:'Statut VIP. Plus d’avantages.',heroDesc:'Choisissez votre formule VIP pour obtenir le statut VIP et des avantages exclusifs sur DOBERTO VCF.',checkingPlan:'Vérification de votre formule…',plansKicker:'FORMULES VIP',plansTitle:'Choisissez votre formule VIP',plansDesc:'Sélectionnez la durée qui vous convient avant de choisir votre moyen de paiement.',secure:'Paiement sécurisé',b1:'Statut VIP',b1d:'Votre compte affiche le statut VIP pendant toute la durée active.',b2:'Accès exclusif',b2d:'Profitez d’avantages et de fonctions réservés aux membres VIP.',b3:'Paiement sécurisé',b3d:'MonCash est vérifié automatiquement. NatCash utilise la référence de transaction.',payment:'Paiement VIP',choose:'Choisissez un moyen de paiement',checkoutDesc:'Le tarif de la formule sélectionnée s’affiche pour chaque moyen disponible.',loading:'Chargement des moyens de paiement…',destination:'Destination',transactionRef:'Référence de transaction',transactionPh:'Exemple : TX123456',note:'Note',optional:'facultatif',notePh:'Ajoutez un détail si nécessaire',submit:'Envoyer pour vérification',privacy:'Confidentialité',terms:'Conditions',active:'VIP actif',until:'jusqu’au {date}',lifetimeActive:'VIP À vie actif',standard:'Vous êtes sur le plan Standard.',pending:'Votre paiement {method} pour {plan} est en cours de vérification.',pendingHelp:'N’effectuez pas un second paiement pendant la vérification.',empty:'Aucun moyen de paiement VIP n’est disponible pour le moment.',available:'Disponible',notConfigured:'Bientôt disponible',payMoncash:'Payer {amount} avec MonCash',loadError:'Impossible de charger les options de paiement pour le moment.',invalidRef:'Saisissez une référence de transaction valide.',paymentSendError:'Le paiement n’a pas été envoyé.',paymentSent:'Demande de paiement envoyée. La transaction sera vérifiée avant l’activation du VIP.',moncashUnavailable:'MonCash est indisponible.',verifying:'Vérification du paiement MonCash…',verifyPending:'La vérification MonCash n’est pas encore terminée.',confirmed:'Paiement confirmé. Votre VIP est maintenant actif.',manualDefault:'Effectuez le paiement vers la destination affichée puis saisissez exactement la référence indiquée sur votre reçu.',selected:'Sélectionné ✓',choosePlan:'Choisir cette formule',planLabel:'Formule sélectionnée',amountLabel:'Montant',once:'paiement unique',perMonth:'pour 1 mois',for3:'pour 3 mois',perYear:'pour 1 an',popular:'POPULAIRE',best:'MEILLEURE VALEUR',life:'À VIE',preview:'Consultez les formules VIP. Connectez-vous pour vérifier votre formule et payer.',loginTitle:'Connectez-vous pour continuer avec VIP',loginText:'Les formules et tarifs restent visibles. Connectez-vous à votre compte ou terminez votre inscription avant un paiement VIP.',loginButton:'Se connecter / S’inscrire',retry:'Réessayer'},
  en:{pageTitle:'DOBERTO VCF — VIP',back:'Back',heroTitle:'VIP status. More benefits.',heroDesc:'Choose your VIP plan to get VIP status and exclusive DOBERTO VCF benefits.',checkingPlan:'Checking your plan…',plansKicker:'VIP PLANS',plansTitle:'Choose your VIP plan',plansDesc:'Select the duration that works for you before choosing a payment method.',secure:'Secure payment',b1:'VIP status',b1d:'Your account shows VIP status while your plan is active.',b2:'Exclusive access',b2d:'Get benefits and features reserved for VIP members.',b3:'Secure payment',b3d:'MonCash is verified automatically. NatCash uses the transaction reference.',payment:'VIP payment',choose:'Choose a payment method',checkoutDesc:'The selected plan price appears for each available payment method.',loading:'Loading payment methods…',destination:'Destination',transactionRef:'Transaction reference',transactionPh:'Example: TX123456',note:'Note',optional:'optional',notePh:'Add a detail if needed',submit:'Send for verification',privacy:'Privacy',terms:'Terms',active:'VIP active',until:'until {date}',lifetimeActive:'Lifetime VIP active',standard:'You are on the Standard plan.',pending:'Your {method} payment for {plan} is being verified.',pendingHelp:'Do not send another payment while verification is in progress.',empty:'No VIP payment method is available right now.',available:'Available',notConfigured:'Coming soon',payMoncash:'Pay {amount} with MonCash',loadError:'Payment options cannot be loaded right now.',invalidRef:'Enter a valid transaction reference.',paymentSendError:'The payment request was not sent.',paymentSent:'Payment request sent. The transaction will be verified before VIP is activated.',moncashUnavailable:'MonCash is unavailable.',verifying:'Verifying MonCash payment…',verifyPending:'MonCash verification is not complete yet.',confirmed:'Payment confirmed. Your VIP is now active.',manualDefault:'Send the payment to the destination shown then enter the transaction reference exactly as it appears on your receipt.',selected:'Selected ✓',choosePlan:'Choose this plan',planLabel:'Selected plan',amountLabel:'Amount',once:'one-time payment',perMonth:'for 1 month',for3:'for 3 months',perYear:'for 1 year',popular:'POPULAR',best:'BEST VALUE',life:'LIFETIME',preview:'Browse VIP plans. Sign in to check your plan and pay.',loginTitle:'Sign in to continue with VIP',loginText:'Plans and prices remain visible. Sign in to your account or complete registration before making a VIP payment.',loginButton:'Sign in / Register',retry:'Try again'}
};

const FALLBACK_PLANS=[
  {code:'monthly',displayName:'1 mois',amountHTG:750,durationMonths:1,isLifetime:false,badge:''},
  {code:'quarterly',displayName:'3 mois',amountHTG:1800,durationMonths:3,isLifetime:false,badge:'POPULAR'},
  {code:'yearly',displayName:'1 an',amountHTG:5000,durationMonths:12,isLifetime:false,badge:'BEST'},
  {code:'lifetime',displayName:'À vie',amountHTG:12000,durationMonths:null,isLifetime:true,badge:'LIFETIME'}
];
const PLAN_DESC={
  ht:{monthly:'Aksè VIP pandan 1 mwa.',quarterly:'Aksè VIP pandan 3 mwa ak yon pi bon pri.',yearly:'Aksè VIP pandan 12 mwa.',lifetime:'Aksè VIP pèmanan, san dat ekspirasyon.'},
  fr:{monthly:'Accès VIP pendant 1 mois.',quarterly:'Accès VIP pendant 3 mois avec un meilleur tarif.',yearly:'Accès VIP pendant 12 mois.',lifetime:'Accès VIP permanent, sans date d’expiration.'},
  en:{monthly:'VIP access for 1 month.',quarterly:'VIP access for 3 months at a better rate.',yearly:'VIP access for 12 months.',lifetime:'Permanent VIP access with no expiration date.'}
};

function byId(id){return document.getElementById(id);}
function getToken(){try{return localStorage.getItem('dv_auth_token')||'';}catch(e){return '';}}
function headers(json){var h=json?{'Content-Type':'application/json'}:{};var t=getToken();if(t)h.Authorization='Bearer '+t;return h;}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function each(nodes,fn){Array.prototype.forEach.call(nodes,fn);}

var plansRoot=byId('vipPlans');
var methodsRoot=byId('vipMethods');
var statusEl=byId('vipStatus');
var manual=byId('manualPay');
var moncashBtn=byId('startMoncashVip');
var message=byId('vipMessage');
var select=byId('langSelect');
var summary=byId('vipCheckoutSummary');
var plans=FALLBACK_PLANS.slice();
var methods=[];
var prices=[];
var selectedPlan=null;
var selectedMethod=null;
var paymentPending=null;
var lastStatus=null;
var lang='ht';
try{var savedLang=localStorage.getItem('doberto_lang');if(COPY[savedLang])lang=savedLang;}catch(e){}
if(select)select.value=lang;

function tr(key,vars){
  var base=(COPY[lang]&&COPY[lang][key])||COPY.ht[key]||key;
  vars=vars||{};
  Object.keys(vars).forEach(function(k){base=base.replace('{'+k+'}',String(vars[k]));});
  return base;
}
function money(value,currency){
  var n=Number(value);currency=currency||'HTG';
  if(!isFinite(n)||n<=0)return '—';
  try{return n.toLocaleString(lang==='en'?'en-US':'fr-FR',{maximumFractionDigits:2})+' '+currency;}catch(e){return n+' '+currency;}
}
function planName(code){
  var names={ht:{monthly:'1 mwa',quarterly:'3 mwa',yearly:'1 an',lifetime:'À vie'},fr:{monthly:'1 mois',quarterly:'3 mois',yearly:'1 an',lifetime:'À vie'},en:{monthly:'1 month',quarterly:'3 months',yearly:'1 year',lifetime:'Lifetime'}};
  return (names[lang]&&names[lang][code])||code||'—';
}
function planDescription(code){return (PLAN_DESC[lang]&&PLAN_DESC[lang][code])||'';}
function planCycle(plan){if(plan.isLifetime)return tr('once');if(plan.code==='monthly')return tr('perMonth');if(plan.code==='quarterly')return tr('for3');if(plan.code==='yearly')return tr('perYear');return '';}
function badge(plan){if(plan.code==='quarterly')return tr('popular');if(plan.code==='yearly')return tr('best');if(plan.code==='lifetime')return tr('life');return '';}
function priceFor(method,code){for(var i=0;i<prices.length;i++){if(prices[i].method===method&&prices[i].planCode===code)return prices[i];}return null;}
function methodName(method){for(var i=0;i<methods.length;i++){if(methods[i].method===method)return methods[i].displayName||method;}return method||'—';}
function requestedPlan(){
  var q='';try{q=new URLSearchParams(location.search).get('plan')||'';}catch(e){}
  if(q&&plans.some(function(p){return p.code===q;}))return q;
  try{var stored=localStorage.getItem('dv_vip_plan');if(stored&&plans.some(function(p){return p.code===stored;}))return stored;}catch(e){}
  return 'monthly';
}
function rememberPlan(code){
  try{localStorage.setItem('dv_vip_plan',code);}catch(e){}
  try{var q=new URLSearchParams(location.search);if(!q.get('moncash')){q.set('plan',code);history.replaceState({},'',location.pathname+'?'+q.toString());}}catch(e){}
}
function show(text,error){if(!message)return;if(!text){message.textContent='';message.className='vip-message';return;}message.textContent=text;message.className='vip-message show'+(error?' error':'');}

function applyStatic(){
  document.documentElement.lang=lang;document.title=tr('pageTitle');
  each(document.querySelectorAll('[data-vip-key]'),function(el){var k=el.getAttribute('data-vip-key');if(COPY[lang][k]!=null)el.textContent=tr(k);});
  each(document.querySelectorAll('[data-vip-placeholder]'),function(el){var k=el.getAttribute('data-vip-placeholder');if(COPY[lang][k]!=null)el.placeholder=tr(k);});
  var back=document.querySelector('.vip-back');if(back)back.textContent=tr('back');
  renderLoginGate();
}
function ensureLoginGate(){
  var gate=byId('vipLoginGate');if(gate)return gate;
  gate=document.createElement('div');gate.id='vipLoginGate';gate.className='vip-login-gate';gate.hidden=true;
  var anchor=message||manual||moncashBtn;if(anchor&&anchor.parentElement)anchor.parentElement.insertBefore(gate,anchor);
  return gate;
}
function renderLoginGate(){
  var gate=ensureLoginGate();if(!gate)return;gate.hidden=!!getToken();if(gate.hidden)return;
  gate.innerHTML='<strong>'+esc(tr('loginTitle'))+'</strong><p>'+esc(tr('loginText'))+'</p><a href="register.html?next=vip">'+esc(tr('loginButton'))+' →</a>';
}
function setPublicStatus(){
  lastStatus=null;paymentPending=null;if(!statusEl)return;
  statusEl.classList.remove('is-active');statusEl.classList.remove('is-pending');statusEl.classList.add('is-public');statusEl.textContent=tr('preview');
}
function renderStatus(){
  if(!getToken()){setPublicStatus();return;}if(!lastStatus||!statusEl)return;
  statusEl.classList.remove('is-public');
  if(lastStatus.active)statusEl.classList.add('is-active');else statusEl.classList.remove('is-active');
  if(!lastStatus.active&&paymentPending)statusEl.classList.add('is-pending');else statusEl.classList.remove('is-pending');
  if(lastStatus.active){
    if(lastStatus.isLifetime||lastStatus.planCode==='lifetime'){statusEl.textContent=tr('lifetimeActive');return;}
    var date='';if(lastStatus.expiresAt){try{date=new Date(lastStatus.expiresAt).toLocaleDateString(lang==='en'?'en-US':'fr-FR');}catch(e){}}
    statusEl.textContent=tr('active')+' · VIP '+planName(lastStatus.planCode)+(date?' · '+tr('until',{date:date}):'');
  }else if(paymentPending){statusEl.textContent=tr('pending',{method:methodName(paymentPending.method),plan:planName(paymentPending.planCode)});}else statusEl.textContent=tr('standard');
}
function renderPlans(){
  if(!plansRoot)return;
  if(!plans.length){plans=FALLBACK_PLANS.slice();}
  plansRoot.innerHTML=plans.map(function(p){
    var selected=selectedPlan&&selectedPlan.code===p.code;
    return '<button type="button" class="vip-plan '+(selected?'selected':'')+'" data-plan="'+esc(p.code)+'" aria-pressed="'+(selected?'true':'false')+'">'+
      (badge(p)?'<span class="vip-plan-badge">'+esc(badge(p))+'</span>':'')+
      '<span class="vip-plan-name">VIP '+esc(planName(p.code))+'</span><span class="vip-plan-price">'+esc(money(p.amountHTG,'HTG'))+'</span><span class="vip-plan-cycle">'+esc(planCycle(p))+'</span><span class="vip-plan-desc">'+esc(planDescription(p.code))+'</span><span class="vip-plan-select">'+esc(selected?tr('selected'):tr('choosePlan'))+'</span></button>';
  }).join('');
  each(plansRoot.querySelectorAll('[data-plan]'),function(btn){btn.onclick=function(){for(var i=0;i<plans.length;i++){if(plans[i].code===btn.getAttribute('data-plan'))selectedPlan=plans[i];}if(selectedPlan)rememberPlan(selectedPlan.code);var available=null;for(var j=0;j<methods.length;j++){if(methods[j].configured&&priceFor(methods[j].method,selectedPlan.code)){available=methods[j];break;}}if(!selectedMethod||!priceFor(selectedMethod.method,selectedPlan.code))selectedMethod=available;renderAll();};});
}
function renderMethods(){
  if(!methodsRoot)return;
  if(!methods.length){methodsRoot.innerHTML='<div class="vip-loading">'+esc(tr('loading'))+'</div>';return;}
  var blocked=!!paymentPending;
  methodsRoot.innerHTML=methods.map(function(m){var p=selectedPlan?priceFor(m.method,selectedPlan.code):null;var canSelect=!!(m.configured&&p&&!blocked);return '<button type="button" class="vip-method '+((!m.configured||!p)?'disabled ':'')+(blocked?'pending-lock ':'')+(selectedMethod&&selectedMethod.method===m.method?'selected':'')+'" data-method="'+esc(m.method)+'" '+(canSelect?'':'disabled')+'><span class="vip-method-mark">'+esc(({natcash:'NC',moncash:'MC',binance:'BN'})[m.method]||'PAY')+'</span><span><strong>'+esc(m.displayName||m.method)+'</strong><small>'+esc(m.configured&&p?tr('available'):tr('notConfigured'))+'</small></span><span class="vip-method-price"><strong>'+esc(p?money(p.amount,p.currency):'—')+'</strong><small>'+esc(selectedPlan?planName(selectedPlan.code):'')+'</small></span></button>';}).join('');
  each(methodsRoot.querySelectorAll('[data-method]'),function(btn){btn.onclick=function(){for(var i=0;i<methods.length;i++){if(methods[i].method===btn.getAttribute('data-method'))selectedMethod=methods[i];}renderAll();};});
}
function renderSummary(){
  if(!summary||!selectedPlan){if(summary)summary.hidden=true;return;}var p=selectedMethod?priceFor(selectedMethod.method,selectedPlan.code):null;summary.hidden=false;
  summary.innerHTML='<div><span>'+esc(tr('planLabel'))+'</span><strong>VIP '+esc(planName(selectedPlan.code))+'</strong></div><div><span>'+esc(tr('amountLabel'))+'</span><strong>'+esc(money(p?p.amount:selectedPlan.amountHTG,p?p.currency:'HTG'))+'</strong></div>';
}
function renderCheckout(){
  var ins=byId('vipMethodInstructions');renderLoginGate();
  if(!getToken()){if(manual)manual.hidden=true;if(moncashBtn)moncashBtn.hidden=true;if(ins)ins.hidden=true;return;}
  var gate=ensureLoginGate();if(gate)gate.hidden=true;
  if(paymentPending||!selectedMethod||!selectedPlan){if(manual)manual.hidden=true;if(moncashBtn)moncashBtn.hidden=true;if(ins)ins.hidden=true;return;}
  var p=priceFor(selectedMethod.method,selectedPlan.code);if(!selectedMethod.configured||!p){if(manual)manual.hidden=true;if(moncashBtn)moncashBtn.hidden=true;if(ins)ins.hidden=true;return;}
  if(selectedMethod.method==='moncash'){if(manual)manual.hidden=true;if(ins)ins.hidden=true;if(moncashBtn){moncashBtn.hidden=false;moncashBtn.textContent=tr('payMoncash',{amount:money(p.amount,p.currency)});}return;}
  if(moncashBtn)moncashBtn.hidden=true;if(manual)manual.hidden=false;
  var rl=byId('recipientLabel'),rv=byId('recipientValue');if(rl)rl.textContent=selectedMethod.recipientLabel||tr('destination');if(rv)rv.textContent=selectedMethod.recipientValue||'—';if(ins){ins.hidden=false;ins.textContent=selectedMethod.instructions||tr('manualDefault');}
}
function renderAll(){renderPlans();renderMethods();renderSummary();renderCheckout();renderStatus();}

function fetchWithTimeout(url,options,timeout){
  return Promise.race([fetch(url,options||{}),new Promise(function(_,reject){setTimeout(function(){reject(new Error('timeout'));},timeout||12000);})]);
}
function fetchCatalog(endpoint){return fetchWithTimeout(endpoint,{headers:endpoint.indexOf('/methods')>=0?headers(false):{},cache:'no-store'},12000).then(function(r){return r.json().catch(function(){return {};}).then(function(d){return {r:r,d:d};});});}
function useCatalog(data){
  if(data&&Array.isArray(data.plans)&&data.plans.length)plans=data.plans;else plans=FALLBACK_PLANS.slice();
  methods=data&&Array.isArray(data.methods)?data.methods:[];prices=data&&Array.isArray(data.prices)?data.prices:[];
  var wanted=requestedPlan();selectedPlan=plans.find(function(p){return p.code===wanted;})||plans[0];if(selectedPlan)rememberPlan(selectedPlan.code);
  selectedMethod=null;for(var i=0;i<methods.length;i++){if(methods[i].method==='moncash'&&methods[i].configured&&selectedPlan&&priceFor(methods[i].method,selectedPlan.code)){selectedMethod=methods[i];break;}}
  if(!selectedMethod){for(var j=0;j<methods.length;j++){if(methods[j].configured&&selectedPlan&&priceFor(methods[j].method,selectedPlan.code)){selectedMethod=methods[j];break;}}}
  renderAll();
}
async function loadOptions(){
  try{
    var endpoint=getToken()?'/api/vip/methods':'/api/vip/catalog';var result=await fetchCatalog(endpoint);
    if(result.r.status===401){try{localStorage.removeItem('dv_auth_token');}catch(e){}result=await fetchCatalog('/api/vip/catalog');}
    if(!result.r.ok)throw new Error(result.d.error||tr('loadError'));
    useCatalog(result.d);
  }catch(e){
    console.error('[VIP options]',e);if(!plans.length)plans=FALLBACK_PLANS.slice();if(!selectedPlan)selectedPlan=plans[0];renderPlans();
    if(methodsRoot)methodsRoot.innerHTML='<div class="vip-retry"><span>'+esc(tr('loadError'))+'</span><button type="button" id="vipRetryMethods">'+esc(tr('retry'))+'</button></div>';
    var retry=byId('vipRetryMethods');if(retry)retry.onclick=loadOptions;renderCheckout();
  }
}
async function loadStatus(){
  if(!getToken()){setPublicStatus();renderCheckout();return;}
  try{var r=await fetchWithTimeout('/api/vip/status',{headers:headers(false),cache:'no-store'},12000);if(r.status===401){try{localStorage.removeItem('dv_auth_token');}catch(e){}setPublicStatus();renderCheckout();return;}var d=await r.json().catch(function(){return {};});if(!r.ok)throw new Error(d.error||tr('loadError'));lastStatus=d;paymentPending=d.paymentPending||null;if(paymentPending)show(tr('pendingHelp'));renderAll();}catch(e){console.error('[VIP status]',e);if(statusEl&&!lastStatus)statusEl.textContent=tr('standard');}
}
function requireLogin(){if(getToken())return true;location.href='register.html?next=vip';return false;}

var manualBtn=byId('submitManualVip');
if(manualBtn)manualBtn.addEventListener('click',async function(){
  if(!requireLogin()||!selectedMethod||!selectedPlan||paymentPending)return;var ref=(byId('transactionRef')?byId('transactionRef').value:'').trim();var note=(byId('paymentNote')?byId('paymentNote').value:'').trim();if(ref.length<4){show(tr('invalidRef'),true);return;}manualBtn.disabled=true;
  try{var r=await fetch('/api/vip/payment/request',{method:'POST',headers:headers(true),body:JSON.stringify({method:selectedMethod.method,planCode:selectedPlan.code,transactionRef:ref,note:note})});var d=await r.json().catch(function(){return {};});if(!r.ok)throw new Error(d.error||tr('paymentSendError'));byId('transactionRef').value='';byId('paymentNote').value='';show(tr('paymentSent'));await loadStatus();}catch(e){show(e.message||tr('paymentSendError'),true);}finally{manualBtn.disabled=false;}
});
if(moncashBtn)moncashBtn.addEventListener('click',async function(){
  if(!requireLogin()||!selectedPlan||paymentPending)return;moncashBtn.disabled=true;
  try{var r=await fetch('/api/vip/moncash/create',{method:'POST',headers:headers(true),body:JSON.stringify({planCode:selectedPlan.code})});var d=await r.json().catch(function(){return {};});if(!r.ok)throw new Error(d.error||tr('moncashUnavailable'));try{sessionStorage.setItem('dv_vip_moncash_order',d.orderId||'');sessionStorage.setItem('dv_vip_moncash_plan',selectedPlan.code);}catch(e){}location.href=d.redirectUrl;}catch(e){show(e.message||tr('moncashUnavailable'),true);moncashBtn.disabled=false;}
});
async function verifyReturn(){
  var q;try{q=new URLSearchParams(location.search);}catch(e){return;}if(q.get('moncash')!=='return')return;if(!getToken()){renderLoginGate();return;}var transactionId=q.get('transactionId')||'';var stored='';try{stored=sessionStorage.getItem('dv_vip_moncash_order')||localStorage.getItem('dv_vip_moncash_order')||'';}catch(e){}var orderId=q.get('orderId')||stored;show(tr('verifying'));
  try{var r=await fetch('/api/vip/moncash/verify',{method:'POST',headers:headers(true),body:JSON.stringify({transactionId:transactionId||undefined,orderId:orderId||undefined})});var d=await r.json().catch(function(){return {};});if(!r.ok)throw new Error(d.error||tr('verifyPending'));try{sessionStorage.removeItem('dv_vip_moncash_order');sessionStorage.removeItem('dv_vip_moncash_plan');localStorage.removeItem('dv_vip_moncash_order');}catch(e){}history.replaceState({},'',location.pathname);paymentPending=null;show(tr('confirmed'));await loadStatus();}catch(e){show(e.message||tr('verifyPending'),true);}
}
if(select)select.addEventListener('change',function(){lang=COPY[select.value]?select.value:'ht';try{localStorage.setItem('doberto_lang',lang);}catch(e){}applyStatic();renderAll();});

async function boot(){
  selectedPlan=plans[0];applyStatic();setPublicStatus();renderPlans();renderLoginGate();await loadOptions();await loadStatus();await verifyReturn();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
