(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const token=()=>sessionStorage.getItem('doberto_admin_token')||'';
  const msg=(text,ok=true)=>{const el=$('adsSettingMsg');if(!el)return;el.textContent=text;el.className='msg show '+(ok?'ok':'err');};
  function fill(a={}){
    $('adsMasterEnabled').checked=a.enabled===true;
    $('adsBannerEnabled').checked=a.bannerEnabled===true;$('adsBannerCode').value=a.bannerCode||'';
    $('adsNativeEnabled').checked=a.nativeEnabled===true;$('adsNativeCode').value=a.nativeCode||'';
    $('adsPopunderEnabled').checked=a.popunderEnabled===true;$('adsPopunderCode').value=a.popunderCode||'';
    $('adsSocialBarEnabled').checked=a.socialBarEnabled===true;$('adsSocialBarCode').value=a.socialBarCode||'';
    $('adsDirectLinkEnabled').checked=a.directLinkEnabled===true;$('adsDirectLinkUrl').value=a.directLinkUrl||'';$('adsDirectLinkLabel').value=a.directLinkLabel||'Sponsored';
  }
  function payload(){return{
    enabled:$('adsMasterEnabled').checked,
    bannerEnabled:$('adsBannerEnabled').checked,bannerCode:$('adsBannerCode').value,
    nativeEnabled:$('adsNativeEnabled').checked,nativeCode:$('adsNativeCode').value,
    popunderEnabled:$('adsPopunderEnabled').checked,popunderCode:$('adsPopunderCode').value,
    socialBarEnabled:$('adsSocialBarEnabled').checked,socialBarCode:$('adsSocialBarCode').value,
    directLinkEnabled:$('adsDirectLinkEnabled').checked,directLinkUrl:$('adsDirectLinkUrl').value.trim(),directLinkLabel:$('adsDirectLinkLabel').value.trim()
  }}
  async function load(){
    if(!token()||!$('adsSettingPanel'))return;
    try{const r=await fetch('/api/admin/ads',{headers:{Authorization:'Bearer '+token()},cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||'load');fill(d.ads||{});msg('Konfigirasyon pub yo chaje.');}catch(e){msg('Nou pa ka chaje pub yo.',false);}
  }
  async function save(){
    const b=$('saveAdsBtn');b.disabled=true;
    try{const r=await fetch('/api/admin/ads',{method:'PUT',headers:{Authorization:'Bearer '+token(),'Content-Type':'application/json'},body:JSON.stringify(payload())});const d=await r.json();if(!r.ok)throw new Error(d.error||'save');fill(d.ads||{});msg('Piblisite yo sove.');}catch(e){msg(e.message||'Nou pa ka sove pub yo.',false);}finally{b.disabled=false;}
  }
  document.addEventListener('DOMContentLoaded',()=>{$('saveAdsBtn')?.addEventListener('click',save);$('loginBtn')?.addEventListener('click',()=>setTimeout(load,450));load();});
})();