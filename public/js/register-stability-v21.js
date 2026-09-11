(() => {
  'use strict';
  if (!document.body?.classList.contains('register-page') || window.__DV_REGISTER_STABILITY_V21__) return;
  window.__DV_REGISTER_STABILITY_V21__ = true;

  const TOKEN='dv_auth_token', REGISTERED='dv_registered', CONNECTED='dv_contacts_connected_v21', LANG='doberto_lang';
  const $=id=>document.getElementById(id);
  const gate=$('googleAuthGate'), account=$('googleAccountBar'), form=$('regForm'), sync=$('googleSyncPanel');
  const already=$('alreadyRegisteredLink')?.parentElement, status=$('googleSyncStatus'), connect=$('googleConnectBtn'), autoWrap=$('googleAutoSyncWrap'), langSelect=$('langSelect');
  const startedAt=Date.now();
  let guarding=false, queued=false;

  const get=key=>{try{return localStorage.getItem(key)||''}catch(_){return ''}};
  const hasToken=()=>Boolean(get(TOKEN));
  const registered=()=>get(REGISTERED)==='1';
  const cachedConnected=()=>get(CONNECTED)==='1';
  const lang=()=>{
    const selected=langSelect?.value;
    if(['ht','fr','en'].includes(selected)) return selected;
    const saved=get(LANG);
    return ['ht','fr','en'].includes(saved)?saved:'ht';
  };
  const connectedCopy=()=>lang()==='fr'?'Google Contacts connecté. Actualisation du statut…':lang()==='en'?'Google Contacts connected. Refreshing status…':'Google Contacts konekte. N ap mete estati a ajou…';
  const reconnectCopy=()=>lang()==='fr'?'Reconnecter Google Contacts':lang()==='en'?'Reconnect Google Contacts':'Rekonekte Google Contacts';
  const disconnectedRe=/(poko konekte|n[’']est pas encore connecté|is not connected yet|activer google contacts|enable google contacts|aktive google contacts)/i;

  function primeLanguage(){
    const saved=get(LANG);
    if(langSelect && ['ht','fr','en'].includes(saved) && langSelect.value!==saved) langSelect.value=saved;
  }

  function protectConnectedGrace(){
    if(!hasToken() || !registered() || !cachedConnected()) return;
    if(Date.now()-startedAt>4500) return;
    if(sync) sync.hidden=false;
    if(autoWrap) autoWrap.hidden=false;
    if(status && (!status.textContent.trim() || disconnectedRe.test(status.textContent))) status.textContent=connectedCopy();
    if(connect && (!connect.textContent.trim() || disconnectedRe.test(connect.textContent))) connect.textContent=reconnectCopy();
  }

  function guard(){
    if(guarding) return;
    guarding=true;
    try{
      primeLanguage();
      const token=hasToken();
      document.documentElement.classList.toggle('dv-has-session',token);
      document.documentElement.classList.toggle('dv-registered-session',token&&registered());
      if(!token) return;

      if(gate) gate.hidden=true;
      if(already) already.hidden=true;
      if(registered() && form) form.hidden=true;
      protectConnectedGrace();

      if(account && account.dataset.dvHydrated==='1') account.hidden=false;
      if(account && !account.hidden && ($('googleName')?.textContent||'').trim()) account.dataset.dvHydrated='1';
    } finally { guarding=false; }
  }

  function queue(){
    if(queued) return;
    queued=true;
    queueMicrotask(()=>{queued=false;guard();});
  }

  primeLanguage();
  guard();

  if('MutationObserver' in window){
    const observer=new MutationObserver(queue);
    [gate,account,form,sync,already,status,connect,autoWrap].filter(Boolean).forEach(el=>observer.observe(el,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']}));
  }

  langSelect?.addEventListener('change',()=>setTimeout(guard,0));
  window.addEventListener('pageshow',guard);
  window.addEventListener('focus',guard);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)guard();});
  [40,100,220,500,900,1600,3000,4600].forEach(ms=>setTimeout(guard,ms));
})();
