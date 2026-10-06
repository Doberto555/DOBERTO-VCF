(function loadDobertoBrand(){document.querySelectorAll('link[rel~="icon"]').forEach((el)=>el.remove());const icon=document.createElement('link');icon.rel='icon';icon.type='image/png';icon.href='icons/doberto-vcf-192.png?v=20260904-1';document.head.appendChild(icon);})();
let currentPage=1,totalPages=1,lastListData=null,publicSearch='',publicCountry='',loading=false,loadError=false,requestSeq=0,activeController=null;
const COPY={
ht:{title:'DOBERTO VCF — Manm',kicker:'Manm DOBERTO VCF',title1:'Dekouvri manm yo',title2:'nan rezo a',desc:'Pou pwoteje vi prive chak moun, sèlman non ak peyi parèt nan anyè a.',privacyTitle:'Enfòmasyon ou rete prive',privacyDesc:'Nimewo telefòn yo pa janm parèt nan anyè piblik la.',network:'Rezo',directoryTitle:'Anyè manm yo',directoryDesc:'Chèche pa non oswa pa peyi.',memberOne:'manm',memberMany:'manm',filters:'Chèche manm',search:'Chèche pa non...',searchLabel:'Chèche yon manm pa non',clearSearch:'Efase rechèch la',countryLabel:'Filtre pa peyi',allCountries:'Tout peyi',emptyAll:'Poko gen manm pou montre.',emptySearch:'Pa gen rezilta pou rechèch sa a.',loading:'Ap chaje manm yo...',error:'Nou pa ka chaje manm yo kounye a.',retry:'Eseye ankò',prev:'Anvan',next:'Apre',page:'Paj {page} sou {total}',name:'Non',country:'Peyi',footerAbout:'Konsènan',footerPrivacy:'Konfidansyalite',footerTerms:'Kondisyon'},
fr:{title:'DOBERTO VCF — Membres',kicker:'Membres DOBERTO VCF',title1:'Découvrez les membres',title2:'du réseau',desc:'Pour protéger la vie privée de chacun, seuls le nom et le pays apparaissent dans l’annuaire.',privacyTitle:'Vos informations restent privées',privacyDesc:'Les numéros de téléphone ne sont jamais affichés dans l’annuaire public.',network:'Réseau',directoryTitle:'Annuaire des membres',directoryDesc:'Recherchez par nom ou par pays.',memberOne:'membre',memberMany:'membres',filters:'Rechercher un membre',search:'Rechercher par nom...',searchLabel:'Rechercher un membre par nom',clearSearch:'Effacer la recherche',countryLabel:'Filtrer par pays',allCountries:'Tous les pays',emptyAll:'Aucun membre à afficher pour le moment.',emptySearch:'Aucun résultat pour cette recherche.',loading:'Chargement des membres...',error:'Impossible de charger les membres pour le moment.',retry:'Réessayer',prev:'Précédent',next:'Suivant',page:'Page {page} sur {total}',name:'Nom',country:'Pays',footerAbout:'À propos',footerPrivacy:'Confidentialité',footerTerms:'Conditions'},
en:{title:'DOBERTO VCF — Members',kicker:'DOBERTO VCF members',title1:'Meet the members',title2:'in the network',desc:'To protect everyone’s privacy, only names and countries appear in the directory.',privacyTitle:'Your information stays private',privacyDesc:'Phone numbers are never shown in the public directory.',network:'Network',directoryTitle:'Member directory',directoryDesc:'Search by name or country.',memberOne:'member',memberMany:'members',filters:'Find a member',search:'Search by name...',searchLabel:'Search for a member by name',clearSearch:'Clear search',countryLabel:'Filter by country',allCountries:'All countries',emptyAll:'No members to show yet.',emptySearch:'No results match this search.',loading:'Loading members...',error:'Members cannot be loaded right now.',retry:'Try again',prev:'Previous',next:'Next',page:'Page {page} of {total}',name:'Name',country:'Country',footerAbout:'About',footerPrivacy:'Privacy',footerTerms:'Terms'}
};
function lang(){const s=document.getElementById('langSelect');return s&&COPY[s.value]?s.value:'ht'}function tx(){return COPY[lang()]||COPY.ht}function fmt(str,vars){let out=str;Object.keys(vars||{}).forEach(k=>out=out.replace(`{${k}}`,String(vars[k])));return out}function initials(name){return(name||'?').trim().split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?'}function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}function setText(selector,value){const el=document.querySelector(selector);if(el)el.textContent=value}function memberCountLabel(count){const c=tx();return `${count} ${count===1?c.memberOne:c.memberMany}`}function hasFilters(){return Boolean(publicSearch||publicCountry)}
function updateClearButton(){const clear=document.getElementById('clearSearchBtn'),input=document.getElementById('publicSearch');if(clear)clear.hidden=!Boolean(input?.value)}
function setupDirectoryFilters(){const search=document.getElementById('publicSearch'),country=document.getElementById('publicCountry');if(!search||!country)return;if(country.options.length<=1&&typeof COUNTRIES!=='undefined')COUNTRIES.forEach(c=>{const o=document.createElement('option');o.value=`${c.name} (+${c.dial})`;o.textContent=c.name;country.appendChild(o)});let timer;search.addEventListener('input',e=>{updateClearButton();clearTimeout(timer);timer=setTimeout(()=>{publicSearch=e.target.value.trim();loadList(1)},220)});country.addEventListener('change',e=>{publicCountry=e.target.value;loadList(1)});document.getElementById('clearSearchBtn')?.addEventListener('click',()=>{clearTimeout(timer);search.value='';publicSearch='';updateClearButton();search.focus();loadList(1)})}
function renderLoading(){const body=document.getElementById('listBody');if(!body)return;body.innerHTML=Array.from({length:5},()=>'<tr class="member-skeleton"><td><div class="name-cell"><span class="avatar skeleton-block"></span><span class="skeleton-line skeleton-name"></span></div></td><td><span class="skeleton-line skeleton-country"></span></td></tr>').join('')}
function renderMessage(message,withRetry=false){const body=document.getElementById('listBody');if(!body)return;body.innerHTML=`<tr class="directory-state-row"><td colspan="2"><div class="pro-empty"><span>${escapeHtml(message)}</span>${withRetry?`<button type="button" class="directory-retry" id="retryListBtn">${escapeHtml(tx().retry)}</button>`:''}</div></td></tr>`;if(withRetry)document.getElementById('retryListBtn')?.addEventListener('click',()=>loadList(currentPage||1))}
async function loadList(page){const panel=document.getElementById('memberDirectoryPanel');const qs=new URLSearchParams({page:String(page)});if(publicSearch)qs.set('search',publicSearch);if(publicCountry)qs.set('country',publicCountry);const seq=++requestSeq;if(activeController)activeController.abort();const controller=new AbortController();activeController=controller;loading=true;loadError=false;if(panel)panel.setAttribute('aria-busy','true');renderLoading();updatePager();try{const r=await fetch(`/api/public-list?${qs.toString()}`,{cache:'no-store',signal:controller.signal});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error('list');if(seq!==requestSeq)return;lastListData=d;currentPage=page;totalPages=Math.max(1,Math.ceil((d.total||0)/(d.pageSize||20)));loading=false;renderList()}catch(error){if(error?.name==='AbortError'||seq!==requestSeq)return;loading=false;loadError=true;lastListData=null;renderMessage(tx().error,true);updatePager()}finally{if(seq===requestSeq){if(panel)panel.setAttribute('aria-busy','false');activeController=null}}}
function updatePager(){const c=tx(),info=document.getElementById('pageInfo'),prev=document.getElementById('prevBtn'),next=document.getElementById('nextBtn'),total=document.getElementById('memberTotalChip'),pager=document.querySelector('.pager');const count=Number(lastListData?.total||0);if(total)total.textContent=loadError?'—':loading?'…':memberCountLabel(count);if(info)info.textContent=lastListData?fmt(c.page,{page:currentPage,total:totalPages}):'';if(prev){prev.disabled=loading||loadError||currentPage<=1;prev.textContent=c.prev}if(next){next.disabled=loading||loadError||currentPage>=totalPages;next.textContent=c.next}if(pager)pager.hidden=Boolean(!loading&&!loadError&&lastListData&&(count===0||totalPages<=1))}
function renderList(){if(!lastListData)return;const body=document.getElementById('listBody');if(!body)return;body.innerHTML='';if(!lastListData.list||!lastListData.list.length)renderMessage(hasFilters()?tx().emptySearch:tx().emptyAll);else lastListData.list.forEach(row=>{const tr=document.createElement('tr');const displayName=escapeHtml(row.display_name||row.name||'—'),country=escapeHtml(row.country_name||'—');tr.innerHTML=`<td><div class="name-cell"><span class="avatar" aria-hidden="true">${escapeHtml(initials(row.name||row.display_name))}</span><span class="member-name">${displayName}</span>${typeof dobertoIconSvg==='function'?dobertoIconSvg(row.icon):''}</div></td><td data-country-cell>${country}</td>`;body.appendChild(tr)});updatePager()}
function applyLanguage(){const c=tx();document.title=c.title;document.documentElement.lang=lang();setText('.list-page-hero .list-kicker',c.kicker);setText('.list-page-hero [data-i18n="list_title_1"]',c.title1);setText('.list-page-hero [data-i18n="list_title_2"]',c.title2);setText('.list-page-hero [data-i18n="list_desc"]',c.desc);setText('#privacyChipTitle',c.privacyTitle);setText('#privacyChipDesc',c.privacyDesc);setText('#directoryKicker',c.network);setText('#directoryTitle',c.directoryTitle);setText('#directoryDesc',c.directoryDesc);setText('#filterTitle',c.filters);const search=document.getElementById('publicSearch');if(search){search.placeholder=c.search;search.setAttribute('aria-label',c.searchLabel)}const clear=document.getElementById('clearSearchBtn');if(clear){clear.setAttribute('aria-label',c.clearSearch);clear.title=c.clearSearch}const country=document.getElementById('publicCountry');if(country){country.setAttribute('aria-label',c.countryLabel);if(country.options[0])country.options[0].textContent=c.allCountries}setText('#thName',c.name);setText('#thCountry',c.country);setText('#footerAbout',c.footerAbout);setText('#footerPrivacy',c.footerPrivacy);setText('#footerTerms',c.footerTerms);if(loadError)renderMessage(c.error,true);else if(loading)renderLoading();else renderList();updatePager();updateClearButton()}
document.getElementById('prevBtn')?.addEventListener('click',()=>{if(currentPage>1)loadList(currentPage-1)});document.getElementById('nextBtn')?.addEventListener('click',()=>{if(currentPage<totalPages)loadList(currentPage+1)});setupDirectoryFilters();applyLanguage();loadList(1);document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(applyLanguage,0));window.addEventListener('pageshow',()=>setTimeout(applyLanguage,0));


// ---------- Public VCF download ----------
(function setupVcfDownload(){
  const form=document.getElementById('vcfDownloadForm');
  if(!form)return;

  const dial=document.getElementById('vcfDial');
  const state=document.getElementById('vcfDownloadState');
  const progressText=document.getElementById('vcfDownloadProgressText');
  const remaining=document.getElementById('vcfDownloadRemaining');
  const bar=document.getElementById('vcfDownloadProgressBar');
  const btn=document.getElementById('vcfDownloadBtn');
  const msg=document.getElementById('vcfDownloadMsg');
  const googleAccount=document.getElementById('vcfGoogleAccount');
  const googleLoginBtn=document.getElementById('vcfGoogleLoginBtn');
  let googleSession=null;

  function authToken(){
    try{return localStorage.getItem('dv_auth_token')||''}catch(_){return ''}
  }

  async function loadGoogleDownloadSession(){
    const token=authToken();
    if(!token){
      googleSession=null;
      if(googleAccount)googleAccount.style.display='none';
      if(googleLoginBtn)googleLoginBtn.style.display='';
      return null;
    }
    try{
      const res=await fetch('/api/auth/session',{
        headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},
        cache:'no-store'
      });
      const data=await res.json().catch(()=>({}));
      if(!res.ok||!data?.user){
        googleSession=null;
        if(googleAccount)googleAccount.style.display='none';
        if(googleLoginBtn)googleLoginBtn.style.display='';
        return null;
      }
      googleSession=data;
      if(googleAccount){
        googleAccount.textContent=data.registered
          ? `Google: ${data.user.email} — enskripsyon jwenn otomatikman`
          : `Google: ${data.user.email} — kont sa a poko gen enskripsyon`;
        googleAccount.style.display='block';
      }
      if(googleLoginBtn)googleLoginBtn.style.display=data.registered?'none':'';
      const nameInput=document.getElementById('vcfName');
      if(data.registration?.name && nameInput && !nameInput.value) nameInput.value=data.registration.name;
      if(data.registration?.dial_code && dial) dial.value=String(data.registration.dial_code);
      const phoneInput=document.getElementById('vcfPhone');
      if(data.registration?.phone && phoneInput && !phoneInput.value) phoneInput.value=data.registration.phone;
      return data;
    }catch(_){
      return null;
    }
  }

  if(dial && typeof COUNTRIES!=='undefined'){
    dial.innerHTML='';
    COUNTRIES.forEach(country=>{
      const option=document.createElement('option');
      option.value=String(country.dial||'');
      option.textContent=`${country.name} (+${country.dial})`;
      if(String(country.dial)==='509') option.selected=true;
      dial.appendChild(option);
    });
  }

  const copy={
    ht:{checking:'AP VERIFYE',open:'OUVÈ',locked:'BLOKE',members:'manm',left:'rete',ready:'Telechajman an disponib kounye a.',wait:'Telechajman an poko disponib.',adminLock:'Admin lan bloke telechajman an pou kounye a.',loading:'Ap prepare fichye a...',button:'Telechaje VCF',bad:'Verifye non ak nimewo ou te itilize lè ou te enskri a.',error:'Nou pa ka telechaje fichye a kounye a.'},
    fr:{checking:'VÉRIFICATION',open:'OUVERT',locked:'BLOQUÉ',members:'membres',left:'restants',ready:'Le téléchargement est disponible.',wait:'Le téléchargement n’est pas encore disponible.',adminLock:'L’administrateur a bloqué le téléchargement pour le moment.',loading:'Préparation du fichier...',button:'Télécharger le VCF',bad:'Vérifiez le nom et le numéro utilisés lors de votre inscription.',error:'Impossible de télécharger le fichier pour le moment.'},
    en:{checking:'CHECKING',open:'OPEN',locked:'LOCKED',members:'members',left:'left',ready:'The download is available now.',wait:'The download is not available yet.',adminLock:'The admin has locked downloads for now.',loading:'Preparing file...',button:'Telechaje VCF',bad:'Check the name and number you used when registering.',error:'Unable to download the file right now.'}
  };

  function c(){
    const l=lang();
    return copy[l]||copy.ht;
  }

  let lastStats=null;

  function renderStats(stats){
    lastStats=stats||{};
    const t=c();
    const total=Number(stats?.total||0);
    const min=Math.max(1,Number(stats?.minRequired||200));
    const pct=Math.max(0,Math.min(100,Math.round((total/min)*100)));

    if(progressText) progressText.textContent=`${total.toLocaleString()} / ${min.toLocaleString()} ${t.members}`;
    if(remaining) remaining.textContent=`${Math.max(0,min-total).toLocaleString()} ${t.left}`;
    if(bar) bar.style.width=`${pct}%`;

    const isOpen=Boolean(stats?.unlocked);
    if(state){
      state.textContent=isOpen?t.open:t.locked;
      state.style.borderColor=isOpen?'rgba(37,211,102,.35)':'rgba(255,255,255,.12)';
    }
    if(btn){
      btn.disabled=!isOpen;
      btn.textContent=t.button;
    }

    if(msg){
      msg.className='msg show '+(isOpen?'ok':'err');
      msg.textContent=isOpen
        ? t.ready
        : stats?.downloadMode==='locked'
          ? t.adminLock
          : t.wait;
    }
  }

  async function loadStats(){
    if(state) state.textContent=c().checking;
    try{
      const res=await fetch('/api/stats',{cache:'no-store',headers:{Accept:'application/json'}});
      const data=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(data.error||'stats_failed');
      renderStats(data);
    }catch(_){
      if(btn) btn.disabled=true;
      if(msg){msg.textContent=c().error;msg.className='msg show err';}
    }
  }

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!lastStats?.unlocked){
      await loadStats();
      if(!lastStats?.unlocked)return;
    }

    const name=String(document.getElementById('vcfName')?.value||'').trim();
    const dialCode=String(dial?.value||'').replace(/\D/g,'');
    const phone=String(document.getElementById('vcfPhone')?.value||'').replace(/\D/g,'');
    const googleReady=Boolean(googleSession?.registered&&authToken());
    if(!googleReady&&(!name||!dialCode||!phone)){
      if(msg){msg.textContent=c().bad;msg.className='msg show err';}
      return;
    }

    btn.disabled=true;
    btn.textContent=c().loading;
    if(msg){msg.className='msg';msg.textContent='';}

    try{
      const headers={'Content-Type':'application/json'};
      const token=authToken();
      if(token)headers.Authorization=`Bearer ${token}`;
      const verify=await fetch('/api/verify-download',{
        method:'POST',
        headers,
        body:JSON.stringify({name,dialCode,phone})
      });
      const data=await verify.json().catch(()=>({}));
      if(!verify.ok) throw new Error(data.error||c().bad);

      const dl=await fetch(`/api/download-vcf?token=${encodeURIComponent(data.downloadToken||'')}`,{cache:'no-store'});
      if(!dl.ok){
        const err=await dl.json().catch(()=>({}));
        throw new Error(err.error||c().error);
      }

      const blob=await dl.blob();
      const disposition=String(dl.headers.get('Content-Disposition')||'');
      const match=disposition.match(/filename="?([^";]+)"?/i);
      const filename=match?.[1]||'DOBERTO-VCF.vcf';
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download=filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);

      if(msg){msg.textContent=c().ready;msg.className='msg show ok';}
      await loadStats();
    }catch(error){
      if(msg){msg.textContent=error?.message||c().error;msg.className='msg show err';}
      await loadStats();
    }finally{
      btn.disabled=!Boolean(lastStats?.unlocked);
      btn.textContent=c().button;
    }
  });

  document.getElementById('langSelect')?.addEventListener('change',()=>{
    if(lastStats)renderStats(lastStats);
  });

  loadStats();
  loadGoogleDownloadSession();
  window.addEventListener('pageshow',()=>loadGoogleDownloadSession());
})();
