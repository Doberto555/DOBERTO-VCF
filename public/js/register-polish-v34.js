(() => {
  'use strict';
  if(window.__DV_REGISTER_POLISH_V34__)return;
  window.__DV_REGISTER_POLISH_V34__=true;

  function patchCopy(){
    const api=window.DVRegisterI18n;
    const ht=api?.copy?.ht;
    if(ht){
      Object.assign(ht,{
        navGroup:'Gwoup',s3:'Sync',doneText:'Ou deja enskri sou DOBERTO VCF. Konekte Google Contacts ou sou paj manm yo pou kontinye.',doneLink:'Sinkronize kontak yo',redirect:'N ap ouvri WhatsApp otomatikman…',side2:'Sinkronize kontak yo',side2d:'Lè enskripsyon an fini, konekte Google Contacts ou sou paj manm yo pou manm yo ajoute nan telefòn ou.',sideLink:'Ale sou paj manm yo',announce:'Mwen dakò pou DOBERTO VCF anonse non ak nimewo WhatsApp mwen nan gwoup ofisyèl la apre enskripsyon an.'
      });
      api.apply?.();
    }
  }

  function normalizeState(){
    const session=window.DobertoGoogle?.currentSession?.()||null;
    const gate=document.getElementById('googleAuthGate');
    const account=document.getElementById('googleAccountBar');
    const form=document.getElementById('regForm');
    const done=document.getElementById('registeredDone');
    if(!gate||!account||!form||!done)return;
    const hasUser=Boolean(session?.user);
    const registered=Boolean(hasUser&&session?.registered);
    const setHidden=(el,value)=>{if(el.hidden!==value)el.hidden=value};
    setHidden(gate,hasUser);
    setHidden(account,!hasUser);
    setHidden(form,!hasUser||registered);
    setHidden(done,!registered);
    document.body.classList.toggle('dv-registered',registered);
  }

  function run(){patchCopy();normalizeState();}
  function boot(){
    run();
    document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(run,0));
    window.addEventListener('pageshow',()=>setTimeout(run,30));
    [80,260,700,1400].forEach(ms=>setTimeout(run,ms));
    const root=document.querySelector('.registration-main');
    if(root&&'MutationObserver'in window){
      let queued=false;
      new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;normalizeState()},0)}).observe(root,{subtree:true,attributes:true,attributeFilter:['hidden']});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();