(() => {
  'use strict';
  if(window.__DV_REGISTER_POLISH_V34__)return;
  window.__DV_REGISTER_POLISH_V34__=true;

  function patchCopy(){
    const api=window.DVRegisterI18n;
    const ht=api?.copy?.ht;
    if(ht){
      Object.assign(ht,{
        navGroup:'Gwoup',s3:'Gwoup',doneText:'Ou deja enskri sou DOBERTO VCF. Antre nan gwoup ofisyèl la pou kontinye.',doneLink:'Antre nan gwoup WhatsApp',redirect:'N ap ouvri WhatsApp otomatikman…',side2:'Antre nan gwoup la',side2d:'Lè enskripsyon an fini, sit la voye w dirèkteman sou envitasyon gwoup WhatsApp DOBERTO VCF la.',sideLink:'Ouvri gwoup WhatsApp',announce:'Mwen dakò pou DOBERTO VCF anonse non ak nimewo WhatsApp mwen nan gwoup ofisyèl la apre enskripsyon an.'
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
    gate.hidden=hasUser;
    account.hidden=!hasUser;
    form.hidden=!hasUser||registered;
    done.hidden=!registered;
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
      new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;normalizeState()})}).observe(root,{subtree:true,attributes:true,attributeFilter:['hidden']});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();