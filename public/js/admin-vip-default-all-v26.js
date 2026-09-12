(() => {
  'use strict';
  if (window.__DV_ADMIN_VIP_DEFAULT_ALL_V26__) return;
  window.__DV_ADMIN_VIP_DEFAULT_ALL_V26__ = true;

  function applyDefault(){
    const root=document.getElementById('adminVipTabs');
    if(!root)return false;
    const all=root.querySelector('[data-vip-filter="all"]');
    if(!all)return false;

    if(root.firstElementChild!==all)root.prepend(all);
    if(!all.classList.contains('active'))all.click();
    return true;
  }

  function boot(){
    if(applyDefault())return;
    const target=document.getElementById('adminPanel')||document.body;
    if(!target||!('MutationObserver'in window))return;
    const observer=new MutationObserver(()=>{
      if(applyDefault())observer.disconnect();
    });
    observer.observe(target,{childList:true,subtree:true});
    setTimeout(()=>{applyDefault();observer.disconnect();},3000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
