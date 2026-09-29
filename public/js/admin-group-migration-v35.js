(()=>{
'use strict';

const COPY={
  ht:{
    status:'Estati migration',
    start:'Kòmanse migration ansyen manm yo',
    stop:'Fèmen migration',
    refresh:'Rafrechi',
    push:'Voye push envitasyon',
    ready:'Sove nouvo link gwoup la anlè, apre sa kòmanse migration lan.',
    active:'Migration lan aktif. Ansyen manm yo ap wè nouvo gwoup la lè yo retounen sou sit la.',
    inactive:'Pa gen migration aktif.',
    started:'Migration lan kòmanse pou {n} ansyen manm.',
    stopped:'Migration lan fèmen.',
    pushOk:'Push envitasyon an voye bay {n} destinatè OneSignal.',
    startConfirm:'Sa ap pran tout moun ki deja enskri kounye a epi mete yo nan kanpay migration nouvo gwoup la. Kontinye?',
    stopConfirm:'Fèmen migration lan? Moun ki poko konfime yo pap wè rapèl migration lan ankò.',
    err:'Operasyon migration lan pa reyisi.'
  },
  fr:{
    status:'État de migration',
    start:'Démarrer la migration des anciens membres',
    stop:'Arrêter la migration',
    refresh:'Actualiser',
    push:'Envoyer une notification',
    ready:'Enregistrez d’abord le nouveau lien du groupe ci-dessus, puis démarrez la migration.',
    active:'La migration est active. Les anciens membres verront le nouveau groupe lorsqu’ils reviendront sur le site.',
    inactive:'Aucune migration active.',
    started:'Migration démarrée pour {n} anciens membres.',
    stopped:'Migration arrêtée.',
    pushOk:'La notification a été ciblée vers {n} destinataire(s) OneSignal.',
    startConfirm:'Tous les membres déjà inscrits seront ajoutés à la campagne de migration vers le nouveau groupe. Continuer ?',
    stopConfirm:'Arrêter la migration ? Les membres non confirmés ne verront plus le rappel.',
    err:'La migration n’a pas pu être mise à jour.'
  },
  en:{
    status:'Migration status',
    start:'Start old-member migration',
    stop:'Stop migration',
    refresh:'Refresh',
    push:'Send invite notification',
    ready:'Save the new group link above first, then start the migration.',
    active:'Migration is active. Existing members will see the new group when they return to the site.',
    inactive:'No active migration.',
    started:'Migration started for {n} existing members.',
    stopped:'Migration stopped.',
    pushOk:'Invite notification targeted {n} OneSignal recipient(s).',
    startConfirm:'All members already registered now will be added to the new-group migration campaign. Continue?',
    stopConfirm:'Stop the migration? Members who have not confirmed will no longer see the migration reminder.',
    err:'Could not update the migration.'
  }
};

function lang(){const el=document.getElementById('langSelect');return el&&COPY[el.value]?el.value:'ht'}
function c(){return COPY[lang()]||COPY.ht}
function token(){try{return sessionStorage.getItem('doberto_admin_token')||''}catch(_){return ''}}
function fmt(value){if(!value)return '—';try{return new Date(value).toLocaleString(lang()==='en'?'en-US':'fr-FR')}catch(_){return String(value)}}
function message(text,ok=true){const el=document.getElementById('migrationAdminMsg');if(!el)return;el.textContent=text;el.className='msg show '+(ok?'ok':'err')}

async function api(body){
  const r=await fetch('/api/admin/group-migration',{
    method:body?'POST':'GET',
    headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json'},
    body:body?JSON.stringify(body):undefined,
    cache:'no-store'
  });
  const d=await r.json().catch(()=>({}));
  if(r.status===401){document.getElementById('logoutBtn')?.click();throw new Error('Session expirée')}
  if(!r.ok)throw new Error(d.error||c().err);
  return d;
}

function render(d){
  const s=d?.stats||{};
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=String(v??0)};
  set('migrationTotal',s.total||0);
  set('migrationPending',s.pending||0);
  set('migrationOpened',s.opened||0);
  set('migrationJoined',s.joined||0);
  set('migrationPushRecipients',d?.lastPushRecipients||0);

  const badge=document.getElementById('migrationStateBadge');
  if(badge){
    badge.textContent=d.active?'ACTIVE':'OFF';
    badge.classList.toggle('is-active',!!d.active);
  }
  const desc=document.getElementById('migrationStateText');
  if(desc)desc.textContent=d.active?c().active:c().inactive;

  const started=document.getElementById('migrationStartedAt');
  if(started)started.textContent=d.startedAt?fmt(d.startedAt):'—';
  const lastPush=document.getElementById('migrationLastPushAt');
  if(lastPush)lastPush.textContent=d.lastPushAt?fmt(d.lastPushAt):'—';

  const link=document.getElementById('migrationGroupUrl');
  if(link){link.textContent=d.groupUrl||d.currentGroupUrl||'—';link.title=d.groupUrl||d.currentGroupUrl||''}

  const start=document.getElementById('startMigrationBtn');
  const stop=document.getElementById('stopMigrationBtn');
  const push=document.getElementById('pushMigrationBtn');
  if(start)start.disabled=!!d.active;
  if(stop)stop.disabled=!d.active;
  if(push){push.disabled=!d.active||!d.pushConfigured;push.title=d.pushConfigured?'':'OneSignal pa configure'}
}

async function load(){
  if(!token())return;
  try{render(await api())}
  catch(e){message(e.message||c().err,false)}
}

async function start(){
  if(!confirm(c().startConfirm))return;
  const b=document.getElementById('startMigrationBtn');b.disabled=true;
  try{
    const d=await api({action:'start'});
    render(d);
    message(c().started.replace('{n}',Number(d?.stats?.total||0).toLocaleString()));
  }catch(e){message(e.message||c().err,false)}
  finally{b.disabled=false}
}

async function stop(){
  if(!confirm(c().stopConfirm))return;
  const b=document.getElementById('stopMigrationBtn');b.disabled=true;
  try{const d=await api({action:'stop'});render(d);message(c().stopped)}
  catch(e){message(e.message||c().err,false)}
  finally{b.disabled=false}
}

async function push(){
  const b=document.getElementById('pushMigrationBtn');b.disabled=true;
  try{const d=await api({action:'push'});render(d);message(c().pushOk.replace('{n}',Number(d?.push?.recipients??d?.lastPushRecipients??0).toLocaleString()))}
  catch(e){message(e.message||c().err,false)}
  finally{b.disabled=false}
}

function applyCopy(){
  const x=c();
  const map={migrationStatusLabel:x.status,startMigrationBtn:x.start,stopMigrationBtn:x.stop,refreshMigrationBtn:x.refresh,pushMigrationBtn:x.push};
  Object.entries(map).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v});
  const tip=document.getElementById('migrationTip');if(tip)tip.textContent=x.ready;
}

function boot(){
  applyCopy();
  document.getElementById('startMigrationBtn')?.addEventListener('click',start);
  document.getElementById('stopMigrationBtn')?.addEventListener('click',stop);
  document.getElementById('refreshMigrationBtn')?.addEventListener('click',load);
  document.getElementById('pushMigrationBtn')?.addEventListener('click',push);
  document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(applyCopy,0));
  const panel=document.getElementById('adminPanel');
  if(panel&&'MutationObserver'in window){
    new MutationObserver(()=>{if(panel.style.display!=='none')load()}).observe(panel,{attributes:true,attributeFilter:['style']});
  }
  if(panel&&panel.style.display!=='none')load();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
