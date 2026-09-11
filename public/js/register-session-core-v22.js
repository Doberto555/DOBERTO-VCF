(() => {
  'use strict';
  if (window.__DV_REGISTER_SESSION_CORE_V22__) return;
  window.__DV_REGISTER_SESSION_CORE_V22__ = true;

  const TOKEN='dv_auth_token';
  const REGISTERED='dv_registered';
  const CONNECTED='dv_contacts_connected_v21';
  const get=(key)=>{try{return localStorage.getItem(key)||'';}catch(_){return '';}};
  const hasToken=()=>Boolean(get(TOKEN));
  const isRegistered=()=>get(REGISTERED)==='1';
  const wasConnected=()=>get(CONNECTED)==='1';

  if(hasToken()) document.documentElement.classList.add('dv-auth-hydrating');

  const style=document.createElement('style');
  style.id='dv-register-session-core-style';
  style.textContent=`
    html.dv-auth-hydrating #googleAuthGate,
    html.dv-auth-hydrating .already-member{display:none!important}
    html.dv-auth-hydrating.dv-known-registered #regForm{display:none!important}
  `;
  document.head.appendChild(style);
  if(hasToken()&&isRegistered()) document.documentElement.classList.add('dv-known-registered');

  let guarding=false;
  let lastGoodStatus='';
  const disconnectedRe=/(poko konekte|n[’']est pas encore connecté|is not connected yet)/i;
  const activateRe=/(activer google contacts|enable google contacts|aktive google contacts)/i;

  function currentLang(){
    const select=document.getElementById('langSelect');
    if(select&&['ht','fr','en'].includes(select.value)) return select.value;
    const saved=get('doberto_lang');
    return ['ht','fr','en'].includes(saved)?saved:'ht';
  }
  function reconnectText(){const l=currentLang();return l==='fr'?'Reconnecter Google Contacts':l==='en'?'Reconnect Google Contacts':'Rekonekte Google Contacts';}
  function refreshingText(){const l=currentLang();return l==='fr'?'Google Contacts connecté. Actualisation du statut…':l==='en'?'Google Contacts connected. Refreshing status…':'Google Contacts konekte. N ap mete estati a ajou…';}

  function guard(){
    if(guarding) return;
    guarding=true;
    try{
      const token=hasToken();
      document.documentElement.classList.toggle('dv-auth-hydrating',token);
      document.documentElement.classList.toggle('dv-known-registered',token&&isRegistered());
      if(!token) return;

      const gate=document.getElementById('googleAuthGate');
      const already=document.getElementById('alreadyRegisteredLink')?.parentElement;
      const form=document.getElementById('regForm');
      const account=document.getElementById('googleAccountBar');
      const sync=document.getElementById('googleSyncPanel');
      const autoWrap=document.getElementById('googleAutoSyncWrap');
      const status=document.getElementById('googleSyncStatus');
      const connect=document.getElementById('googleConnectBtn');

      if(gate) gate.hidden=true;
      if(already) already.hidden=true;
      if(isRegistered()&&form) form.hidden=true;

      const connectedNow=Boolean(autoWrap&&!autoWrap.hidden)||/reconnect|rekonekte/i.test(connect?.textContent||'');
      if(connectedNow){
        try{localStorage.setItem(CONNECTED,'1');}catch(_){}
        if(status?.textContent&&!disconnectedRe.test(status.textContent)) lastGoodStatus=status.textContent.trim();
      }

      if(isRegistered()&&wasConnected()&&sync&&!sync.hidden){
        if(autoWrap) autoWrap.hidden=false;
        if(connect&&activateRe.test(connect.textContent||'')) connect.textContent=reconnectText();
        if(status&&disconnectedRe.test(status.textContent||'')) status.textContent=lastGoodStatus||refreshingText();
      }

      if(account&&!account.hidden){
        const name=document.getElementById('googleName')?.textContent.trim();
        const email=document.getElementById('googleEmail')?.textContent.trim();
        if(name||email) account.dataset.dvSessionReady='1';
      }
    } finally { guarding=false; }
  }

  function start(){
    const saved=get('doberto_lang');
    const select=document.getElementById('langSelect');
    if(select&&['ht','fr','en'].includes(saved)&&select.value!==saved) select.value=saved;
    guard();
    if('MutationObserver' in window){
      const root=document.querySelector('.registration-main')||document.body;
      const observer=new MutationObserver(()=>queueMicrotask(guard));
      observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});
    }
    select?.addEventListener('change',()=>queueMicrotask(guard));
    window.addEventListener('pageshow',guard);
    window.addEventListener('focus',guard);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)guard();});
    [0,30,80,160,320,700,1400,2600,5000].forEach(ms=>setTimeout(guard,ms));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
