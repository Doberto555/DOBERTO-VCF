(() => {
  'use strict';

  const AD_SRC='https://glamournakedemployee.com/4b/f7/87/4bf787015f8ad537ca8f372174da4959.js';
  const ALLOWED=new Set(['/','/index.html','/list.html','/community.html','/about.html','/mesi.html']);

  if(!ALLOWED.has(location.pathname)) return;

  // Never execute third-party advertising code on an authenticated browser.
  // The user session token currently lives in localStorage, so this keeps it
  // out of reach of the advertising script.
  try{
    if(localStorage.getItem('dv_auth_token')) return;
  }catch(_){}

  if(document.querySelector('script[data-dv-public-ad]')) return;

  const script=document.createElement('script');
  script.src=AD_SRC;
  script.async=true;
  script.dataset.dvPublicAd='1';
  script.referrerPolicy='strict-origin-when-cross-origin';
  document.body.appendChild(script);
})();
