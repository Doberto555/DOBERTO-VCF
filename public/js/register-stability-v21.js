(() => {
  'use strict';
  if (!document.body?.classList.contains('register-page') || window.__DV_REGISTER_STABILITY_V21__) return;
  window.__DV_REGISTER_STABILITY_V21__ = true;

  const TOKEN='dv_auth_token', REGISTERED='dv_registered', CONNECTED='dv_contacts_connected_v21';
  const $=id=>document.getElementById(id);
  const gate=$('googleAuthGate'), account=$('googleAccountBar'), form=$('regForm'), sync=$('googleSyncPanel');
  const already=$('alreadyRegisteredLink')?.parentElement, autoWrap=$('googleAutoSyncWrap');
  const status=$('googleSyncStatus'), connect=$('googleConnectBtn'), langSelect=$('langSelect');
  let seenAccount=Boolean(account && !account.hidden), seenSync=Boolean(sync && !sync.hidden);
  let guarding=false, queued=false;
  let knownConnected=false, lastConnectedStatus='';

  const get=(key)=>{try{return localStorage.getItem(key)||''}catch(_){return ''}};
  const set=(key,value)=>{try{localStorage.setItem(key,value)}catch(_){}};
  const hasToken=()=>Boolean(get(TOKEN));
  const registered=()=>get(REGISTERED)==='1';
  const lang=()=>['ht','fr','en'].includes(langSelect?.value)?langSelect.value:(['ht','fr','en'].includes(get('doberto_lang'))?get('doberto_lang'):'ht');
  const reconnectText=()=>lang()==='fr'?'Reconnecter Google Contacts':lang()==='en'?'Reconnect Google Contacts':'Rekonekte Google Contacts';
  const disconnectedRe=/(poko konekte|n[’']est pas encore connecté|is not connected yet|activer google contacts|enable google contacts|aktive google contacts)/i;

  function primeLanguage(){
    const saved=get('doberto_lang');
    if(langSelect && ['ht','fr','en'].includes(saved) && langSelect.value!==saved) langSelect.value=saved;
  }

  function snapshot(){
    if(!hasToken()) return;
    if(account && !account.hidden){seenAccount=true;account.dataset.dvStableSeen='1';}
    if(sync && !sync.hidden){seenSync=true;sync.dataset.dvStableSeen='1';}
    const connectedNow=Boolean(autoWrap && !autoWrap.hidden) || /reconnect|rekonekte/i.test(connect?.textContent||'');
    if(connectedNow){
      knownConnected=true;set(CONNECTED,'1');
      if(status?.textContent && !disconnectedRe.test(status.textContent)) lastConnectedStatus=status.textContent.trim();
    } else if(get(CONNECTED)==='1') knownConnected=true;
  }

  function restoreDynamicConnectedState(){
    if(!knownConnected || !registered() || !hasToken() || !sync || sync.hidden) return;
    if(autoWrap) autoWrap.hidden=false;
    if(connect && disconnectedRe.test(connect.textContent||'')) connect.textContent=reconnectText();
    if(status && disconnectedRe.test(status.textContent||'')){
      if(lastConnectedStatus) status.textContent=lastConnectedStatus;
      else status.textContent=lang()==='fr'?'Google Contacts connecté. Actualisation du statut…':lang()==='en'?'Google Contacts connected. Refreshing status…':'Google Contacts konekte. N ap mete estati a ajou…';
    }
  }

  function guard(){
    if(guarding) return;
    guarding=true;
    try{
      primeLanguage();
      snapshot();
      const token=hasToken();
      document.documentElement.classList.toggle('dv-has-session',token);
      document.documentElement.classList.toggle('dv-registered-session',token&&registered());
      if(!token) return;

      if(gate) gate.hidden=true;
      if(already) already.hidden=true;
      if(registered()){
        if(form) form.hidden=true;
        if(account && (seenAccount || account.dataset.dvStableSeen==='1' || $('googleName')?.textContent.trim())) account.hidden=false;
        if(sync && (seenSync || sync.dataset.dvStableSeen==='1')) sync.hidden=false;
      }
      restoreDynamicConnectedState();
    } finally { guarding=false; }
  }

  function queueGuard(){
    if(queued) return;queued=true;
    queueMicrotask(()=>{queued=false;guard();});
  }

  primeLanguage();
  snapshot();
  guard();

  if('MutationObserver' in window){
    const observer=new MutationObserver(queueGuard);
    [gate,account,form,sync,autoWrap,status,connect].filter(Boolean).forEach(el=>observer.observe(el,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']}));
  }

  langSelect?.addEventListener('change',()=>setTimeout(guard,0));
  window.addEventListener('pageshow',guard);
  window.addEventListener('focus',guard);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)guard();});
  [40,120,300,700,1400,2600].forEach(ms=>setTimeout(guard,ms));
})();
