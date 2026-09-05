(function loadDobertoBrand(){
  const VERSION='20260904-1';
  if(!document.querySelector('link[data-doberto-brand]')){
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href=`css/brand-v7.css?v=${VERSION}`;
    css.dataset.dobertoBrand='1';
    document.head.appendChild(css);
  }
  document.querySelectorAll('link[rel~="icon"]').forEach((el)=>el.remove());
  const icon=document.createElement('link');
  icon.rel='icon';
  icon.type='image/png';
  icon.href=`icons/doberto-vcf-192.png?v=${VERSION}`;
  document.head.appendChild(icon);
})();

let currentPage = 1;
let totalPages = 1;
let lastListData = null;
let lastStats = null;
let publicSearch = '';
let publicCountry = '';

const LIST_COPY = {
  ht: {
    kicker: 'ANYÈ KONTAK',
    title: 'Moun ki deja enskri',
    desc: 'Chèche oswa filtre moun ki deja antre nan rezo DOBERTO VCF la.',
    filters: 'RECHÈCH AK FILTÈ',
    search: 'Chèche yon moun pa non...',
    allCountries: 'Tout peyi',
    empty: 'Pa gen okenn moun ki koresponn ak rechèch sa a.'
  },
  en: {
    kicker: 'MEMBER DIRECTORY',
    title: 'Registered members',
    desc: 'Search or filter people who have already joined the DOBERTO VCF network.',
    filters: 'SEARCH AND FILTER',
    search: 'Search people by name...',
    allCountries: 'All countries',
    empty: 'No members match this search.'
  },
  fr: {
    kicker: 'ANNUAIRE DES MEMBRES',
    title: 'Membres déjà inscrits',
    desc: 'Recherchez ou filtrez les personnes déjà inscrites sur le réseau DOBERTO VCF.',
    filters: 'RECHERCHE ET FILTRES',
    search: 'Rechercher une personne par nom...',
    allCountries: 'Tous les pays',
    empty: 'Aucun membre ne correspond à cette recherche.'
  }
};

function listLang(){
  const select=document.getElementById('langSelect');
  return select && LIST_COPY[select.value] ? select.value : (window.currentLang || 'ht');
}
function listText(){ return LIST_COPY[listLang()] || LIST_COPY.ht; }

const dlDial = document.getElementById('dlDial');
COUNTRIES.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c.dial;
  opt.textContent = `${c.name} (+${c.dial})`;
  dlDial.appendChild(opt);
});
dlDial.value = '509';
enhancePhoneSelect('dlDial');

function setupDirectoryFilters(){
  const search=document.getElementById('publicSearch');
  const country=document.getElementById('publicCountry');
  if(!search || !country) return;

  if(country.options.length <= 1){
    COUNTRIES.forEach((c)=>{
      const option=document.createElement('option');
      option.value=`${c.name} (+${c.dial})`;
      option.textContent=`${c.name} (+${c.dial})`;
      country.appendChild(option);
    });
  }

  let timer;
  search.addEventListener('input',(e)=>{
    clearTimeout(timer);
    timer=setTimeout(()=>{
      publicSearch=e.target.value.trim();
      loadList(1);
    },280);
  });
  country.addEventListener('change',(e)=>{
    publicCountry=e.target.value;
    loadList(1);
  });
}

async function loadList(page) {
  const qs=new URLSearchParams({ page:String(page) });
  if(publicSearch) qs.set('search',publicSearch);
  if(publicCountry) qs.set('country',publicCountry);

  try{
    const res = await fetch(`/api/public-list?${qs.toString()}`);
    const data = await res.json();
    lastListData = data;
    currentPage = page;
    totalPages = Math.max(1, Math.ceil((data.total || 0) / data.pageSize));
    renderList();
  }catch(_){
    const body=document.getElementById('listBody');
    if(body) body.innerHTML='<tr><td colspan="2"><div class="pro-empty">—</div></td></tr>';
  }
}

function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function renderList() {
  if (!lastListData) return;
  const body = document.getElementById('listBody');
  body.innerHTML = '';

  if(!lastListData.list || lastListData.list.length===0){
    body.innerHTML=`<tr><td colspan="2"><div class="pro-empty">${escapeHtml(listText().empty)}</div></td></tr>`;
  }else{
    lastListData.list.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><div class="name-cell"><span class="avatar">${initials(row.name)}</span><span class="member-name">${escapeHtml(row.display_name || row.name)}</span>${dobertoIconSvg(row.icon)}</div></td><td>${escapeHtml(row.country_name || '—')}</td>`;
      body.appendChild(tr);
    });
  }

  document.getElementById('pageInfo').textContent = t('page_info', { page: currentPage, total: totalPages, count: lastListData.total || 0 });
  document.getElementById('prevBtn').disabled = currentPage <= 1;
  document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function applyDirectoryLanguage(){
  const c=listText();
  const map={
    directoryKicker:c.kicker,
    directoryTitle:c.title,
    directoryDesc:c.desc,
    filterTitle:c.filters
  };
  Object.entries(map).forEach(([id,text])=>{
    const el=document.getElementById(id);
    if(el) el.textContent=text;
  });
  const search=document.getElementById('publicSearch');
  if(search) search.placeholder=c.search;
  const country=document.getElementById('publicCountry');
  if(country && country.options[0]) country.options[0].textContent=c.allCountries;
}

document.getElementById('prevBtn').addEventListener('click', () => { if (currentPage > 1) loadList(currentPage - 1); });
document.getElementById('nextBtn').addEventListener('click', () => { if (currentPage < totalPages) loadList(currentPage + 1); });

setupDirectoryFilters();
applyDirectoryLanguage();
loadList(1);

async function loadStatsForDesc() {
  try {
    const res = await fetch('/api/stats');
    lastStats = await res.json();
    renderDlDesc();
  } catch (e) { /* silans */ }
}
loadStatsForDesc();

function renderDlDesc() {
  const el = document.getElementById('dlDescText');
  if (!el) return;
  const min = lastStats ? lastStats.minRequired : 500;
  const max = lastStats ? lastStats.maxInFile : 50000;
  el.textContent = t('dl_desc', { min, max });
}

function onLangChange() {
  applyDirectoryLanguage();
  renderList();
  renderDlDesc();
}

// ---------- Download verification ----------
const dlForm = document.getElementById('dlForm');
const dlMsg = document.getElementById('dlMsg');
const dlBtn = document.getElementById('dlBtn');

dlForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  dlMsg.className = 'msg';
  const name = document.getElementById('dlName').value.trim();
  const dialCode = dlDial.value;
  const phone = document.getElementById('dlPhone').value.replace(/\D/g, '');

  dlBtn.disabled = true;
  dlBtn.textContent = t('btn_verifying');

  try {
    const res = await fetch('/api/verify-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, dialCode, phone })
    });
    const data = await res.json();
    if (!res.ok) {
      dlMsg.textContent = errT(data);
      dlMsg.className = 'msg show err';
    } else {
      dlMsg.textContent = t('msg_verified');
      dlMsg.className = 'msg show ok';
      window.location.href = `/api/download-vcf?token=${encodeURIComponent(data.downloadToken)}`;
    }
  } catch (err) {
    dlMsg.textContent = t('err_no_connection');
    dlMsg.className = 'msg show err';
  } finally {
    dlBtn.disabled = false;
    dlBtn.textContent = t('btn_verify');
  }
});
