(() => {
  'use strict';
  if (window.__DV_ADMIN_DASHBOARD_V33__) return;
  window.__DV_ADMIN_DASHBOARD_V33__ = true;

  const COPY = {
    ht:{kicker:'CONTROL CENTER',title:'Rezime administrasyon',desc:'Yon sèl kote pou swiv aktivite DOBERTO VCF la.',total:'Total manm',today:'Nouvo jodi a',downloads:'Telechajman VCF',remaining:'Rete pou objektif',community:'Gwoup WhatsApp',bot:'Bot kominote',ready:'Aktif',missing:'Pa pare',recent:'Dènye enskripsyon yo',viewAll:'Wè tout enskripsyon',empty:'Poko gen enskripsyon.',refresh:'Rafrechi',error:'Nou pa ka chaje rezime admin lan kounye a.'},
    fr:{kicker:'CONTROL CENTER',title:'Vue d’ensemble',desc:'Un seul endroit pour suivre l’activité de DOBERTO VCF.',total:'Membres au total',today:'Nouveaux aujourd’hui',downloads:'Téléchargements VCF',remaining:'Restant avant objectif',community:'Groupe WhatsApp',bot:'Bot communauté',ready:'Actif',missing:'Non prêt',recent:'Dernières inscriptions',viewAll:'Voir toutes les inscriptions',empty:'Aucune inscription pour le moment.',refresh:'Actualiser',error:'Impossible de charger le tableau de bord pour le moment.'},
    en:{kicker:'CONTROL CENTER',title:'Admin overview',desc:'One place to monitor DOBERTO VCF activity.',total:'Total members',today:'New today',downloads:'VCF downloads',remaining:'Remaining to goal',community:'WhatsApp group',bot:'Community bot',ready:'Active',missing:'Not ready',recent:'Latest registrations',viewAll:'View all registrations',empty:'No registrations yet.',refresh:'Refresh',error:'The admin overview cannot be loaded right now.'}
  };

  let payload=null, loading=false;
  const lang=()=>{const el=document.getElementById('langSelect');return el&&COPY[el.value]?el.value:'ht'};
  const t=k=>COPY[lang()]?.[k]||COPY.ht[k]||k;
  const token=()=>{try{return sessionStorage.getItem('doberto_admin_token')||''}catch(_){return ''}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function ensure(){
    const root=document.getElementById('adminPanel');
    if(!root||document.getElementById('adminDashboard'))return;
    const section=document.createElement('section');
    section.id='adminDashboard';
    section.className='dv-admin-dashboard';
    section.innerHTML=`
      <div class="dv-dashboard-head"><div><span id="dashboardKicker"></span><h3 id="dashboardTitle"></h3><p id="dashboardDesc"></p></div><button type="button" class="secondary" id="dashboardRefresh"></button></div>
      <div class="dv-dashboard-kpis" id="dashboardKpis"></div>
      <div class="dv-dashboard-lower">
        <section class="dv-dashboard-recent"><div class="dv-dashboard-section-head"><h4 id="dashboardRecentTitle"></h4><button type="button" id="dashboardViewAll"></button></div><div id="dashboardRecentList"></div></section>
        <section class="dv-dashboard-status"><div class="dv-dashboard-section-head"><h4>Live status</h4></div><div id="dashboardStatusList"></div></section>
      </div>`;
    const bar=document.getElementById('adminViewBar');
    if(bar)bar.insertAdjacentElement('afterend',section); else root.querySelector('.panel-header')?.insertAdjacentElement('afterend',section);
    document.getElementById('dashboardRefresh')?.addEventListener('click',()=>load(true));
    document.getElementById('dashboardViewAll')?.addEventListener('click',()=>{
      const btn=document.querySelector('[data-admin-view="registrations"]');
      btn?.click();
    });
  }

  function kpi(label,value,sub=''){
    return `<article class="dv-dashboard-kpi"><span>${esc(label)}</span><strong>${esc(value)}</strong>${sub?`<small>${esc(sub)}</small>`:''}</article>`;
  }
  function stateRow(label,ok){return `<div class="dv-dashboard-state"><span>${esc(label)}</span><strong class="${ok?'ok':'warn'}"><i></i>${esc(ok?t('ready'):t('missing'))}</strong></div>`}

  function renderCopy(){
    ensure();
    const map={dashboardKicker:t('kicker'),dashboardTitle:t('title'),dashboardDesc:t('desc'),dashboardRefresh:t('refresh'),dashboardRecentTitle:t('recent'),dashboardViewAll:t('viewAll')};
    Object.entries(map).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.textContent=value});
    render();
  }

  function render(){
    ensure();
    const kpis=document.getElementById('dashboardKpis'),recent=document.getElementById('dashboardRecentList'),status=document.getElementById('dashboardStatusList');
    if(!kpis||!recent||!status)return;
    if(loading&&!payload){
      kpis.innerHTML=Array.from({length:4},()=>'<div class="dv-dashboard-skeleton"></div>').join('');
      recent.innerHTML='<div class="dv-dashboard-loading"></div><div class="dv-dashboard-loading"></div><div class="dv-dashboard-loading"></div>';
      status.innerHTML='<div class="dv-dashboard-loading"></div><div class="dv-dashboard-loading"></div>';
      return;
    }
    if(!payload){recent.innerHTML=`<div class="dv-dashboard-empty">${esc(t('error'))}</div>`;return;}
    const s=payload.stats||{}, c=payload.community||{}, rows=payload.list?.list||[];
    kpis.innerHTML=[
      kpi(t('total'),Number(s.total||0).toLocaleString()),
      kpi(t('today'),Number(s.today||0).toLocaleString()),
      kpi(t('downloads'),Number(s.downloadCount||0).toLocaleString()),
      kpi(t('remaining'),Number(s.remaining||0).toLocaleString())
    ].join('');
    recent.innerHTML=rows.length?rows.slice(0,5).map(row=>`<div class="dv-dashboard-member"><span class="dv-dashboard-avatar">${esc((row.name||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase())}</span><div><strong>${esc(row.display_name||row.name||'—')}</strong><small>${esc(row.country_name||'—')} · +${esc(row.full_number||'')}</small></div><time>${row.created_at?new Date(row.created_at).toLocaleDateString(lang()==='en'?'en-US':'fr-FR'):'—'}</time></div>`).join(''):`<div class="dv-dashboard-empty">${esc(t('empty'))}</div>`;
    status.innerHTML=stateRow(t('community'),Boolean(c.whatsappGroupUrl))+stateRow(t('bot'),Boolean(c.botConfigured));
  }

  async function load(force=false){
    ensure(); if(loading&&!force)return;
    const auth=token(),root=document.getElementById('adminPanel');
    if(!auth||!root||root.style.display==='none')return;
    loading=true;render();
    const headers={Authorization:`Bearer ${auth}`};
    try{
      const [statsRes,listRes,communityRes]=await Promise.all([
        fetch('/api/admin/stats',{headers,cache:'no-store'}),
        fetch('/api/admin/list?page=1',{headers,cache:'no-store'}),
        fetch('/api/admin/community/settings',{headers,cache:'no-store'})
      ]);
      if([statsRes,listRes,communityRes].some(r=>r.status===401)){document.getElementById('logoutBtn')?.click();return;}
      if(!statsRes.ok||!listRes.ok||!communityRes.ok)throw new Error('dashboard');
      payload={stats:await statsRes.json(),list:await listRes.json(),community:await communityRes.json()};
    }catch(_){payload=null}finally{loading=false;render()}
  }

  function boot(){
    ensure();renderCopy();
    const root=document.getElementById('adminPanel');
    if(root&&'MutationObserver'in window)new MutationObserver(()=>{if(root.style.display!=='none'&&token())load()}).observe(root,{attributes:true,attributeFilter:['style']});
    document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(renderCopy,0));
    window.addEventListener('pageshow',()=>{if(token())load()});
    if(root&&root.style.display!=='none'&&token())load();
  }
  window.DVAdminDashboard={load};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();