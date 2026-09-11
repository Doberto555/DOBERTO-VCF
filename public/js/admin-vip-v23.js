(() => {
  'use strict';
  if (window.__DV_ADMIN_VIP_V24__) return;
  window.__DV_ADMIN_VIP_V24__ = true;

  const COPY = {
    ht: {
      kicker:'VIP PAYMENT CENTER', title:'Jesyon peman VIP',
      desc:'Swiv peman MonCash otomatik yo epi revize demann NatCash ak Binance yo nan menm kote a.',
      refresh:'Rafrechi', review:'Pou verifye', moncash:'MonCash', success:'Siksè', failed:'Echèk', all:'Tout',
      empty:'Pa gen okenn peman nan kategori sa a.', amount:'Montan', reference:'Referans', user:'Itilizatè', date:'Dat', details:'Detay',
      approve:'Apwouve', reject:'Rejte', reviewing:'N ap trete…',
      approveConfirm:'Konfime peman sa a epi aktive VIP pou itilizatè a?', rejectConfirm:'Rejte demann peman sa a?',
      approvedOk:'Peman an apwouve. VIP aktive.', rejectedOk:'Peman an rejte.',
      loadError:'Nou pa ka chaje istwa peman VIP yo kounye a.', actionError:'Aksyon an pa t fèt.',
      pending:'An atant', approved:'Apwouve', rejected:'Rejte', created:'Kreye', redirected:'Redirije', paid:'Peye', expired:'Ekspire', failedStatus:'Echwe',
      noNote:'Pa gen nòt', order:'Order ID', transaction:'Transaction ID'
    },
    fr: {
      kicker:'CENTRE DE PAIEMENTS VIP', title:'Gestion des paiements VIP',
      desc:'Suivez les paiements MonCash automatiques et vérifiez les demandes NatCash et Binance au même endroit.',
      refresh:'Actualiser', review:'À vérifier', moncash:'MonCash', success:'Réussis', failed:'Échecs', all:'Tous',
      empty:'Aucun paiement dans cette catégorie.', amount:'Montant', reference:'Référence', user:'Utilisateur', date:'Date', details:'Détails',
      approve:'Approuver', reject:'Rejeter', reviewing:'Traitement…',
      approveConfirm:'Confirmer ce paiement et activer le VIP pour cet utilisateur ?', rejectConfirm:'Rejeter cette demande de paiement ?',
      approvedOk:'Paiement approuvé. VIP activé.', rejectedOk:'Paiement rejeté.',
      loadError:'Impossible de charger l’historique des paiements VIP.', actionError:'Action impossible.',
      pending:'En attente', approved:'Approuvé', rejected:'Rejeté', created:'Créé', redirected:'Redirigé', paid:'Payé', expired:'Expiré', failedStatus:'Échec',
      noNote:'Aucune note', order:'ID commande', transaction:'ID transaction'
    },
    en: {
      kicker:'VIP PAYMENT CENTER', title:'VIP payment management',
      desc:'Track automatic MonCash payments and review NatCash and Binance requests in one place.',
      refresh:'Refresh', review:'Needs review', moncash:'MonCash', success:'Successful', failed:'Failed', all:'All',
      empty:'No payments in this category.', amount:'Amount', reference:'Reference', user:'User', date:'Date', details:'Details',
      approve:'Approve', reject:'Reject', reviewing:'Processing…',
      approveConfirm:'Confirm this payment and activate VIP for this user?', rejectConfirm:'Reject this payment request?',
      approvedOk:'Payment approved. VIP activated.', rejectedOk:'Payment rejected.',
      loadError:'VIP payment history cannot be loaded right now.', actionError:'Action failed.',
      pending:'Pending', approved:'Approved', rejected:'Rejected', created:'Created', redirected:'Redirected', paid:'Paid', expired:'Expired', failedStatus:'Failed',
      noNote:'No note', order:'Order ID', transaction:'Transaction ID'
    }
  };

  let requests=[];
  let counts={review:0,moncash:0,success:0,failed:0,total:0};
  let filter='review';
  let loading=false;
  let timer=null;

  const lang=()=>{const s=document.getElementById('langSelect');return s&&COPY[s.value]?s.value:'ht';};
  const t=key=>COPY[lang()]?.[key]||COPY.ht[key]||key;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const planName=code=>({ht:{monthly:'1 mwa',quarterly:'3 mwa',yearly:'1 an',lifetime:'À vie'},fr:{monthly:'1 mois',quarterly:'3 mois',yearly:'1 an',lifetime:'À vie'},en:{monthly:'1 month',quarterly:'3 months',yearly:'1 year',lifetime:'Lifetime'}})[lang()]?.[code]||code||'—';
  const token=()=>{try{return adminToken||sessionStorage.getItem('doberto_admin_token')||'';}catch(_){return '';}};

  function ensurePanel(){
    if(document.getElementById('adminVipPanel'))return;
    const admin=document.getElementById('adminPanel'); if(!admin)return;
    const panel=document.createElement('section'); panel.id='adminVipPanel'; panel.className='dv-admin-vip';
    panel.innerHTML=`
      <div class="dv-admin-vip-head">
        <div><span id="adminVipKicker" class="dv-admin-vip-kicker"></span><h3 id="adminVipTitle"></h3><p id="adminVipDesc"></p></div>
        <div class="dv-admin-vip-head-actions"><span id="adminVipPendingCount" class="dv-admin-vip-count">0</span><button type="button" id="adminVipRefresh" class="secondary"></button></div>
      </div>
      <div class="dv-admin-vip-tabs" id="adminVipTabs">
        <button type="button" data-vip-filter="review" class="active"></button>
        <button type="button" data-vip-filter="moncash"></button>
        <button type="button" data-vip-filter="success"></button>
        <button type="button" data-vip-filter="failed"></button>
        <button type="button" data-vip-filter="all"></button>
      </div>
      <div id="adminVipMessage" class="msg"></div>
      <div id="adminVipList" class="dv-admin-vip-list"><div class="dv-admin-vip-loading"></div><div class="dv-admin-vip-loading"></div></div>`;
    const exportBtn=document.getElementById('exportBtn'); if(exportBtn)exportBtn.insertAdjacentElement('afterend',panel); else admin.appendChild(panel);
    document.getElementById('adminVipRefresh')?.addEventListener('click',()=>load(true));
    panel.querySelectorAll('[data-vip-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.vipFilter;renderTabs();renderList();}));
    renderCopy();
  }

  function renderCopy(){
    ensurePanel();
    const map={adminVipKicker:t('kicker'),adminVipTitle:t('title'),adminVipDesc:t('desc'),adminVipRefresh:t('refresh')};
    Object.entries(map).forEach(([id,text])=>{const el=document.getElementById(id);if(el)el.textContent=text;});
    renderTabs(); renderList();
  }

  function renderTabs(){
    const root=document.getElementById('adminVipTabs'); if(!root)return;
    const labels={review:`${t('review')} (${counts.review||0})`,moncash:`${t('moncash')} (${counts.moncash||0})`,success:`${t('success')} (${counts.success||0})`,failed:`${t('failed')} (${counts.failed||0})`,all:`${t('all')} (${counts.total||0})`};
    root.querySelectorAll('[data-vip-filter]').forEach(btn=>{btn.textContent=labels[btn.dataset.vipFilter]||btn.dataset.vipFilter;btn.classList.toggle('active',btn.dataset.vipFilter===filter);});
    const count=document.getElementById('adminVipPendingCount'); if(count){count.textContent=String(counts.review||0);count.title=t('review');}
  }

  function setMessage(text,error=false,ok=false){const el=document.getElementById('adminVipMessage');if(!el)return;el.textContent=text||'';el.className=`msg${text?' show':''}${error?' err':''}${ok?' ok':''}`;}
  function formatDate(value){if(!value)return '—';try{return new Date(value).toLocaleString(lang()==='en'?'en-US':'fr-FR',{dateStyle:'medium',timeStyle:'short'});}catch(_){return value;}}
  function statusLabel(r){const map={pending:'pending',approved:'approved',rejected:'rejected',created:'created',redirected:'redirected',paid:'paid',expired:'expired',failed:'failedStatus'};return t(map[r.status]||r.status);}
  function visibleRows(){
    return requests.filter(r=>{
      if(filter==='all')return true;
      if(filter==='review')return r.source==='manual'&&r.status==='pending';
      if(filter==='moncash')return r.source==='moncash';
      if(filter==='success')return (r.source==='manual'&&r.status==='approved')||(r.source==='moncash'&&r.status==='paid');
      if(filter==='failed')return (r.source==='manual'&&r.status==='rejected')||(r.source==='moncash'&&['failed','expired'].includes(r.status));
      return true;
    });
  }

  function detailText(r){
    if(r.source==='moncash'){
      const parts=[]; if(r.orderId)parts.push(`${t('order')}: ${r.orderId}`); if(r.transactionId)parts.push(`${t('transaction')}: ${r.transactionId}`);
      return parts.join(' · ')||'—';
    }
    return r.note||t('noNote');
  }

  function renderList(){
    const root=document.getElementById('adminVipList'); if(!root||loading)return;
    const visible=visibleRows(); renderTabs();
    if(!visible.length){root.innerHTML=`<div class="dv-admin-vip-empty">${esc(t('empty'))}</div>`;return;}
    root.innerHTML=visible.map(r=>{
      const manualPending=r.source==='manual'&&r.status==='pending';
      const user=[r.userName,r.userEmail].filter(Boolean).join(' · ')||r.userId||'—';
      const ref=r.reference||r.transaction_ref||r.transactionId||r.orderId||'—';
      return `<article class="dv-admin-vip-card" data-vip-request="${esc(r.id)}">
        <div class="dv-admin-vip-card-top">
          <div><strong>${esc(String(r.method||'').toUpperCase())}</strong><span>VIP ${esc(planName(r.plan_code))}${r.source==='moncash'?' · AUTO':''}</span></div>
          <span class="dv-admin-vip-status ${esc(r.status)}">${esc(statusLabel(r))}</span>
        </div>
        <div class="dv-admin-vip-grid">
          <div><span>${esc(t('amount'))}</span><strong>${esc(Number(r.amount||0).toLocaleString(lang()==='en'?'en-US':'fr-FR',{maximumFractionDigits:2}))} ${esc(r.currency||'')}</strong></div>
          <div><span>${esc(t('reference'))}</span><strong class="mono">${esc(ref)}</strong></div>
          <div><span>${esc(t('user'))}</span><strong>${esc(user)}</strong></div>
          <div><span>${esc(t('date'))}</span><strong>${esc(formatDate(r.paidAt||r.created_at))}</strong></div>
          <div class="dv-admin-vip-wide"><span>${esc(t('details'))}</span><strong>${esc(detailText(r))}</strong></div>
        </div>
        ${manualPending?`<div class="dv-admin-vip-actions"><button type="button" class="dv-vip-approve" data-vip-action="approve" data-vip-id="${esc(r.id)}">${esc(t('approve'))}</button><button type="button" class="secondary dv-vip-reject" data-vip-action="reject" data-vip-id="${esc(r.id)}">${esc(t('reject'))}</button></div>`:''}
      </article>`;
    }).join('');
    root.querySelectorAll('[data-vip-action]').forEach(btn=>btn.addEventListener('click',()=>review(btn.dataset.vipId,btn.dataset.vipAction,btn)));
  }

  async function load(force=false){
    ensurePanel(); if(loading&&!force)return;
    const auth=token(),panel=document.getElementById('adminPanel'); if(!auth||!panel||panel.style.display==='none')return;
    loading=true; const root=document.getElementById('adminVipList'); if(root)root.innerHTML='<div class="dv-admin-vip-loading"></div><div class="dv-admin-vip-loading"></div>'; setMessage('');
    try{
      const res=await fetch('/api/admin/vip/payments',{headers:{Authorization:`Bearer ${auth}`},cache:'no-store'}); const data=await res.json().catch(()=>({}));
      if(res.status===401){document.getElementById('logoutBtn')?.click();return;} if(!res.ok)throw new Error(data.error||t('loadError'));
      requests=Array.isArray(data.requests)?data.requests:[]; counts=data.counts||{review:0,moncash:0,success:0,failed:0,total:requests.length};
    }catch(e){requests=[];counts={review:0,moncash:0,success:0,failed:0,total:0};setMessage(e.message||t('loadError'),true);}finally{loading=false;renderList();}
  }

  async function review(id,action,button){
    if(!confirm(action==='approve'?t('approveConfirm'):t('rejectConfirm')))return;
    const auth=token(); if(!auth)return; const original=button.textContent; button.disabled=true; button.textContent=t('reviewing'); setMessage('');
    try{
      const res=await fetch('/api/admin/vip/payments',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${auth}`},body:JSON.stringify({id,action})}); const data=await res.json().catch(()=>({}));
      if(res.status===401){document.getElementById('logoutBtn')?.click();return;} if(!res.ok)throw new Error(data.error||t('actionError'));
      setMessage(action==='approve'?t('approvedOk'):t('rejectedOk'),false,true); await load(true);
    }catch(e){setMessage(e.message||t('actionError'),true);button.disabled=false;button.textContent=original;}
  }

  function schedule(){clearInterval(timer);timer=setInterval(()=>{const panel=document.getElementById('adminPanel');if(panel&&panel.style.display!=='none'&&token())load();},30000);}
  function boot(){
    ensurePanel(); const panel=document.getElementById('adminPanel'); if(panel&&panel.style.display!=='none'&&token())load();
    if(panel&&'MutationObserver'in window)new MutationObserver(()=>{if(panel.style.display!=='none'&&token())load();}).observe(panel,{attributes:true,attributeFilter:['style']});
    document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(renderCopy,0)); window.addEventListener('pageshow',()=>{if(token())load();}); schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
