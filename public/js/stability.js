(() => {
  'use strict';
  if (window.__DOBERTO_STABILITY_V34__) return;
  window.__DOBERTO_STABILITY_V34__ = true;

  const nativeAlert = window.alert.bind(window);

  function toast(message,type='info',duration=4200){
    const text=String(message||'').trim();
    if(!text)return;
    let host=document.querySelector('.dv-toast-host');
    if(!host){
      host=document.createElement('div');
      host.className='dv-toast-host';
      host.setAttribute('aria-live','polite');
      document.body.appendChild(host);
    }
    const item=document.createElement('div');
    item.className=`dv-toast${type==='error'?' is-error':type==='warning'?' is-warning':''}`;
    item.innerHTML='<span class="dv-toast-icon" aria-hidden="true">✓</span><div class="dv-toast-copy"></div><button type="button" class="dv-toast-close" aria-label="Close">×</button>';
    if(type==='error'||type==='warning')item.querySelector('.dv-toast-icon').textContent='!';
    item.querySelector('.dv-toast-copy').textContent=text;
    const remove=()=>{
      if(!item.isConnected)return;
      item.classList.add('is-leaving');
      setTimeout(()=>item.remove(),220);
    };
    item.querySelector('.dv-toast-close').addEventListener('click',remove);
    host.appendChild(item);
    setTimeout(remove,Math.max(1800,duration));
  }

  window.DobertoUI=Object.assign(window.DobertoUI||{},{toast});

  function labels(lang){
    if(lang==='fr')return {home:'Accueil',register:'Inscription',list:'Membres',offline:'Connexion interrompue'};
    if(lang==='en')return {home:'Home',register:'Register',list:'Members',offline:'Connection interrupted'};
    return {home:'Akèy',register:'Enskri',list:'Manm',offline:'Koneksyon koupe'};
  }

  const ICONS={
    home:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 10.4 12 3.5l8.5 6.9v9.1a1 1 0 0 1-1 1h-5.2v-6.1H9.7v6.1H4.5a1 1 0 0 1-1-1z"/></svg>',
    register:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.8 19.5c.5-3.1 2.3-5 5.2-5 1.4 0 2.6.4 3.5 1.2M17.5 10.5v7m-3.5-3.5h7"/></svg>',
    list:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="2.8"/><circle cx="16.5" cy="9" r="2.2"/><path d="M3.7 19c.5-3.4 2-5.3 4.3-5.3s3.8 1.9 4.3 5.3M13.7 15c.7-.8 1.6-1.2 2.8-1.2 2.1 0 3.4 1.6 3.8 4.4"/></svg>'
  };

  function ensureCriticalDockStyles(){
    if(document.getElementById('dv-critical-dock-style'))return;
    const style=document.createElement('style');
    style.id='dv-critical-dock-style';
    style.textContent=`
      .dv-mobile-dock{display:none!important}
      @media(max-width:680px){
        body.site-v10{padding-bottom:96px!important}
        .dv-mobile-dock{position:fixed!important;left:50%!important;bottom:max(12px,env(safe-area-inset-bottom))!important;z-index:999!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;width:min(360px,calc(100% - 28px))!important;padding:6px!important;transform:translateX(-50%)!important;border:1px solid rgba(255,255,255,.11)!important;border-radius:20px!important;background:rgba(8,12,17,.96)!important;box-shadow:0 18px 55px rgba(0,0,0,.46)!important;box-sizing:border-box!important}
        .dv-mobile-dock a{display:flex!important;min-width:0!important;min-height:54px!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;gap:4px!important;padding:4px!important;border-radius:14px!important;color:#778598!important;text-decoration:none!important;font-size:9px!important;font-weight:650!important;line-height:1.15!important;box-sizing:border-box!important}
        .dv-mobile-dock a svg{display:block!important;width:20px!important;height:20px!important;min-width:20px!important;max-width:20px!important;min-height:20px!important;max-height:20px!important;stroke:currentColor!important;stroke-width:1.8!important;fill:none!important;overflow:visible!important}
        .dv-mobile-dock a.active{color:#05130e!important;background:linear-gradient(135deg,#5ee6b8,#7cefd0)!important}
        .dv-mobile-dock a span{display:block!important;white-space:nowrap!important}
      }
    `;
    document.head.appendChild(style);
  }

  function section(){
    const p=location.pathname.replace(/\/$/,'')||'/';
    if(p==='/'||p==='/index'||p==='/index.html')return'home';
    if(p==='/register'||p==='/register.html')return'register';
    if(p==='/list'||p==='/list.html')return'list';
    return'';
  }

  function currentLang(){
    const s=document.getElementById('langSelect');
    if(s&&['ht','fr','en'].includes(s.value))return s.value;
    try{
      const v=localStorage.getItem('doberto_lang');
      if(['ht','fr','en'].includes(v))return v;
    }catch(_){}
    return'ht';
  }

  function setupDock(){
    if(!document.body.classList.contains('site-v10'))return;
    const active=section();
    if(!active)return;
    ensureCriticalDockStyles();
    let dock=document.querySelector('.dv-mobile-dock');
    if(!dock){
      dock=document.createElement('nav');
      dock.className='dv-mobile-dock';
      dock.setAttribute('aria-label','Mobile navigation');
      dock.innerHTML=`<a href="/" data-dock="home">${ICONS.home}<span></span></a><a href="/register.html" data-dock="register">${ICONS.register}<span></span></a><a href="/list.html" data-dock="list">${ICONS.list}<span></span></a>`;
      document.body.appendChild(dock);
    }
    const update=()=>{
      const c=labels(currentLang());
      dock.querySelector('[data-dock="home"] span').textContent=c.home;
      dock.querySelector('[data-dock="register"] span').textContent=c.register;
      dock.querySelector('[data-dock="list"] span').textContent=c.list;
      dock.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.dataset.dock===active));
    };
    update();
    document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(update,30));
    window.addEventListener('pageshow',update);
  }

  function setupNetwork(){
    if(!document.body.classList.contains('site-v10'))return;
    let el=document.querySelector('.dv-network-state');
    if(!el){
      el=document.createElement('div');
      el.className='dv-network-state';
      el.innerHTML='<i></i><span></span>';
      document.body.appendChild(el);
    }
    const update=()=>{
      document.documentElement.classList.toggle('is-offline',!navigator.onLine);
      el.querySelector('span').textContent=labels(currentLang()).offline;
    };
    update();
    window.addEventListener('online',update);
    window.addEventListener('offline',update);
    document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(update,30));
  }

  function setupHeader(){
    const h=document.querySelector('.topbar');
    if(!h)return;
    const update=()=>h.classList.toggle('is-scrolled',scrollY>18);
    update();
    addEventListener('scroll',update,{passive:true});
  }

  function setupSkeleton(){
    const body=document.getElementById('listBody');
    if(!body||body.children.length)return;
    body.innerHTML=Array.from({length:4},()=>'<tr class="dv-skeleton-row"><td><span class="dv-skeleton-line"></span></td><td><span class="dv-skeleton-line"></span></td></tr>').join('');
  }

  function setup(){
    if(document.body.classList.contains('site-v10')){
      window.alert=(m)=>toast(m,/erè|error|failed|expir|invalid|refus|connexion|koneksyon|connection/i.test(String(m||''))?'error':'info');
    }
    setupDock();
    setupNetwork();
    setupHeader();
    setupSkeleton();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();

  async function purgeLegacyRootCache(){
    try{
      if('caches'in window){
        const keys=await caches.keys();
        await Promise.all(keys.filter(k=>k.startsWith('doberto-vcf-')).map(k=>caches.delete(k)));
      }
    }catch(_){}
    try{
      if('serviceWorker'in navigator){
        const regs=await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(async reg=>{
          try{
            const active=reg.active||reg.waiting||reg.installing;
            const script=active?.scriptURL||'';
            const scopePath=new URL(reg.scope).pathname;
            if(scopePath==='/'||/\/sw\.js(?:\?|$)/.test(script))await reg.unregister();
          }catch(_){}
        }));
      }
    }catch(_){}
  }

  if('serviceWorker'in navigator||'caches'in window){
    window.addEventListener('load',()=>{
      purgeLegacyRootCache().then(()=>{
        try{
          const isRegister=/^\/register(?:\.html)?$/.test(location.pathname);
          const controlled=Boolean(navigator.serviceWorker?.controller);
          const already=sessionStorage.getItem('dv_auth_cache_purged')==='1';
          if(isRegister&&controlled&&!already){
            sessionStorage.setItem('dv_auth_cache_purged','1');
            location.replace('/register.html?fresh=1');
          }
        }catch(_){}
      });
    },{once:true});
    navigator.serviceWorker?.addEventListener?.('message',event=>{
      if(event.data?.type==='DOBERTO_ROOT_SW_RETIRED'){
        try{
          if(/^\/register(?:\.html)?$/.test(location.pathname)&&sessionStorage.getItem('dv_auth_cache_purged')!=='1'){
            sessionStorage.setItem('dv_auth_cache_purged','1');
            location.replace('/register.html?fresh=1');
          }
        }catch(_){}
      }
    });
  }

  window.__DOBERTO_NATIVE_ALERT__=nativeAlert;
})();