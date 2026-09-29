(()=>{
'use strict';

const TOKEN_KEY='dv_auth_token';
const COPY={
  ht:{k:'NOUVO GWOUP DISPONIB',t:'Ansyen gwoup la ranplase.',d:'Ou te deja enskri sou DOBERTO VCF. Peze bouton an pou antre nan nouvo gwoup WhatsApp la.',join:'Antre nan nouvo gwoup la',done:'Mwen antre deja',confirmed:'Migration konfime. Mèsi dèske ou antre nan nouvo gwoup la.',login:'Ou te deja enskri? Konekte ankò pou jwenn nouvo gwoup la.'},
  fr:{k:'NOUVEAU GROUPE DISPONIBLE',t:'L’ancien groupe a été remplacé.',d:'Vous étiez déjà inscrit sur DOBERTO VCF. Ouvrez le nouveau groupe WhatsApp avec le bouton ci-dessous.',join:'Rejoindre le nouveau groupe',done:'J’ai rejoint le groupe',confirmed:'Migration confirmée. Merci d’avoir rejoint le nouveau groupe.',login:'Déjà inscrit ? Reconnectez-vous pour accéder au nouveau groupe.'},
  en:{k:'NEW GROUP AVAILABLE',t:'The previous group was replaced.',d:'You were already registered on DOBERTO VCF. Use the button below to open the new WhatsApp group.',join:'Join the new group',done:'I joined the group',confirmed:'Migration confirmed. Thanks for joining the new group.',login:'Already registered? Sign in again to access the new group.'}
};

function lang(){try{const s=localStorage.getItem('doberto_lang');return COPY[s]?s:'ht'}catch(_){return 'ht'}}
function c(){return COPY[lang()]||COPY.ht}
function token(){try{return localStorage.getItem(TOKEN_KEY)||''}catch(_){return ''}}
function headers(json=false){const h=json?{'Content-Type':'application/json'}:{};const t=token();if(t)h.Authorization='Bearer '+t;return h}

function ensureStyle(){
  if(document.getElementById('dvMigrationStyle'))return;
  const style=document.createElement('style');
  style.id='dvMigrationStyle';
  style.textContent=`
  .dv-migration-card{width:min(920px,calc(100% - 28px));margin:18px auto 24px;padding:18px;border:1px solid rgba(37,211,102,.2);border-radius:18px;background:linear-gradient(145deg,rgba(11,28,20,.97),rgba(7,14,11,.98));box-shadow:0 18px 50px rgba(0,0,0,.18);color:#eef8f3}
  .dv-migration-card[hidden]{display:none!important}.dv-migration-kicker{display:inline-flex;padding:5px 8px;border-radius:999px;background:rgba(37,211,102,.09);color:#6feaa3;font-size:8px;font-weight:900;letter-spacing:.12em}.dv-migration-card h2{margin:10px 0 6px;font-size:20px;letter-spacing:-.025em}.dv-migration-card p{margin:0;color:#8fa39a;font-size:11px;line-height:1.6}.dv-migration-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.dv-migration-actions button,.dv-migration-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 13px;border-radius:11px;border:1px solid rgba(255,255,255,.08);font:800 10.5px Inter,system-ui,sans-serif;text-decoration:none;cursor:pointer}.dv-migration-join{background:linear-gradient(135deg,#25d366,#1fb65a)!important;color:#04140a!important;border:0!important}.dv-migration-confirm{background:rgba(255,255,255,.04);color:#c7d5ce}.dv-migration-meta{margin-top:9px!important;font-size:9px!important;color:#61766b!important}@media(max-width:640px){.dv-migration-actions{display:grid}.dv-migration-actions>*{width:100%}}
  `;
  document.head.appendChild(style);
}

function placeCard(){
  let host=document.getElementById('dvMigrationCard');
  if(host)return host;
  ensureStyle();
  host=document.createElement('section');
  host.id='dvMigrationCard';
  host.className='dv-migration-card';
  host.hidden=true;
  const main=document.querySelector('main');
  if(!main)return null;
  const first=main.firstElementChild;
  if(first)first.insertAdjacentElement('afterend',host);else main.prepend(host);
  return host;
}

function render(data){
  const host=placeCard();if(!host)return;
  const x=c();
  if(!data?.eligible||!data?.active||data.status==='joined'){host.hidden=true;return}
  host.innerHTML=`<span class="dv-migration-kicker">${x.k}</span><h2>${x.t}</h2><p>${x.d}</p><div class="dv-migration-actions"><a href="#" class="dv-migration-join" id="dvMigrationJoin">${x.join} ↗</a><button type="button" class="dv-migration-confirm" id="dvMigrationConfirm">${x.done}</button></div><p class="dv-migration-meta">DOBERTO VCF · Migration de groupe</p>`;
  host.hidden=false;
  const join=document.getElementById('dvMigrationJoin');
  join?.addEventListener('click',e=>{
    e.preventDefault();
    const u=String(data.groupUrl||'');
    if(/^https:\/\/chat\.whatsapp\.com\//i.test(u))window.open(u,'_blank','noopener,noreferrer');
    update('opened').catch(()=>{});
  });
  document.getElementById('dvMigrationConfirm')?.addEventListener('click',async()=>{
    const b=document.getElementById('dvMigrationConfirm');if(b)b.disabled=true;
    try{
      const d=await update('joined');
      host.innerHTML=`<span class="dv-migration-kicker">${x.k}</span><h2>${x.confirmed}</h2>`;
      setTimeout(()=>{host.hidden=true},2600);
      return d;
    }catch(_){if(b)b.disabled=false}
  });
}

async function status(){
  if(!token())return null;
  const r=await fetch('/api/group-migration',{headers:headers(),cache:'no-store'});
  if(r.status===401)return null;
  const d=await r.json().catch(()=>({}));
  if(!r.ok)return null;
  return d;
}

async function update(action){
  const r=await fetch('/api/group-migration',{method:'POST',headers:headers(true),body:JSON.stringify({action}),cache:'no-store'});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||'migration_failed');
  return d;
}

async function check(){
  const d=await status();
  if(d)render(d);
}

function boot(){
  check();
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(token())check();
    if(tries>=6)clearInterval(timer);
  },1800);
  window.addEventListener('pageshow',check);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
