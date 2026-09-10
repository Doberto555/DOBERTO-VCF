(() => {
  'use strict';
  if (window.__DOBERTO_STABILITY_V18__) return;
  window.__DOBERTO_STABILITY_V18__ = true;

  const nativeFetch = window.fetch.bind(window);
  const nativeAlert = window.alert.bind(window);
  const RETRYABLE = new Set([502,503,504]);
  const sleep = (ms) => new Promise(r => setTimeout(r,ms));

  function meta(input,init){
    try{
      const raw=typeof input==='string'||input instanceof URL?input:input.url;
      const url=new URL(raw,location.href);
      const method=String(init?.method||input?.method||'GET').toUpperCase();
      return {url,method,api:url.origin===location.origin&&url.pathname.startsWith('/api/')};
    }catch(_){return {url:null,method:'GET',api:false};}
  }
  async function timedFetch(input,init,timeout){
    if(init?.signal)return nativeFetch(input,init);
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeout);
    try{return await nativeFetch(input,{...(init||{}),signal:controller.signal});}
    finally{clearTimeout(timer);}
  }
  window.fetch=async function(input,init){
    const m=meta(input,init);
    if(!m.api)return nativeFetch(input,init);
    const safe=m.method==='GET'||m.method==='HEAD';
    const attempts=safe?2:1;
    let last;
    for(let i=0;i<attempts;i++){
      try{
        const res=await timedFetch(input,init,safe?14000:22000);
        if(safe&&i+1<attempts&&RETRYABLE.has(res.status)){await sleep(350);continue;}
        return res;
      }catch(e){last=e;if(!safe||i+1>=attempts)throw e;await sleep(350);}
    }
    throw last||new Error('Network request failed');
  };

  function loadCss(href,key){
    if(document.querySelector(`link[data-${key}]`))return;
    const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.setAttribute(`data-${key}`,'1');document.head.appendChild(link);
  }
  function loadScript(src,key){
    if(document.querySelector(`script[data-${key}]`))return;
    const script=document.createElement('script');script.src=src;script.defer=true;script.setAttribute(`data-${key}`,'1');document.head.appendChild(script);
  }
  loadCss('/css/site-v15.css?v=20260910-5','dv-v15');
  loadCss('/css/site-v16.css?v=20260910-5','dv-v16');
  loadCss('/css/polish-v18.css?v=20260910-1','dv-v18');
  loadScript('/js/ui-l10n-v18.js?v=20260910-1','dv-l10n-v18');

  function toast(message,type='info',duration=4200){
    const text=String(message||'').trim();if(!text)return;
    let host=document.querySelector('.dv-toast-host');
    if(!host){host=document.createElement('div');host.className='dv-toast-host';host.setAttribute('aria-live','polite');document.body.appendChild(host);}
    const item=document.createElement('div');item.className=`dv-toast${type==='error'?' is-error':type==='warning'?' is-warning':''}`;
    item.innerHTML='<span class="dv-toast-icon" aria-hidden="true">✓</span><div class="dv-toast-copy"></div><button type="button" class="dv-toast-close" aria-label="Close">×</button>';
    if(type==='error'||type==='warning')item.querySelector('.dv-toast-icon').textContent='!';
    item.querySelector('.dv-toast-copy').textContent=text;
    const remove=()=>{if(!item.isConnected)return;item.classList.add('is-leaving');setTimeout(()=>item.remove(),220);};
    item.querySelector('.dv-toast-close').addEventListener('click',remove);host.appendChild(item);setTimeout(remove,Math.max(1800,duration));
  }
  window.DobertoUI=Object.assign(window.DobertoUI||{},{toast});

  function labels(lang){
    if(lang==='fr')return {home:'Accueil',register:'Inscription',list:'Membres',offline:'Connexion interrompue'};
    if(lang==='en')return {home:'Home',register:'Register',list:'Members',offline:'Connection interrupted'};
    return {home:'Akèy',register:'Enskri',list:'Manm',offline:'Koneksyon koupe'};
  }
  const ICONS={
    home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.4 12 3.5l8.5 6.9v9.1a1 1 0 0 1-1 1h-5.2v-6.1H9.7v6.1H4.5a1 1 0 0 1-1-1z"/></svg>',
    register:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.8 19.5c.5-3.1 2.3-5 5.2-5 1.4 0 2.6.4 3.5 1.2M17.5 10.5v7m-3.5-3.5h7"/></svg>',
    list:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="2.8"/><circle cx="16.5" cy="9" r="2.2"/><path d="M3.7 19c.5-3.4 2-5.3 4.3-5.3s3.8 1.9 4.3 5.3M13.7 15c.7-.8 1.6-1.2 2.8-1.2 2.1 0 3.4 1.6 3.8 4.4"/></svg>'
  };
  function section(){const p=location.pathname.replace(/\/$/,'')||'/';if(p==='/'||p==='/index'||p==='/index.html')return'home';if(p==='/register'||p==='/register.html')return'register';if(p==='/list'||p==='/list.html')return'list';return'';}
  function currentLang(){const s=document.getElementById('langSelect');if(s&&['ht','fr','en'].includes(s.value))return s.value;try{const v=localStorage.getItem('doberto_lang');if(['ht','fr','en'].includes(v))return v;}catch(_){}return'ht';}
  function setupDock(){
    if(!document.body.classList.contains('site-v10'))return;const active=section();if(!active)return;
    let dock=document.querySelector('.dv-mobile-dock');
    if(!dock){dock=document.createElement('nav');dock.className='dv-mobile-dock';dock.setAttribute('aria-label','Mobile navigation');dock.innerHTML=`<a href="/" data-dock="home">${ICONS.home}<span></span></a><a href="/register.html" data-dock="register">${ICONS.register}<span></span></a><a href="/list.html" data-dock="list">${ICONS.list}<span></span></a>`;document.body.appendChild(dock);}
    const update=()=>{const c=labels(currentLang());dock.querySelector('[data-dock="home"] span').textContent=c.home;dock.querySelector('[data-dock="register"] span').textContent=c.register;dock.querySelector('[data-dock="list"] span').textContent=c.list;dock.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.dataset.dock===active));};
    update();document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(update,30));window.addEventListener('pageshow',update);
  }
  function setupNetwork(){
    if(!document.body.classList.contains('site-v10'))return;let el=document.querySelector('.dv-network-state');if(!el){el=document.createElement('div');el.className='dv-network-state';el.innerHTML='<i></i><span></span>';document.body.appendChild(el);}
    const update=()=>{document.documentElement.classList.toggle('is-offline',!navigator.onLine);el.querySelector('span').textContent=labels(currentLang()).offline;};
    update();window.addEventListener('online',update);window.addEventListener('offline',update);document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(update,30));
  }
  function setupHeader(){const h=document.querySelector('.topbar');if(!h)return;const update=()=>h.classList.toggle('is-scrolled',scrollY>18);update();addEventListener('scroll',update,{passive:true});}
  function setupSkeleton(){const body=document.getElementById('listBody');if(!body||body.children.length)return;body.innerHTML=Array.from({length:4},()=>'<tr class="dv-skeleton-row"><td><span class="dv-skeleton-line"></span></td><td><span class="dv-skeleton-line"></span></td></tr>').join('');}
  function setup(){
    if(document.body.classList.contains('site-v10'))window.alert=(m)=>toast(m,/erè|error|failed|expir|invalid|refus/i.test(String(m||''))?'error':'info');
    setupDock();setupNetwork();setupHeader();setupSkeleton();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();

  if('serviceWorker'in navigator){window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('/sw.js?v=20260910-5',{updateViaCache:'none'});reg.update().catch(()=>{});}catch(_){}},{once:true});}
  window.__DOBERTO_NATIVE_ALERT__=nativeAlert;
})();
