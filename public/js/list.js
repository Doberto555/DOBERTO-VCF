(function loadDobertoBrand(){
  document.querySelectorAll('link[rel~="icon"]').forEach((el)=>el.remove());
  const icon=document.createElement('link');icon.rel='icon';icon.type='image/png';icon.href='icons/doberto-vcf-192.png?v=20260904-1';document.head.appendChild(icon);
})();

let currentPage=1,totalPages=1,lastListData=null,publicSearch='',publicCountry='',loading=false,loadError=false,requestSeq=0,activeController=null;

const COPY={
  ht:{
    title:'DOBERTO VCF — Manm',kicker:'Manm DOBERTO VCF',title1:'Dekouvri manm yo',title2:'nan rezo a',desc:'Pou pwoteje vi prive chak moun, sèlman non ak peyi parèt nan anyè a.',
    privacyTitle:'Enfòmasyon ou rete prive',privacyDesc:'Nimewo telefòn yo pa janm parèt nan anyè piblik la.',network:'Rezo',directoryTitle:'Anyè manm yo',directoryDesc:'Chèche pa non oswa pa peyi.',memberOne:'manm',memberMany:'manm',
    filters:'Chèche manm',search:'Chèche pa non...',searchLabel:'Chèche yon manm pa non',clearSearch:'Efase rechèch la',countryLabel:'Filtre pa peyi',allCountries:'Tout peyi',emptyAll:'Poko gen manm pou montre.',emptySearch:'Pa gen rezilta pou rechèch sa a.',loading:'Ap chaje manm yo...',error:'Nou pa ka chaje manm yo kounye a.',retry:'Eseye ankò',
    prev:'Anvan',next:'Apre',page:'Paj {page} sou {total}',name:'Non',country:'Peyi',
    syncKicker:'Auto-Sync',syncTitle:'Kontak ou yo rete nan Google Contacts',syncDesc:'Plan Standard la senkronize otomatikman apre 10 minit. VIP ajoute nouvo kontak yo touswit.',syncCta:'Jere Auto-Sync',
    footerAbout:'Konsènan',footerPrivacy:'Konfidansyalite',footerTerms:'Kondisyon'
  },
  fr:{
    title:'DOBERTO VCF — Membres',kicker:'Membres DOBERTO VCF',title1:'Découvrez les membres',title2:'du réseau',desc:'Pour protéger la vie privée de chacun, seuls le nom et le pays apparaissent dans l’annuaire.',
    privacyTitle:'Vos informations restent privées',privacyDesc:'Les numéros de téléphone ne sont jamais affichés dans l’annuaire public.',network:'Réseau',directoryTitle:'Annuaire des membres',directoryDesc:'Recherchez par nom ou par pays.',memberOne:'membre',memberMany:'membres',
    filters:'Rechercher un membre',search:'Rechercher par nom...',searchLabel:'Rechercher un membre par nom',clearSearch:'Effacer la recherche',countryLabel:'Filtrer par pays',allCountries:'Tous les pays',emptyAll:'Aucun membre à afficher pour le moment.',emptySearch:'Aucun résultat pour cette recherche.',loading:'Chargement des membres...',error:'Impossible de charger les membres pour le moment.',retry:'Réessayer',
    prev:'Précédent',next:'Suivant',page:'Page {page} sur {total}',name:'Nom',country:'Pays',
    syncKicker:'Auto-Sync',syncTitle:'Vos contacts restent dans Google Contacts',syncDesc:'Le plan Standard synchronise automatiquement après 10 minutes. VIP ajoute les nouveaux contacts immédiatement.',syncCta:'Gérer Auto-Sync',
    footerAbout:'À propos',footerPrivacy:'Confidentialité',footerTerms:'Conditions'
  },
  en:{
    title:'DOBERTO VCF — Members',kicker:'DOBERTO VCF members',title1:'Meet the members',title2:'in the network',desc:'To protect everyone’s privacy, only names and countries appear in the directory.',
    privacyTitle:'Your information stays private',privacyDesc:'Phone numbers are never shown in the public directory.',network:'Network',directoryTitle:'Member directory',directoryDesc:'Search by name or country.',memberOne:'member',memberMany:'members',
    filters:'Find a member',search:'Search by name...',searchLabel:'Search for a member by name',clearSearch:'Clear search',countryLabel:'Filter by country',allCountries:'All countries',emptyAll:'No members to show yet.',emptySearch:'No results match this search.',loading:'Loading members...',error:'Members cannot be loaded right now.',retry:'Try again',
    prev:'Previous',next:'Next',page:'Page {page} of {total}',name:'Name',country:'Country',
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
function memberCountLabel(count){const c=tx();return `${count} ${count===1?c.memberOne:c.memberMany}`;}
function hasFilters(){return Boolean(publicSearch||publicCountry);}

function updateClearButton(){
  const clear=document.getElementById('clearSearchBtn');
  const input=document.getElementById('publicSearch');
  if(clear)clear.hidden=!Boolean(input?.value);
}

function setupDirectoryFilters(){
  const search=document.getElementById('publicSearch');const country=document.getElementById('publicCountry');if(!search||!country)return;
  if(country.options.length<=1&&typeof COUNTRIES!=='undefined'){
    COUNTRIES.forEach(c=>{const o=document.createElement('option');o.value=`${c.name} (+${c.dial})`;o.textContent=c.name;country.appendChild(o);});
  }
  let timer;
  search.addEventListener('input',e=>{updateClearButton();clearTimeout(timer);timer=setTimeout(()=>{publicSearch=e.target.value.trim();loadList(1);},220);});
  country.addEventListener('change',e=>{publicCountry=e.target.value;loadList(1);});
  document.getElementById('clearSearchBtn')?.addEventListener('click',()=>{
    clearTimeout(timer);search.value='';publicSearch='';updateClearButton();search.focus();loadList(1);
  });
}

function renderLoading(){
  const body=document.getElementById('listBody');if(!body)return;
  body.innerHTML=Array.from({length:5},()=>'<tr class="member-skeleton"><td><div class="name-cell"><span class="avatar skeleton-block"></span><span class="skeleton-line skeleton-name"></span></div></td><td><span class="skeleton-line skeleton-country"></span></td></tr>').join('');
}

function renderMessage(message,withRetry=false){
  const body=document.getElementById('listBody');if(!body)return;
  body.innerHTML=`<tr class="directory-state-row"><td colspan="2"><div class="pro-empty"><span>${escapeHtml(message)}</span>${withRetry?`<button type="button" class="directory-retry" id="retryListBtn">${escapeHtml(tx().retry)}</button>`:''}</div></td></tr>`;
  if(withRetry)document.getElementById('retryListBtn')?.addEventListener('click',()=>loadList(currentPage||1));
}

async function loadList(page){
  const panel=document.getElementById('memberDirectoryPanel');
  const qs=new URLSearchParams({page:String(page)});if(publicSearch)qs.set('search',publicSearch);if(publicCountry)qs.set('country',publicCountry);
  const seq=++requestSeq;
  if(activeController)activeController.abort();
  const controller=new AbortController();activeController=controller;
  loading=true;loadError=false;if(panel)panel.setAttribute('aria-busy','true');renderLoading();updatePager();
  try{
    const r=await fetch(`/api/public-list?${qs.toString()}`,{cache:'no-store',signal:controller.signal});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error('list');if(seq!==requestSeq)return;
    lastListData=d;currentPage=page;totalPages=Math.max(1,Math.ceil((d.total||0)/(d.pageSize||20)));loading=false;renderList();
  }catch(error){
    if(error?.name==='AbortError'||seq!==requestSeq)return;
    loading=false;loadError=true;lastListData=null;renderMessage(tx().error,true);updatePager();
  }finally{
    if(seq===requestSeq){if(panel)panel.setAttribute('aria-busy','false');activeController=null;}
  }
}

function updatePager(){
  const c=tx();const info=document.getElementById('pageInfo');const prev=document.getElementById('prevBtn'),next=document.getElementById('nextBtn');const total=document.getElementById('memberTotalChip');const pager=document.querySelector('.pager');
  const count=Number(lastListData?.total||0);
  if(total)total.textContent=loadError?'—':loading?'…':memberCountLabel(count);
  if(info)info.textContent=lastListData?fmt(c.page,{page:currentPage,total:totalPages}):'';
  if(prev){prev.disabled=loading||loadError||currentPage<=1;prev.textContent=c.prev;}
  if(next){next.disabled=loading||loadError||currentPage>=totalPages;next.textContent=c.next;}
  if(pager)pager.hidden=Boolean(!loading&&!loadError&&lastListData&&(count===0||totalPages<=1));
}

function renderList(){
  if(!lastListData)return;const body=document.getElementById('listBody');if(!body)return;body.innerHTML='';
  if(!lastListData.list||!lastListData.list.length){renderMessage(hasFilters()?tx().emptySearch:tx().emptyAll);}
  else lastListData.list.forEach(row=>{
    const tr=document.createElement('tr');
    const displayName=escapeHtml(row.display_name||row.name||'—');const country=escapeHtml(row.country_name||'—');
    tr.innerHTML=`<td><div class="name-cell"><span class="avatar" aria-hidden="true">${escapeHtml(initials(row.name||row.display_name))}</span><span class="member-name">${displayName}</span>${typeof dobertoIconSvg==='function'?dobertoIconSvg(row.icon):''}</div></td><td data-country-cell>${country}</td>`;
    body.appendChild(tr);
  });
  updatePager();
}

function applyLanguage(){
  const c=tx();document.title=c.title;document.documentElement.lang=lang()==='ht'?'ht':lang();
  setText('.list-page-hero .list-kicker',c.kicker);setText('.list-page-hero [data-i18n="list_title_1"]',c.title1);setText('.list-page-hero [data-i18n="list_title_2"]',c.title2);setText('.list-page-hero [data-i18n="list_desc"]',c.desc);
  setText('#privacyChipTitle',c.privacyTitle);setText('#privacyChipDesc',c.privacyDesc);setText('#directoryKicker',c.network);setText('#directoryTitle',c.directoryTitle);setText('#directoryDesc',c.directoryDesc);
  setText('#filterTitle',c.filters);
  const search=document.getElementById('publicSearch');if(search){search.placeholder=c.search;search.setAttribute('aria-label',c.searchLabel);}
  const clear=document.getElementById('clearSearchBtn');if(clear){clear.setAttribute('aria-label',c.clearSearch);clear.title=c.clearSearch;}
  const country=document.getElementById('publicCountry');if(country){country.setAttribute('aria-label',c.countryLabel);if(country.options[0])country.options[0].textContent=c.allCountries;}
  setText('#thName',c.name);setText('#thCountry',c.country);setText('#syncNoteKicker',c.syncKicker);setText('#syncNoteTitle',c.syncTitle);setText('#syncNoteDesc',c.syncDesc);setText('#syncNoteCta',c.syncCta);
  setText('#footerAbout',c.footerAbout);setText('#footerPrivacy',c.footerPrivacy);setText('#footerTerms',c.footerTerms);
  if(loadError)renderMessage(c.error,true);else if(loading)renderLoading();else renderList();updatePager();updateClearButton();
}

document.getElementById('prevBtn')?.addEventListener('click',()=>{if(currentPage>1)loadList(currentPage-1);});
document.getElementById('nextBtn')?.addEventListener('click',()=>{if(currentPage<totalPages)loadList(currentPage+1);});
setupDirectoryFilters();applyLanguage();loadList(1);
document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(applyLanguage,0));
window.addEventListener('pageshow',()=>setTimeout(applyLanguage,0));
