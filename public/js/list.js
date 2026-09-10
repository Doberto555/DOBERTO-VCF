(function loadDobertoBrand(){
  document.querySelectorAll('link[rel~="icon"]').forEach((el)=>el.remove());
  const icon=document.createElement('link');icon.rel='icon';icon.type='image/png';icon.href='icons/doberto-vcf-192.png?v=20260904-1';document.head.appendChild(icon);
})();

let currentPage=1,totalPages=1,lastListData=null,publicSearch='',publicCountry='',loading=false,loadError=false;
const COPY={
  ht:{
    title:'DOBERTO VCF — Manm',kicker:'Manm DOBERTO VCF',title1:'Gade moun ki deja',title2:'nan rezo a',desc:'Pou pwoteje vi prive manm yo, sèlman non ak peyi parèt isit la.',
    privacyTitle:'Vi prive pa default',privacyDesc:'Nimewo telefòn yo pa parèt nan anyè piblik la.',network:'Rezo',directoryTitle:'Manm yo',directoryDesc:'Chèche yon moun pa non oswa peyi.',members:'manm',
    filters:'Chèche manm',search:'Chèche yon moun pa non...',allCountries:'Tout peyi',empty:'Nou pa jwenn okenn manm pou rechèch sa a.',loading:'Ap chaje manm yo...',error:'Nou pa ka chaje manm yo kounye a. Eseye ankò.',
    prev:'Anvan',next:'Apre',page:'Paj {page}/{total} · {count} manm',name:'Non',country:'Peyi',
    syncKicker:'Auto-Sync',syncTitle:'Kontak yo jere nan Google Contacts',syncDesc:'Plan Standard la senkronize otomatikman apre 10 minit. VIP ajoute nouvo kontak yo touswit.',syncCta:'Jere Auto-Sync',
    footerAbout:'Konsènan',footerPrivacy:'Konfidansyalite',footerTerms:'Kondisyon'
  },
  fr:{
    title:'DOBERTO VCF — Membres',kicker:'Membres DOBERTO VCF',title1:'Découvrez les personnes déjà',title2:'dans le réseau',desc:'Pour protéger la vie privée des membres, seuls le nom et le pays sont affichés ici.',
    privacyTitle:'Confidentialité par défaut',privacyDesc:'Les numéros de téléphone ne sont jamais affichés dans l’annuaire public.',network:'Réseau',directoryTitle:'Membres',directoryDesc:'Recherchez une personne par nom ou par pays.',members:'membres',
    filters:'Rechercher un membre',search:'Rechercher une personne par nom...',allCountries:'Tous les pays',empty:'Aucun membre ne correspond à cette recherche.',loading:'Chargement des membres...',error:'Impossible de charger les membres pour le moment. Réessayez.',
    prev:'Précédent',next:'Suivant',page:'Page {page}/{total} · {count} membres',name:'Nom',country:'Pays',
    syncKicker:'Auto-Sync',syncTitle:'Vos contacts restent dans Google Contacts',syncDesc:'Le plan Standard synchronise automatiquement après 10 minutes. VIP ajoute les nouveaux contacts immédiatement.',syncCta:'Gérer Auto-Sync',
    footerAbout:'À propos',footerPrivacy:'Confidentialité',footerTerms:'Conditions'
  },
  en:{
    title:'DOBERTO VCF — Members',kicker:'DOBERTO VCF members',title1:'See who is already',title2:'in the network',desc:'To protect member privacy, only names and countries are shown here.',
    privacyTitle:'Privacy by default',privacyDesc:'Phone numbers are never shown in the public directory.',network:'Network',directoryTitle:'Members',directoryDesc:'Search for someone by name or country.',members:'members',
    filters:'Find a member',search:'Search by name...',allCountries:'All countries',empty:'No members match this search.',loading:'Loading members...',error:'Members cannot be loaded right now. Please try again.',
    prev:'Previous',next:'Next',page:'Page {page}/{total} · {count} members',name:'Name',country:'Country',
    syncKicker:'Auto-Sync',syncTitle:'Your contacts stay in Google Contacts',syncDesc:'Standard syncs automatically after 10 minutes. VIP adds new contacts immediately.',syncCta:'Manage Auto-Sync',
    footerAbout:'About',footerPrivacy:'Privacy',footerTerms:'Terms'
  }
};
function lang(){const s=document.getElementById('langSelect');return s&&COPY[s.value]?s.value:'ht';}
function tx(){return COPY[lang()]||COPY.ht;}
function fmt(str,vars){let out=str;Object.keys(vars||{}).forEach(k=>out=out.replace(`{${k}}`,String(vars[k])));return out;}
function initials(name){return(name||'?').trim().split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function setText(selector,value){const el=document.querySelector(selector);if(el)el.textContent=value;}

function setupDirectoryFilters(){
  const search=document.getElementById('publicSearch');const country=document.getElementById('publicCountry');if(!search||!country)return;
  if(country.options.length<=1&&typeof COUNTRIES!=='undefined'){
    COUNTRIES.forEach(c=>{const o=document.createElement('option');o.value=`${c.name} (+${c.dial})`;o.textContent=c.name;country.appendChild(o);});
  }
  let timer;
  search.addEventListener('input',e=>{clearTimeout(timer);timer=setTimeout(()=>{publicSearch=e.target.value.trim();loadList(1);},250);});
  country.addEventListener('change',e=>{publicCountry=e.target.value;loadList(1);});
}

function renderState(message){
  const body=document.getElementById('listBody');if(!body)return;
  body.innerHTML=`<tr><td colspan="2"><div class="pro-empty">${escapeHtml(message)}</div></td></tr>`;
}

async function loadList(page){
  const panel=document.getElementById('memberDirectoryPanel');
  const qs=new URLSearchParams({page:String(page)});if(publicSearch)qs.set('search',publicSearch);if(publicCountry)qs.set('country',publicCountry);
  loading=true;loadError=false;if(panel)panel.setAttribute('aria-busy','true');renderState(tx().loading);
  try{
    const r=await fetch(`/api/public-list?${qs.toString()}`,{cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error('list');
    lastListData=d;currentPage=page;totalPages=Math.max(1,Math.ceil((d.total||0)/(d.pageSize||20)));loading=false;renderList();
  }catch(_){loading=false;loadError=true;lastListData=null;renderState(tx().error);updatePager();}
  finally{if(panel)panel.setAttribute('aria-busy','false');}
}

function updatePager(){
  const c=tx();const info=document.getElementById('pageInfo');const prev=document.getElementById('prevBtn'),next=document.getElementById('nextBtn');const total=document.getElementById('memberTotalChip');
  const count=Number(lastListData?.total||0);
  if(total)total.textContent=loadError?'—':`${count} ${c.members}`;
  if(info)info.textContent=lastListData?fmt(c.page,{page:currentPage,total:totalPages,count}):'';
  if(prev){prev.disabled=loading||loadError||currentPage<=1;prev.textContent=c.prev;}
  if(next){next.disabled=loading||loadError||currentPage>=totalPages;next.textContent=c.next;}
}

function renderList(){
  if(!lastListData)return;const body=document.getElementById('listBody');if(!body)return;body.innerHTML='';
  if(!lastListData.list||!lastListData.list.length){renderState(tx().empty);}
  else lastListData.list.forEach(row=>{
    const tr=document.createElement('tr');
    const displayName=escapeHtml(row.display_name||row.name||'—');const country=escapeHtml(row.country_name||'—');
    tr.innerHTML=`<td><div class="name-cell"><span class="avatar" aria-hidden="true">${escapeHtml(initials(row.name||row.display_name))}</span><span class="member-name">${displayName}</span>${typeof dobertoIconSvg==='function'?dobertoIconSvg(row.icon):''}</div></td><td>${country}</td>`;
    body.appendChild(tr);
  });
  updatePager();
}

function applyLanguage(){
  const c=tx();document.title=c.title;document.documentElement.lang=lang()==='ht'?'ht':lang();
  setText('.list-page-hero .list-kicker',c.kicker);setText('.list-page-hero [data-i18n="list_title_1"]',c.title1);setText('.list-page-hero [data-i18n="list_title_2"]',c.title2);setText('.list-page-hero [data-i18n="list_desc"]',c.desc);
  setText('#privacyChipTitle',c.privacyTitle);setText('#privacyChipDesc',c.privacyDesc);setText('#directoryKicker',c.network);setText('#directoryTitle',c.directoryTitle);setText('#directoryDesc',c.directoryDesc);
  setText('#filterTitle',c.filters);const search=document.getElementById('publicSearch');if(search)search.placeholder=c.search;const country=document.getElementById('publicCountry');if(country&&country.options[0])country.options[0].textContent=c.allCountries;
  setText('#thName',c.name);setText('#thCountry',c.country);setText('#syncNoteKicker',c.syncKicker);setText('#syncNoteTitle',c.syncTitle);setText('#syncNoteDesc',c.syncDesc);setText('#syncNoteCta',c.syncCta);
  setText('#footerAbout',c.footerAbout);setText('#footerPrivacy',c.footerPrivacy);setText('#footerTerms',c.footerTerms);
  if(loadError)renderState(c.error);else if(loading)renderState(c.loading);else renderList();updatePager();
}

document.getElementById('prevBtn')?.addEventListener('click',()=>{if(currentPage>1)loadList(currentPage-1);});
document.getElementById('nextBtn')?.addEventListener('click',()=>{if(currentPage<totalPages)loadList(currentPage+1);});
setupDirectoryFilters();applyLanguage();loadList(1);
document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(applyLanguage,0));
window.addEventListener('pageshow',()=>setTimeout(applyLanguage,0));
