(() => {
  'use strict';
  if (window.__DV_ADMIN_CONTROL_CENTER_V28__) return;
  window.__DV_ADMIN_CONTROL_CENTER_V28__ = true;

  const COPY = {
    ht: {dashboard:'Rezime',registrations:'Enskripsyon',payments:'Peman',vip:'Manm VIP',push:'Notifikasyon',dashboardTitle:'Rezime administrasyon',registrationsTitle:'Tout moun ki enskri',paymentsTitle:'Jesyon peman VIP',vipTitle:'Manm VIP',pushTitle:'Sant notifikasyon'},
    fr: {dashboard:'Aperçu',registrations:'Inscriptions',payments:'Paiements',vip:'Membres VIP',push:'Notifications',dashboardTitle:'Vue d’ensemble',registrationsTitle:'Toutes les inscriptions',paymentsTitle:'Gestion des paiements VIP',vipTitle:'Membres VIP',pushTitle:'Centre de notifications'},
    en: {dashboard:'Overview',registrations:'Registrations',payments:'Payments',vip:'VIP members',push:'Notifications',dashboardTitle:'Admin overview',registrationsTitle:'All registrations',paymentsTitle:'VIP payment management',vipTitle:'VIP members',pushTitle:'Notification center'}
  };

  const VIEWS = [
    {id:'dashboard',icon:'01'},
    {id:'registrations',icon:'02'},
    {id:'payments',icon:'03'},
    {id:'vip',icon:'04'},
    {id:'push',icon:'05'}
  ];

  const lang = () => {
    const el=document.getElementById('langSelect');
    return el && COPY[el.value] ? el.value : 'ht';
  };
  const t = key => COPY[lang()]?.[key] || COPY.ht[key] || key;
  const panel = () => document.getElementById('adminPanel');

  function ensureNav(){
    const root=panel(); if(!root)return null;
    let nav=document.getElementById('adminViewBar');
    if(nav)return nav;
    nav=document.createElement('nav');
    nav.id='adminViewBar';
    nav.className='dv-admin-viewbar';
    nav.setAttribute('aria-label','Admin sections');
    nav.innerHTML=VIEWS.map(v=>`<button type="button" data-admin-view="${v.id}"><span class="dv-admin-view-icon">${v.icon}</span><span data-admin-view-label="${v.id}"></span></button>`).join('');
    const header=root.querySelector(':scope > .panel-header');
    if(header)header.insertAdjacentElement('afterend',nav); else root.prepend(nav);
    nav.addEventListener('click',e=>{const btn=e.target.closest('[data-admin-view]');if(btn)setView(btn.dataset.adminView,true);});
    return nav;
  }

  function registrationNodes(root){
    return [
      root.querySelector(':scope > .admin-tools'),
      root.querySelector(':scope > #searchBox'),
      root.querySelector(':scope > .table-scroll'),
      root.querySelector(':scope > .pager'),
      root.querySelector(':scope > #exportBtn')
    ].filter(Boolean);
  }

  function allContentNodes(root){
    const nodes=[...registrationNodes(root)];
    ['adminKpis','adminVipOverview','adminVipPanel','adminVipMembers','adminPushPanel'].forEach(id=>{const el=document.getElementById(id);if(el&&el.parentElement===root)nodes.push(el);});
    return [...new Set(nodes)];
  }

  function viewNodes(root,view){
    if(view==='registrations')return registrationNodes(root);
    if(view==='dashboard')return ['adminKpis','adminVipOverview'].map(id=>document.getElementById(id)).filter(el=>el&&el.parentElement===root);
    if(view==='payments'){const el=document.getElementById('adminVipPanel');return el?[el]:[];}
    if(view==='vip'){const el=document.getElementById('adminVipMembers');return el?[el]:[];}
    if(view==='push'){const el=document.getElementById('adminPushPanel');return el?[el]:[];}
    return registrationNodes(root);
  }

  function available(view){
    if(view==='registrations')return true;
    if(view==='dashboard')return !!(document.getElementById('adminVipOverview')||document.getElementById('adminKpis'));
    if(view==='payments')return !!document.getElementById('adminVipPanel');
    if(view==='vip')return !!document.getElementById('adminVipMembers');
    if(view==='push')return !!document.getElementById('adminPushPanel');
    return false;
  }

  function renderLabels(){
    const nav=ensureNav(); if(!nav)return;
    nav.querySelectorAll('[data-admin-view-label]').forEach(el=>{el.textContent=t(el.dataset.adminViewLabel);});
    const current=panel()?.dataset.adminView||'dashboard';
    const title=panel()?.querySelector(':scope > .panel-header h3');
    if(title)title.textContent=t(`${current}Title`);
  }

  function setView(view,remember=false){
    const root=panel(); const nav=ensureNav(); if(!root||!nav)return;
    if(!available(view))view='registrations';
    root.dataset.adminView=view;
    if(remember){try{sessionStorage.setItem('doberto_admin_view',view);}catch(_){}}

    const visible=new Set(viewNodes(root,view));
    allContentNodes(root).forEach(el=>{
      const show=visible.has(el);
      el.classList.toggle('dv-admin-view-hidden',!show);
      el.classList.toggle('dv-admin-view-content',show);
    });
    nav.querySelectorAll('[data-admin-view]').forEach(btn=>{
      const active=btn.dataset.adminView===view;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-current',active?'page':'false');
      btn.disabled=!available(btn.dataset.adminView);
    });
    const title=root.querySelector(':scope > .panel-header h3');
    if(title)title.textContent=t(`${view}Title`);
  }

  function refresh(){
    const root=panel(); if(!root)return;
    ensureNav(); renderLabels();
    let preferred='dashboard';
    try{preferred=sessionStorage.getItem('doberto_admin_view')||'dashboard';}catch(_){ }
    const current=root.dataset.adminView||preferred;
    setView(available(current)?current:(available('dashboard')?'dashboard':'registrations'));
  }

  function boot(){
    const root=panel(); if(!root)return;
    refresh();
    document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(()=>{renderLabels();setView(root.dataset.adminView||'dashboard');},0));
    if('MutationObserver'in window){
      const observer=new MutationObserver(()=>refresh());
      observer.observe(root,{childList:true});
    }
    window.addEventListener('pageshow',refresh);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
