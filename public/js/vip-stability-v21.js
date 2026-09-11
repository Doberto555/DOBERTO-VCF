(() => {
  'use strict';
  if (!document.body?.classList.contains('vip-page') || window.__DV_VIP_STABILITY_V21__) return;
  window.__DV_VIP_STABILITY_V21__=true;
  const message=document.getElementById('vipMessage');
  const select=document.getElementById('langSelect');
  const language=()=>['ht','fr','en'].includes(select?.value)?select.value:'ht';
  const copy={
    ht:'MonCash poko disponib. Konfigirasyon API sèvè a poko fini.',
    fr:'MonCash est momentanément indisponible. La configuration API du serveur doit être finalisée.',
    en:'MonCash is temporarily unavailable. The server API configuration still needs to be completed.'
  };
  function normalize(){
    if(!message || !message.classList.contains('show')) return;
    const text=(message.textContent||'').trim();
    if(/moncash.*(poko configure|not configured|pas configur|indisponible)/i.test(text)) message.textContent=copy[language()]||copy.ht;
  }
  if(message && 'MutationObserver' in window)new MutationObserver(normalize).observe(message,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
  select?.addEventListener('change',()=>setTimeout(normalize,0));
  normalize();
})();
