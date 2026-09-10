(function loadDobertoBrand(){
  document.querySelectorAll('link[rel~="icon"]').forEach((el)=>el.remove());
  const icon=document.createElement('link');
  icon.rel='icon'; icon.type='image/png'; icon.href='icons/doberto-vcf-192.png?v=20260904-1';
  document.head.appendChild(icon);
})();

let currentPage=1;
let totalPages=1;
let lastListData=null;
let lastStats=null;
let publicSearch='';
let publicCountry='';

const LIST_COPY={
  ht:{filters:'Chèche manm',search:'Chèche yon moun pa non...',allCountries:'Tout peyi',empty:'Nou pa jwenn okenn manm pou rechèch sa a.',prev:'Anvan',next:'Apre',page:'Paj {page}/{total} · {count} manm'},
  fr:{filters:'Rechercher un membre',search:'Rechercher une personne par nom...',allCountries:'Tous les pays',empty:'Aucun membre ne correspond à cette recherche.',prev:'Précédent',next:'Suivant',page:'Page {page}/{total} · {count} membres'},
  en:{filters:'Find a member',search:'Search by name...',allCountries:'All countries',empty:'No members match this search.',prev:'Previous',next:'Next',page:'Page {page}/{total} · {count} members'}
};

const VCF_COPY={
  ht:{waitingTitle:'VCF la ap prepare otomatikman',waitingText:'Ou pa bezwen kreye ni telechaje anyen kounye a. Lè objektif la rive, sistèm nan ap fè VCF la disponib otomatikman.',readyTitle:'VCF la pare',readyText:'Sistèm nan deja prepare fichye a. Verifye enfòmasyon ou pou jwenn aksè.',waitingDesc:'Pa gen okenn aksyon pou fè kounye a. W ap jwenn aksè otomatikman lè objektif la rive.',readyDesc:'Sèvi ak menm non ak nimewo ou te itilize lè ou te enskri a.',button:'Jwenn VCF mwen'},
  fr:{waitingTitle:'Le VCF se prépare automatiquement',waitingText:'Vous n’avez rien à créer ni à télécharger pour le moment. Dès que l’objectif est atteint, le système rend le VCF disponible automatiquement.',readyTitle:'Votre VCF est prêt',readyText:'Le système a déjà préparé le fichier. Vérifiez vos informations pour y accéder.',waitingDesc:'Aucune action n’est nécessaire pour le moment. L’accès sera activé automatiquement lorsque l’objectif sera atteint.',readyDesc:'Utilisez le même nom et le même numéro que lors de votre inscription.',button:'Accéder à mon VCF'},
  en:{waitingTitle:'Your VCF is prepared automatically',waitingText:'There is nothing to create or download right now. Once the goal is reached, the system makes the VCF available automatically.',readyTitle:'Your VCF is ready',readyText:'The system has already prepared the file. Verify your details to access it.',waitingDesc:'No action is needed right now. Access will be enabled automatically when the goal is reached.',readyDesc:'Use the same name and number you registered with.',button:'Access my VCF'}
};

function listLang(){
  const select=document.getElementById('langSelect');
  return select && LIST_COPY[select.value] ? select.value : (window.currentLang || 'ht');
}
function listText(){return LIST_COPY[listLang()]||LIST_COPY.ht;}
function vcfText(){return VCF_COPY[listLang()]||VCF_COPY.ht;}
function fmt(str,vars){let out=str;Object.keys(vars||{}).forEach(k=>out=out.replace(`{${k}}`,vars[k]));return out;}

const dlDial=document.getElementById('dlDial');
if(dlDial && typeof COUNTRIES!=='undefined'){
  COUNTRIES.forEach(c=>{
    const opt=document.createElement('option');
    opt.value=c.dial; opt.textContent=`${c.name} (+${c.dial})`; dlDial.appendChild(opt);
  });
  dlDial.value='509';
  enhancePhoneSelect('dlDial');
}

function setupDirectoryFilters(){
  const search=document.getElementById('publicSearch');
  const country=document.getElementById('publicCountry');
  if(!search||!country) return;
  if(country.options.length<=1 && typeof COUNTRIES!=='undefined'){
    COUNTRIES.forEach(c=>{const option=document.createElement('option');option.value=`${c.name} (+${c.dial})`;option.textContent=`${c.name} (+${c.dial})`;country.appendChild(option);});
  }
  let timer;
  search.addEventListener('input',e=>{clearTimeout(timer);timer=setTimeout(()=>{publicSearch=e.target.value.trim();loadList(1);},250);});
  country.addEventListener('change',e=>{publicCountry=e.target.value;loadList(1);});
}

async function loadList(page){
  const qs=new URLSearchParams({page:String(page)});
  if(publicSearch) qs.set('search',publicSearch);
  if(publicCountry) qs.set('country',publicCountry);
  try{
    const res=await fetch(`/api/public-list?${qs.toString()}`,{cache:'no-store'});
    const data=await res.json();
    lastListData=data;
    currentPage=page;
    totalPages=Math.max(1,Math.ceil((data.total||0)/(data.pageSize||20)));
    renderList();
  }catch(_){
    const body=document.getElementById('listBody');
    if(body) body.innerHTML='<tr><td colspan="2"><div class="pro-empty">—</div></td></tr>';
  }
}

function initials(name){return (name||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

function renderList(){
  if(!lastListData) return;
  const body=document.getElementById('listBody');
  if(!body) return;
  body.innerHTML='';
  if(!lastListData.list||lastListData.list.length===0){
    body.innerHTML=`<tr><td colspan="2"><div class="pro-empty">${escapeHtml(listText().empty)}</div></td></tr>`;
  }else{
    lastListData.list.forEach(row=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td><div class="name-cell"><span class="avatar">${initials(row.name)}</span><span class="member-name">${escapeHtml(row.display_name||row.name)}</span>${typeof dobertoIconSvg==='function'?dobertoIconSvg(row.icon):''}</div></td><td>${escapeHtml(row.country_name||'—')}</td>`;
      body.appendChild(tr);
    });
  }
  const pageInfo=document.getElementById('pageInfo');
  if(pageInfo) pageInfo.textContent=fmt(listText().page,{page:currentPage,total:totalPages,count:lastListData.total||0});
  document.getElementById('prevBtn').disabled=currentPage<=1;
  document.getElementById('nextBtn').disabled=currentPage>=totalPages;
}

function applyDirectoryLanguage(){
  const c=listText();
  const filter=document.getElementById('filterTitle'); if(filter) filter.textContent=c.filters;
  const search=document.getElementById('publicSearch'); if(search) search.placeholder=c.search;
  const country=document.getElementById('publicCountry'); if(country&&country.options[0]) country.options[0].textContent=c.allCountries;
  const prev=document.getElementById('prevBtn'); if(prev) prev.textContent=c.prev;
  const next=document.getElementById('nextBtn'); if(next) next.textContent=c.next;
}

document.getElementById('prevBtn').addEventListener('click',()=>{if(currentPage>1)loadList(currentPage-1);});
document.getElementById('nextBtn').addEventListener('click',()=>{if(currentPage<totalPages)loadList(currentPage+1);});

function prefillMember(){
  try{
    const name=localStorage.getItem('dv_member_name')||'';
    const dial=localStorage.getItem('dv_member_dial')||'';
    const phone=localStorage.getItem('dv_member_phone')||'';
    const nameEl=document.getElementById('dlName');
    const phoneEl=document.getElementById('dlPhone');
    if(name&&nameEl&&!nameEl.value) nameEl.value=name;
    if(dial&&dlDial) dlDial.value=dial;
    if(phone&&phoneEl&&!phoneEl.value) phoneEl.value=phone;
  }catch(_){}
}

function renderVcfState(){
  const copy=vcfText();
  const title=document.getElementById('vcfAutoTitle');
  const text=document.getElementById('vcfAutoText');
  const desc=document.getElementById('dlDescText');
  const form=document.getElementById('dlForm');
  const btn=document.getElementById('dlBtn');
  const ready=!!(lastStats&&lastStats.unlocked);
  if(title) title.textContent=ready?copy.readyTitle:copy.waitingTitle;
  if(text) text.textContent=ready?copy.readyText:copy.waitingText;
  if(desc) desc.textContent=ready?copy.readyDesc:copy.waitingDesc;
  if(form) form.style.display=ready?'block':'none';
  if(btn) btn.textContent=copy.button;
  if(ready) prefillMember();
}

async function loadStatsForDesc(){
  try{
    const res=await fetch('/api/stats',{cache:'no-store'});
    lastStats=await res.json();
    renderVcfState();
  }catch(e){}
}

setupDirectoryFilters();
applyDirectoryLanguage();
loadList(1);
loadStatsForDesc();

function onLangChange(){applyDirectoryLanguage();renderList();renderVcfState();}

const dlForm=document.getElementById('dlForm');
const dlMsg=document.getElementById('dlMsg');
const dlBtn=document.getElementById('dlBtn');
if(dlForm) dlForm.addEventListener('submit',async(e)=>{
  e.preventDefault();
  dlMsg.className='msg';
  const name=document.getElementById('dlName').value.trim();
  const dialCode=dlDial.value;
  const phone=document.getElementById('dlPhone').value.replace(/\D/g,'');
  dlBtn.disabled=true;
  const original=dlBtn.textContent;
  dlBtn.textContent=listLang()==='fr'?'Vérification...':(listLang()==='en'?'Verifying...':'N ap verifye...');
  try{
    const res=await fetch('/api/verify-download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,dialCode,phone})});
    const data=await res.json();
    if(!res.ok){dlMsg.textContent=typeof errT==='function'?errT(data):(data.error||'Erreur');dlMsg.className='msg show err';}
    else{
      dlMsg.textContent=listLang()==='fr'?'Accès confirmé. Préparation du VCF...':(listLang()==='en'?'Access confirmed. Preparing your VCF...':'Aksè konfime. N ap prepare VCF ou...');
      dlMsg.className='msg show ok';
      window.location.href=`/api/download-vcf?token=${encodeURIComponent(data.downloadToken)}`;
    }
  }catch(err){dlMsg.textContent=typeof t==='function'?t('err_no_connection'):'Connection error';dlMsg.className='msg show err';}
  finally{dlBtn.disabled=false;dlBtn.textContent=original;}
});
