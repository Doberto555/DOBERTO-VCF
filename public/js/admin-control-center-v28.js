(() => {
  'use strict';
  if (window.__DV_ADMIN_CONTROL_CENTER_V34__) return;
  window.__DV_ADMIN_CONTROL_CENTER_V34__ = true;

  const COPY = {
    ht:{dashboard:'Rezime',registrations:'Enskripsyon',community:'Gwoup',push:'Notifikasyon',system:'Sistèm',dashboardTitle:'Rezime administrasyon',registrationsTitle:'Tout moun ki enskri',communityTitle:'Jesyon gwoup WhatsApp',pushTitle:'Sant notifikasyon',systemTitle:'Sante sistèm nan'},
    fr:{dashboard:'Aperçu',registrations:'Inscriptions',community:'Groupe',push:'Notifications',system:'Système',dashboardTitle:'Vue d’ensemble',registrationsTitle:'Toutes les inscriptions',communityTitle:'Gestion du groupe WhatsApp',pushTitle:'Centre de notifications',systemTitle:'Santé du système'},
    en:{dashboard:'Overview',registrations:'Registrations',community:'Group',push:'Notifications',system:'System',dashboardTitle:'Admin overview',registrationsTitle:'All registrations',communityTitle:'WhatsApp group management',pushTitle:'Notification center',systemTitle:'System health'}
  };
  const VIEWS=[{id:'dashboard',icon:'01'},{id:'registrations',icon:'02'},{id:'community',icon:'03'},{id:'push',icon:'04'},{id:'system',icon:'05'}];
  const lang=()=>{const el=document.getElementById('langSelect');return el&&COPY[el.value]?el.value:'ht'};
  const t=key=>COPY[lang()]?.[key]||COPY.ht[key]||key;
  const panel=()=>document.getElementById('adminPanel');

  function ensureNav(){
    const root=panel();if(!root)return null;
    let nav=document.getElementById('adminViewBar');if(nav)return nav;
    nav=document.createElement('nav');nav.id='adminViewBar';nav.className='dv-admin-viewbar';nav.setAttribute('aria-label','Admin sections');
    nav.innerHTML=VIEWS.map(v=>`<button type="button" data-admin-view="${v.id}"><span class="dv-admin-view-icon">${v.icon}</span><span data-admin-view-label="${v.id}"></span></button>`).join('');
    const header=root.querySelector(':scope > .panel-header');if(header)header.insertAdjacentElement('afterend',nav);else root.prepend(nav);
    nav.addEventListener('click',e=>{const btn=e.target.closest('[data-admin-view]');if(btn)setView(btn.dataset.adminView,true)});
    return nav;
  }
  function registrationNodes(root){return [root.querySelector(':scope > .admin-tools'),root.querySelector(':scope > #searchBox'),root.querySelector(':scope > .table-scroll'),root.querySelector(':scope > .pager'),root.querySelector(':scope > #exportBtn')].filter(Boolean)}
  function allContentNodes(root){
    const nodes=[...registrationNodes(root)];
    ['adminDashboard','groupSettingPanel','adminPushPanel','adminSystemHealth'].forEach(id=>{const el=document.getElementById(id);if(el&&el.parentElement===root)nodes.push(el)});
    return [...new Set(nodes)];
  }
  function viewNodes(root,view){
    if(view==='dashboard'){const el=document.getElementById('adminDashboard');return el?[el]:[]}
    if(view==='registrations')return registrationNodes(root);
    if(view==='community'){const el=document.getElementById('groupSettingPanel');return el?[el]:[]}
    if(view==='push'){const el=document.getElementById('adminPushPanel');return el?[el]:[]}
    if(view==='system'){const el=document.getElementById('adminSystemHealth');return el?[el]:[]}
    return registrationNodes(root);
  }
  function available(view){
    if(view==='registrations')return true;
    if(view==='dashboard')return !!document.getElementById('adminDashboard');
    if(view==='community')return !!document.getElementById('groupSettingPanel');
    if(view==='push')return !!document.getElementById('adminPushPanel');
    if(view==='system')return !!document.getElementById('adminSystemHealth');
    return false;
  }
  function renderLabels(){
    const nav=ensureNav();if(!nav)return;
    nav.querySelectorAll('[data-admin-view-label]').forEach(el=>{el.textContent=t(el.dataset.adminViewLabel)});
    const current=panel()?.dataset.adminView||'dashboard';const title=panel()?.querySelector(':scope > .panel-header h3');if(title)title.textContent=t(`${current}Title`);
  }
  function setView(view,remember=false){
    const root=panel(),nav=ensureNav();if(!root||!nav)return;
    if(!available(view))view=available('dashboard')?'dashboard':'registrations';
    root.dataset.adminView=view;if(remember){try{sessionStorage.setItem('doberto_admin_view',view)}catch(_){}}
    const visible=new Set(viewNodes(root,view));
    allContentNodes(root).forEach(el=>{const show=visible.has(el);el.classList.toggle('dv-admin-view-hidden',!show);el.classList.toggle('dv-admin-view-content',show)});
    nav.querySelectorAll('[data-admin-view]').forEach(btn=>{const active=btn.dataset.adminView===view;btn.classList.toggle('active',active);btn.setAttribute('aria-current',active?'page':'false');btn.disabled=!available(btn.dataset.adminView)});
    const title=root.querySelector(':scope > .panel-header h3');if(title)title.textContent=t(`${view}Title`);
    if(view==='dashboard')window.DVAdminDashboard?.load?.();
  }
  function refresh(){
    const root=panel();if(!root)return;ensureNav();renderLabels();let preferred='dashboard';try{preferred=sessionStorage.getItem('doberto_admin_view')||'dashboard'}catch(_){}const current=root.dataset.adminView||preferred;setView(available(current)?current:(available('dashboard')?'dashboard':'registrations'));
  }
  function boot(){
    const root=panel();if(!root)return;refresh();document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(()=>{renderLabels();setView(root.dataset.adminView||'dashboard')},0));
    if('MutationObserver'in window)new MutationObserver(()=>refresh()).observe(root,{childList:true});
    window.addEventListener('pageshow',refresh);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();