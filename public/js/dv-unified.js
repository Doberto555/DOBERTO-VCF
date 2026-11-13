/* mete dènye mo(yo) tit la an dore, menm lè lang lan chanje */
(function(){
  function accent(h){
    if(!h||h.querySelector('em.dv-a'))return;
    var w=h.textContent.trim().split(/\s+/);
    if(w.length<2)return;
    var n=w.length>3?2:1;
    h.textContent='';
    h.appendChild(document.createTextNode(w.slice(0,w.length-n).join(' ')+' '));
    var e=document.createElement('em');e.className='dv-a';e.textContent=w.slice(-n).join(' ');
    h.appendChild(e);
  }
  function boot(){
    var h=document.querySelector('.legal-page h1');
    if(!h)return;
    accent(h);
    new MutationObserver(function(){accent(h)}).observe(h,{childList:true,characterData:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
