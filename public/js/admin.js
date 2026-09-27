(function loadDobertoBrand(){
  if(!document.querySelector('link[data-doberto-brand]')){
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='css/brand-v7.css?v=20260904-1';
    css.dataset.dobertoBrand='1';
    document.head.appendChild(css);
  }
  const icon=document.createElement('link');
  icon.rel='icon';
  icon.type='image/png';
  icon.href='icons/doberto-vcf-192.png?v=20260904-1';
  document.head.appendChild(icon);
})();

let adminToken = sessionStorage.getItem('doberto_admin_token') || null;
let aPage = 1, aTotalPages = 1, searchTerm = '';
let lastAdminData = null;

const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');

// ---------- Modal edit: konfigirasyon inisyal ----------
const editDial = document.getElementById('editDial');
COUNTRIES.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c.dial;
  opt.textContent = `${c.name} (+${c.dial})`;
  editDial.appendChild(opt);
});
enhancePhoneSelect('editDial');
fillIconSelect(document.getElementById('editIcon'), '');

function showAdminPanel() {
  loginPanel.style.display = 'none';
  adminPanel.style.display = 'block';
  ensureAdminPushPanel();
  renderAdminPushCopy();
  loadAdminList(1);
}

document.getElementById('loginBtn').addEventListener('click', async () => {
  const pw = document.getElementById('pw').value;
  const msg = document.getElementById('loginMsg');
  msg.className = 'msg';
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw })
    });
    const data = await res.json();
    if (!res.ok) {
      msg.textContent = errT(data, 'err_admin_password_incorrect');
      msg.className = 'msg show err';
      return;
    }
    adminToken = data.token;
    sessionStorage.setItem('doberto_admin_token', adminToken);
    showAdminPanel();
  } catch (e) {
    msg.textContent = t('err_no_connection');
    msg.className = 'msg show err';
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('doberto_admin_token');
  adminToken = null;
  adminPanel.style.display = 'none';
  loginPanel.style.display = 'block';
});

function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

async function loadAdminList(page) {
  const res = await fetch(`/api/admin/list?page=${page}&search=${encodeURIComponent(searchTerm)}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (res.status === 401) {
    document.getElementById('logoutBtn').click();
    return;
  }
  const data = await res.json();
  lastAdminData = data;
  aTotalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  aPage = page;
  renderAdminList();
}

function renderAdminList() {
  if (!lastAdminData) return;
  const body = document.getElementById('adminBody');
  body.innerHTML = '';
  lastAdminData.list.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><div class="name-cell"><span class="avatar">${initials(row.name)}</span>${escapeHtml(row.display_name || row.name)}${dobertoIconSvg(row.icon)}</div></td><td>${escapeHtml(row.email || '—')}</td><td>${escapeHtml(row.country_name || '—')}</td><td>+${row.full_number}</td><td><div class="row-actions"><button type="button" class="icon-btn edit-btn" data-edit="${row.id}" title="Modifye nimewo ak enfòmasyon">✎ Modifye</button><button type="button" class="icon-btn delete-btn" data-delete="${row.id}" title="Efase enskripsyon sa a">× Efase</button></div></td>`;
    body.appendChild(tr);
  });
  document.getElementById('aPageInfo').textContent = t('page_info', { page: aPage, total: aTotalPages, count: lastAdminData.total });
  const totalBadge = document.getElementById('adminTotalCount');
  if (totalBadge) totalBadge.textContent = `${Number(lastAdminData.total || 0).toLocaleString()} manm`;
  document.getElementById('aPrev').disabled = aPage <= 1;
  document.getElementById('aNext').disabled = aPage >= aTotalPages;

  body.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-edit')));
  });
  body.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteRegistration(btn.getAttribute('data-delete')));
  });
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
}

document.getElementById('aPrev').addEventListener('click', () => { if (aPage > 1) loadAdminList(aPage - 1); });
document.getElementById('aNext').addEventListener('click', () => { if (aPage < aTotalPages) loadAdminList(aPage + 1); });

let searchTimer;
document.getElementById('searchBox').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchTerm = e.target.value.trim();
    loadAdminList(1);
  }, 300);
});

document.getElementById('exportBtn').addEventListener('click', async () => {
  const btn = document.getElementById('exportBtn');
  const original = btn.textContent;
  btn.disabled = true;
  try {
    const res = await fetch('/api/admin/export-csv', { headers: { Authorization: `Bearer ${adminToken}` } });
    if (res.status === 401) { document.getElementById('logoutBtn').click(); return; }
    if (!res.ok) throw new Error('export_failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'doberto-vcf-admin-export.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (_) {
    alert(t('err_no_connection'));
  } finally {
    btn.disabled = false; btn.textContent = original;
  }
});

const ADMIN_PUSH_COPY = {
  ht: { kicker:'PUSH CENTER', title:'Voye notifikasyon bay manm yo', desc:'Voye yon alèt reyèl bay tout aparèy ki aktive notifikasyon DOBERTO VCF.', fieldTitle:'Tit', fieldMessage:'Mesaj', fieldUrl:'Lyen lè moun klike', send:'Voye notifikasyon', retry:'Relanse kanpay VCF pare', ok:'Notifikasyon an voye bay OneSignal.', retryOk:'Kanpay unlock la relanse.', error:'Notifikasyon an pa t voye. Verifye OneSignal sou Vercel.' },
  fr: { kicker:'CENTRE PUSH', title:'Envoyer une notification aux membres', desc:'Envoyez une vraie alerte aux appareils abonnés aux notifications DOBERTO VCF.', fieldTitle:'Titre', fieldMessage:'Message', fieldUrl:'Lien au clic', send:'Envoyer la notification', retry:'Relancer la campagne VCF disponible', ok:'Notification envoyée à OneSignal.', retryOk:'Campagne de déblocage relancée.', error:'Échec de l’envoi. Vérifiez OneSignal sur Vercel.' },
  en: { kicker:'PUSH CENTER', title:'Send a notification to members', desc:'Send a real alert to devices subscribed to DOBERTO VCF notifications.', fieldTitle:'Title', fieldMessage:'Message', fieldUrl:'Click URL', send:'Send notification', retry:'Retry VCF-ready campaign', ok:'Notification sent to OneSignal.', retryOk:'Unlock campaign retried.', error:'Notification failed. Check OneSignal on Vercel.' }
};
function adminUiLang(){ const el=document.getElementById('langSelect'); return el && ADMIN_PUSH_COPY[el.value] ? el.value : 'ht'; }
function adminPushText(){ return ADMIN_PUSH_COPY[adminUiLang()] || ADMIN_PUSH_COPY.ht; }

function ensureAdminPushPanel(){
  if(document.getElementById('adminPushPanel')) return;
  const exportBtn=document.getElementById('exportBtn');
  if(!exportBtn) return;
  const panel=document.createElement('section');
  panel.id='adminPushPanel'; panel.className='dv-admin-push';
  panel.innerHTML=`
    <div class="dv-admin-push-head"><div><span id="pushKicker"></span><h3 id="pushTitle"></h3><p id="pushDesc"></p></div><span class="dv-live-dot">LIVE</span></div>
    <div class="dv-push-grid"><label><span id="pushLabelTitle"></span><input id="pushTitleInput" maxlength="80" value="DOBERTO VCF"></label><label><span id="pushLabelUrl"></span><input id="pushUrlInput" maxlength="300" value="/"></label></div>
    <label><span id="pushLabelMessage"></span><textarea id="pushMessageInput" maxlength="220" rows="3" placeholder="DOBERTO VCF..."></textarea></label>
    <div class="dv-push-actions"><button type="button" id="pushSendBtn"></button><button type="button" class="secondary" id="pushRetryBtn"></button></div>
    <div class="msg" id="pushAdminMsg"></div>`;
  exportBtn.insertAdjacentElement('afterend',panel);
  document.getElementById('pushSendBtn').addEventListener('click',sendAdminPush);
  document.getElementById('pushRetryBtn').addEventListener('click',retryUnlockCampaign);
}

function renderAdminPushCopy(){
  ensureAdminPushPanel(); const c=adminPushText();
  const values={pushKicker:c.kicker,pushTitle:c.title,pushDesc:c.desc,pushLabelTitle:c.fieldTitle,pushLabelMessage:c.fieldMessage,pushLabelUrl:c.fieldUrl,pushSendBtn:c.send,pushRetryBtn:c.retry};
  Object.entries(values).forEach(([id,text])=>{const el=document.getElementById(id);if(el)el.textContent=text;});
}

async function sendAdminPush(){
  const c=adminPushText(); const msg=document.getElementById('pushAdminMsg'); const btn=document.getElementById('pushSendBtn');
  const title=document.getElementById('pushTitleInput').value.trim(); const message=document.getElementById('pushMessageInput').value.trim(); const url=document.getElementById('pushUrlInput').value.trim()||'/';
  if(!message){msg.textContent=c.error;msg.className='msg show err';return;}
  btn.disabled=true; msg.className='msg';
  try{
    const res=await fetch('/api/admin/push-send',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${adminToken}`},body:JSON.stringify({title,message,url})});
    const data=await res.json(); if(res.status===401){document.getElementById('logoutBtn').click();return;}
    if(!res.ok) throw new Error(data.error||'push_failed');
    msg.textContent=c.ok;msg.className='msg show ok';document.getElementById('pushMessageInput').value='';
  }catch(e){msg.textContent=(e&&e.message&&e.message!=='push_failed')?e.message:c.error;msg.className='msg show err';}
  finally{btn.disabled=false;}
}

async function retryUnlockCampaign(){
  const c=adminPushText(); const msg=document.getElementById('pushAdminMsg'); const btn=document.getElementById('pushRetryBtn'); btn.disabled=true; msg.className='msg';
  try{
    const res=await fetch('/api/admin/unlock-campaign/retry',{method:'POST',headers:{Authorization:`Bearer ${adminToken}`}}); const data=await res.json();
    if(res.status===401){document.getElementById('logoutBtn').click();return;} if(!res.ok) throw new Error(data.error||c.error);
    msg.textContent=c.retryOk;msg.className='msg show ok';
  }catch(e){msg.textContent=e.message||c.error;msg.className='msg show err';}finally{btn.disabled=false;}
}

function onLangChange() {
  renderAdminList();
  renderAdminPushCopy();
}

if (adminToken) showAdminPanel();

// ---------- Modifye yon moun ----------
const editOverlay = document.getElementById('editOverlay');
const editForm = document.getElementById('editForm');
const editMsg = document.getElementById('editMsg');

function findRowById(id) {
  if (!lastAdminData) return null;
  return lastAdminData.list.find(r => String(r.id) === String(id)) || null;
}

function openEditModal(id) {
  const row = findRowById(id);
  if (!row) return;

  editMsg.className = 'msg';
  document.getElementById('editId').value = row.id;
  document.getElementById('editName').value = row.name;
  document.getElementById('editPhone').value = row.phone || '';
  editDial.value = row.dial_code || '509';
  editDial.dispatchEvent(new Event('change'));
  fillIconSelect(document.getElementById('editIcon'), row.icon || '');

  editOverlay.hidden = false;
}

function closeEditModal() {
  editOverlay.hidden = true;
}

document.getElementById('editCancelBtn').addEventListener('click', closeEditModal);
editOverlay.addEventListener('click', (e) => {
  if (e.target === editOverlay) closeEditModal();
});

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  editMsg.className = 'msg';

  const id = document.getElementById('editId').value;
  const name = document.getElementById('editName').value.trim();
  const dialCode = editDial.value;
  const phone = document.getElementById('editPhone').value.replace(/\D/g, '');
  const icon = document.getElementById('editIcon').value;

  const saveBtn = document.getElementById('editSaveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = t('btn_saving');

  try {
    const res = await fetch(`/api/admin/update/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ name, dialCode, phone, icon })
    });
    const data = await res.json();
    if (res.status === 401) {
      document.getElementById('logoutBtn').click();
      return;
    }
    if (!res.ok) {
      editMsg.textContent = errT(data);
      editMsg.className = 'msg show err';
      return;
    }
    closeEditModal();
    loadAdminList(aPage);
  } catch (err) {
    editMsg.textContent = t('err_no_connection');
    editMsg.className = 'msg show err';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = t('btn_save');
  }
});

// ---------- Suprime yon moun ----------
async function deleteRegistration(id) {
  const row = findRowById(id);
  const name = row ? row.name : '';
  if (!confirm(t('confirm_delete', { name }))) return;

  try {
    const res = await fetch(`/api/admin/delete/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status === 401) {
      document.getElementById('logoutBtn').click();
      return;
    }
    if (!res.ok) {
      const data = await res.json();
      alert(errT(data));
      return;
    }
    loadAdminList(aPage);
  } catch (err) {
    alert(t('err_no_connection'));
  }
}
