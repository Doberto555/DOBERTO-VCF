(function(){
  'use strict';

  const TOKEN_KEY='dv_auth_token';
  const LEGACY_STATE_KEY='dv_google_oauth_state';
  const LOGIN_URL='/api/auth/google/url?flow=login&redirect=1';
  let session=null;
  let busy=false;

  function get(storage,key){try{return storage.getItem(key)||''}catch(_){return ''}}
  function set(storage,key,value){try{storage.setItem(key,value||'')}catch(_){}}
  function remove(storage,key){try{storage.removeItem(key)}catch(_){}}
  function token(){return get(localStorage,TOKEN_KEY)}
  function authHeaders(json=false){const h=json?{'Content-Type':'application/json'}:{};const t=token();if(t)h.Authorization=`Bearer ${t}`;return h}
  function lang(){const el=document.getElementById('langSelect');return el&&['ht','fr','en'].includes(el.value)?el.value:'ht'}
  function notify(text,type='info'){if(window.DobertoUI?.toast)window.DobertoUI.toast(text,type);else if(text)alert(text)}
  function clearOAuthQuery(){try{const u=new URL(location.href);['code','state','scope','authuser','prompt','hd','iss','error','error_description'].forEach(k=>u.searchParams.delete(k));history.replaceState({},'',u.pathname+u.search+u.hash)}catch(_){}}
  function clearLegacyState(){remove(sessionStorage,LEGACY_STATE_KEY);remove(localStorage,LEGACY_STATE_KEY)}
  function defaultLoginLabel(){
    try{const translated=window.DVRegisterI18n?.t?.('login');if(translated&&translated!=='login')return translated}catch(_){}
    return lang()==='fr'?'Continuer avec Google':lang()==='en'?'Continue with Google':'Kontinye ak Google';
  }

  function setButtonBusy(button,on){
    if(!button)return;
    const label=button.querySelector('[data-google-copy="login"]')||button.querySelector('span:last-child');
    if(label)label.textContent=on?(lang()==='fr'?'Connexion…':lang()==='en'?'Connecting…':'Koneksyon…'):defaultLoginLabel();
    button.classList.toggle('is-busy',on);
    button.setAttribute('aria-busy',on?'true':'false');
    if(button instanceof HTMLButtonElement)button.disabled=on;
    else button.removeAttribute('aria-disabled');
  }

  function resetLoginButton(){
    busy=false;
    const login=document.getElementById('googleLoginBtn');
    if(login instanceof HTMLAnchorElement)login.href=LOGIN_URL;
    setButtonBusy(login,false);
  }

  function prepareLogin(event){
    const login=event?.currentTarget||document.getElementById('googleLoginBtn');
    if(busy){event?.preventDefault();return}
    busy=true;
    clearLegacyState();
    setButtonBusy(login,true);
    try{location.assign(LOGIN_URL)}catch(_){location.href=LOGIN_URL}
  }

  async function finishLogin(code,state){
    // The signed OAuth state + HttpOnly browser nonce are verified server-side.
    const r=await fetch('/api/auth/google/callback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,state}),cache:'no-store'});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.token)throw new Error(d.error||'Koneksyon Google la pa t fini.');
    set(localStorage,TOKEN_KEY,d.token);
    clearLegacyState();
    clearOAuthQuery();
    session=d;
    if(d.registered){set(localStorage,'dv_registered','1');set(localStorage,'dv_member_name',d.registration?.name||d.user?.name||'');set(localStorage,'dv_member_dial',d.registration?.dial_code||'');set(localStorage,'dv_member_phone',d.registration?.phone||'')}
    return d;
  }

  async function loadSession(){if(!token()){session=null;return null}try{const r=await fetch('/api/auth/session',{headers:authHeaders(false),cache:'no-store'});if(!r.ok){remove(localStorage,TOKEN_KEY);session=null;return null}session=await r.json();if(session.registered){set(localStorage,'dv_registered','1');if(session.registration){set(localStorage,'dv_member_name',session.registration.name||'');set(localStorage,'dv_member_dial',session.registration.dial_code||'');set(localStorage,'dv_member_phone',session.registration.phone||'')}}return session}catch(_){return session}}

  function render(){
    const gate=document.getElementById('googleAuthGate');
    const account=document.getElementById('googleAccountBar');
    const form=document.getElementById('regForm');
    const done=document.getElementById('registeredDone');
    const already=document.getElementById('alreadyRegisteredLink');
    document.documentElement.classList.add('dv-register-resolved');
    document.body?.classList.add('dv-session-ready');
    if(!session?.user){document.body?.classList.remove('dv-registered');if(gate)gate.hidden=false;if(account)account.hidden=true;if(form)form.hidden=true;if(done)done.hidden=true;if(already?.parentElement)already.parentElement.hidden=false;return}
    if(gate)gate.hidden=true;if(account)account.hidden=false;if(already?.parentElement)already.parentElement.hidden=true;
    const avatar=document.getElementById('googleAvatar');if(avatar){avatar.src=session.user.avatarUrl||'icons/doberto-vcf-192.png';avatar.alt=session.user.name||'';avatar.onerror=()=>{avatar.onerror=null;avatar.src='icons/doberto-vcf-192.png'}}
    const name=document.getElementById('googleName'),email=document.getElementById('googleEmail');if(name)name.textContent=session.user.name||'';if(email)email.textContent=session.user.email||'';
    const nameInput=document.getElementById('name');if(nameInput&&!nameInput.value)nameInput.value=session.registration?.name||session.user.name||'';
    const registered=Boolean(session.registered);document.body?.classList.toggle('dv-registered',registered);if(form)form.hidden=registered;if(done)done.hidden=!registered;
    window.DVRegisterI18n?.apply?.();
    resetLoginButton();
  }

  function registrationCompleted(registration){session=session||{};session.registered=true;session.registration=registration||session.registration||null;set(localStorage,'dv_registered','1');render()}
  function logout(){remove(localStorage,TOKEN_KEY);remove(localStorage,'dv_registered');session=null;render()}

  async function boot(){
    const login=document.getElementById('googleLoginBtn');
    const logoutBtn=document.getElementById('googleLogoutBtn');
    if(login instanceof HTMLAnchorElement){
      // Native href only: never cancel/intercept the tap. This is the most reliable
      // Google Sign-In path on Android Chrome, WebView and installed PWA mode.
      login.href=LOGIN_URL;
    }else{
      login?.addEventListener('click',prepareLogin);
    }
    logoutBtn?.addEventListener('click',logout);
    clearLegacyState();
    const params=new URLSearchParams(location.search);
    if(params.get('error')){notify(params.get('error_description')||params.get('error'),'error');clearOAuthQuery()}
    if(params.get('code')&&params.get('state')){
      try{await finishLogin(params.get('code'),params.get('state'))}
      catch(e){notify(e?.message||'Koneksyon Google la pa t fini.','error');clearOAuthQuery()}
    }
    await loadSession();
    render();
    window.DVRegisterI18n?.updateFlow?.();
  }

  window.addEventListener('pageshow',()=>setTimeout(resetLoginButton,0));
  window.addEventListener('pagehide',()=>{busy=false});
  window.DobertoGoogle={authHeaders,registrationCompleted,currentSession:()=>session,loadSession,logout};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();