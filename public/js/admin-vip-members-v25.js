(() => {
  'use strict';
  if (window.__DV_ADMIN_VIP_MEMBERS_V25__) return;
  window.__DV_ADMIN_VIP_MEMBERS_V25__ = true;

  const COPY = {
    ht:{kicker:'VIP MEMBERS',title:'Manm VIP',desc:'Swiv plan VIP, dat ekspirasyon ak eta Google Contacts pou chak manm.',refresh:'Rafrechi',search:'Chèche pa non oswa email…',all:'Tout',active:'Aktif',lifetime:'À vie',expiring:'Pral ekspire',expired:'Ekspire',contacts:'Google Contacts',sync:'Auto-sync',connected:'Konekte',notConnected:'Pa konekte',enabled:'Aktif',disabled:'Dezaktive',syncError:'Erè sync',days:'jou rete',started:'Kòmanse',expires:'Ekspire',page:'Paj {page}/{total}',prev:'Anvan',next:'Apre',empty:'Pa gen manm VIP ki koresponn ak filtè sa a.',error:'Nou pa ka chaje manm VIP yo kounye a.'},
    fr:{kicker:'MEMBRES VIP',title:'Membres VIP',desc:'Suivez la formule VIP, l’expiration et l’état Google Contacts de chaque membre.',refresh:'Actualiser',search:'Rechercher par nom ou e-mail…',all:'Tous',active:'Actifs',lifetime:'À vie',expiring:'Expire bientôt',expired:'Expirés',contacts:'Google Contacts',sync:'Synchronisation auto',connected:'Connecté',notConnected:'Non connecté',enabled:'Active',disabled:'Désactivée',syncError:'Erreur sync',days:'jours restants',started:'Début',expires:'Expire',page:'Page {page}/{total}',prev:'Précédent',next:'Suivant',empty:'Aucun membre VIP ne correspond à ce filtre.',error:'Impossible de charger les membres VIP pour le moment.'},
    en:{kicker:'VIP MEMBERS',title:'VIP members',desc:'Track each member’s VIP plan, expiry date and Google Contacts status.',refresh:'Refresh',search:'Search by name or email…',all:'All',active:'Active',lifetime:'Lifetime',expiring:'Expiring soon',expired:'Expired',contacts:'Google Contacts',sync:'Auto-sync',connected:'Connected',notConnected:'Not connected',enabled:'Enabled',disabled:'Disabled',syncError:'Sync error',days:'days left',started:'Started',expires:'Expires',page:'Page {page}/{total}',prev:'Previous',next:'Next',empty:'No VIP members match this filter.',error:'VIP members cannot be loaded right now.'}
  };

  let members=[];
  let filter='all';
  let search='';
  let page=1;
  let totalPages=1;
  let loading=false;
  let searchTimer=null;
  let refreshTimer=null;

  const lang=()=>{const el=document.getElementById('langSelect');return el&&COPY[el.value]?el.value:'ht';};
  const t=key=>COPY[lang()]?.[key]||COPY.ht[key]||key;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const token=()=>{try{return sessionStorage.getItem('doberto_admin_token')||'';}catch(_){return '';}};
  const planName=code=>({ht:{monthly:'1 mwa',quarterly:'3 mwa',yearly:'1 an',lifetime:'À vie'},fr:{monthly:'1 mois',quarterly:'3 mois',yearly:'1 an',lifetime:'À vie'},en:{monthly:'1 month',quarterly:'3 months',yearly:'1 year',lifetime:'Lifetime'}})[lang()]?.[code]||code||'—';

  function initials(name,email){const src=(name||email||'?').trim();return src.split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();}
  function date(value){if(!value)return '—';try{return new Date(value).toLocaleDateString(lang()==='en'?'en-US':'fr-FR',{year:'numeric',month:'short',day:'numeric'});}catch(_){return value;}}
  function stateLabel(state){return ({active:t('active'),lifetime:t('lifetime'),expiring:t('expiring'),expired:t('expired')})[state]||state;}

  function ensurePanel(){
    if(document.getElementById('adminVipMembers')) return;
    const admin=document.getElementById('adminPanel'); if(!admin)return;
    const panel=document.createElement('section'); panel.id='adminVipMembers'; panel.className='dv-vip-members';
    panel.innerHTML=`
      <div class="dv-vip-members-head"><div><span id="vipMembersKicker" class="dv-vip-members-kicker"></span><h3 id="vipMembersTitle"></h3><p id="vipMembersDesc"></p></div><button type="button" id="vipMembersRefresh" class="secondary"></button></div>
      <div class="dv-vip-members-controls">
        <div class="dv-vip-members-search"><input id="vipMembersSearch" type="search" autocomplete="off"><button type="button" id="vipMembersClear" aria-label="Clear">×</button></div>
        <div id="vipMembersTabs" class="dv-vip-members-tabs">
          <button type="button" data-member-filter="all" class="active"></button><button type="button" data-member-filter="active"></button><button type="button" data-member-filter="lifetime"></button><button type="button" data-member-filter="expiring"></button><button type="button" data-member-filter="expired"></button>
        </div>
      </div>
      <div id="vipMembersList" class="dv-vip-members-list"><div class="dv-vip-member-skeleton"></div><div class="dv-vip-member-skeleton"></div></div>
      <div class="dv-vip-members-pager"><button type="button" id="vipMembersPrev" class="secondary"></button><span id="vipMembersPage"></span><button type="button" id="vipMembersNext" class="secondary"></button></div>`;
    const overview=document.getElementById('adminVipOverview');
    const payment=document.getElementById('adminVipPanel');
    if(overview) overview.insertAdjacentElement('afterend',panel); else if(payment) payment.insertAdjacentElement('beforebegin',panel); else admin.appendChild(panel);
    document.getElementById('vipMembersRefresh')?.addEventListener('click',()=>load(true));
    document.getElementById('vipMembersClear')?.addEventListener('click',()=>{const input=document.getElementById('vipMembersSearch');if(input)input.value='';search='';page=1;load(true);});
    document.getElementById('vipMembersSearch')?.addEventListener('input',e=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{search=e.target.value.trim();page=1;load(true);},350);});
    document.getElementById('vipMembersPrev')?.addEventListener('click',()=>{if(page>1){page--;load(true);}});
    document.getElementById('vipMembersNext')?.addEventListener('click',()=>{if(page<totalPages){page++;load(true);}});
    panel.querySelectorAll('[data-member-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.memberFilter;page=1;renderTabs();load(true);}));
    renderCopy();
  }

  function renderCopy(){
    ensurePanel();
    const map={vipMembersKicker:t('kicker'),vipMembersTitle:t('title'),vipMembersDesc:t('desc'),vipMembersRefresh:t('refresh'),vipMembersPrev:t('prev'),vipMembersNext:t('next')};
    Object.entries(map).forEach(([id,text])=>{const el=document.getElementById(id);if(el)el.textContent=text;});
    const input=document.getElementById('vipMembersSearch'); if(input)input.placeholder=t('search');
    renderTabs(); render();
  }

  function renderTabs(){
    const root=document.getElementById('vipMembersTabs'); if(!root)return;
    const labels={all:t('all'),active:t('active'),lifetime:t('lifetime'),expiring:t('expiring'),expired:t('expired')};
    root.querySelectorAll('[data-member-filter]').forEach(btn=>{btn.textContent=labels[btn.dataset.memberFilter]||btn.dataset.memberFilter;btn.classList.toggle('active',btn.dataset.memberFilter===filter);});
  }

  function syncChip(label,value,kind='off'){return `<div class="dv-vip-sync-chip ${kind}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;}

  function render(){
    const root=document.getElementById('vipMembersList'); if(!root||loading)return;
    const pageText=document.getElementById('vipMembersPage');
    const prev=document.getElementById('vipMembersPrev'); const next=document.getElementById('vipMembersNext');
    if(pageText) pageText.textContent=t('page').replace('{page}',page).replace('{total}',totalPages);
    if(prev) prev.disabled=page<=1; if(next) next.disabled=page>=totalPages;
    if(!members.length){root.innerHTML=`<div class="dv-vip-members-empty">${esc(t('empty'))}</div>`;return;}
    root.innerHTML=members.map(m=>{
      const avatar=m.avatarUrl?`<img src="${esc(m.avatarUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:esc(initials(m.displayName,m.email));
      const expiry=m.state==='lifetime'?t('lifetime'):`${date(m.vipExpiresAt)}${Number.isFinite(Number(m.daysRemaining))?` · ${Number(m.daysRemaining)} ${t('days')}`:''}`;
      const contacts=m.contactsConnected?t('connected'):t('notConnected');
      const contactsKind=m.contactsConnected?'ok':'off';
      const sync=m.hasSyncError?t('syncError'):(m.autoSync?t('enabled'):t('disabled'));
      const syncKind=m.hasSyncError?'warn':(m.autoSync?'ok':'off');
      return `<article class="dv-vip-member">
        <div class="dv-vip-member-user"><div class="dv-vip-member-avatar">${avatar}</div><div class="dv-vip-member-user-text"><strong>${esc(m.displayName||'—')}</strong><span>${esc(m.email||'—')}</span></div></div>
        <div class="dv-vip-member-plan"><span class="dv-vip-member-state ${esc(m.state)}">${esc(stateLabel(m.state))}</span><strong>VIP ${esc(planName(m.planCode))}</strong><span>${esc(t('started'))}: ${esc(date(m.vipStartedAt))}</span><span>${esc(t('expires'))}: ${esc(expiry)}</span></div>
        <div class="dv-vip-member-sync">${syncChip(t('contacts'),contacts,contactsKind)}${syncChip(t('sync'),sync,syncKind)}</div>
      </article>`;
    }).join('');
  }

  async function load(force=false){
    ensurePanel(); if(loading&&!force)return;
    const auth=token(); const admin=document.getElementById('adminPanel'); if(!auth||!admin||admin.style.display==='none')return;
    loading=true; const root=document.getElementById('vipMembersList'); if(root)root.innerHTML='<div class="dv-vip-member-skeleton"></div><div class="dv-vip-member-skeleton"></div>';
    try{
      const qs=new URLSearchParams({page:String(page),pageSize:'20',filter,search});
      const res=await fetch(`/api/admin/vip/members?${qs.toString()}`,{headers:{Authorization:`Bearer ${auth}`},cache:'no-store'});
      const data=await res.json().catch(()=>({}));
      if(res.status===401){document.getElementById('logoutBtn')?.click();return;}
      if(!res.ok)throw new Error(data.error||t('error'));
      members=Array.isArray(data.members)?data.members:[]; page=Number(data.page||1); totalPages=Math.max(1,Number(data.totalPages||1));
    }catch(e){members=[];totalPages=1;if(root)root.innerHTML=`<div class="dv-vip-members-error">${esc(e.message||t('error'))}</div>`;}
    finally{loading=false;render();}
  }

  function boot(){
    ensurePanel(); const admin=document.getElementById('adminPanel');
    if(admin&&'MutationObserver'in window)new MutationObserver(()=>{if(admin.style.display!=='none'&&token())load();}).observe(admin,{attributes:true,attributeFilter:['style']});
    document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(renderCopy,0));
    window.addEventListener('pageshow',()=>{if(token())load();});
    clearInterval(refreshTimer);refreshTimer=setInterval(()=>{if(document.getElementById('adminPanel')?.style.display!=='none'&&token())load();},60000);
    if(admin&&admin.style.display!=='none'&&token())load();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
