(() => {
  'use strict';
  if (!document.body?.classList.contains('register-page') || window.__DV_REGISTER_UI_V23__) return;
  window.__DV_REGISTER_UI_V23__ = true;

  const TOKEN='dv_auth_token', LANG='doberto_lang';
  const $=id=>document.getElementById(id);
  const loader=$('registerSessionLoader');
  const gate=$('googleAuthGate'), account=$('googleAccountBar'), form=$('regForm'), sync=$('googleSyncPanel');
  const select=$('langSelect');
  let resolved=false;

  const get=(key)=>{try{return localStorage.getItem(key)||'';}catch(_){return '';}};
  const hasToken=()=>Boolean(get(TOKEN));

  function applySavedLanguage(){
    const saved=get(LANG);
    if(select && ['ht','fr','en'].includes(saved) && select.value!==saved) select.value=saved;
    try{window.DVRegisterI18n?.apply?.();}catch(_){}
  }

  function finish(){
    if(resolved) return;
    resolved=true;
    document.documentElement.classList.add('dv-register-resolved');
    if(loader) loader.hidden=true;
    applySavedLanguage();
  }

  function reconcile(){
    applySavedLanguage();
    const token=hasToken();
    const session=window.DobertoGoogle?.currentSession?.() || null;

    if(!token){
      if(window.DobertoGoogle){
        if(gate) gate.hidden=false;
        if(account) account.hidden=true;
        if(form) form.hidden=true;
        if(sync) sync.hidden=true;
        finish();
      }
      return;
    }

    if(session?.user){
      if(gate) gate.hidden=true;
      if(account) account.hidden=false;
      if(session.registered){
        if(form) form.hidden=true;
        if(sync) sync.hidden=false;
      }else{
        if(form) form.hidden=false;
        if(sync) sync.hidden=true;
      }
      finish();
      return;
    }

    if(loader) loader.hidden=false;
  }

  select?.addEventListener('change',()=>setTimeout(()=>{try{window.DVRegisterI18n?.apply?.();}catch(_){}},0));
  window.addEventListener('pageshow',reconcile);
  window.addEventListener('online',reconcile);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)reconcile();});

  [0,60,140,300,600,1000,1800,3000,5000,8000,12000,18000].forEach(ms=>setTimeout(reconcile,ms));
})();
