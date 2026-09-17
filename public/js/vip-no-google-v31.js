(()=>{
  'use strict';
  const copy={
    ht:{heroTitle:'Estati VIP. Plis avantaj.',heroDesc:'Chwazi plan VIP ou pou jwenn estati VIP ak avantaj eksklizif sou DOBERTO VCF.',b1:'Estati VIP',b1d:'Kont ou montre kòm VIP pandan plan ou aktif.',b2:'Aksè eksklizif',b2d:'Jwenn avantaj ak fonksyon ki rezève pou manm VIP.',b3:'Peman an sekirite',b3d:'MonCash verifye otomatikman. NatCash sèvi ak referans tranzaksyon.',standard:'Ou sou plan Standard.',confirmed:'Peman konfime. VIP ou aktif kounye a.',loginTitle:'Konekte pou kontinye ak VIP',loginText:'Plan ak pri yo vizib. Konekte sou kont ou oswa fini enskripsyon an anvan ou fè yon peman VIP.',loginButton:'Konekte / Enskri',planDesc:'Aksè VIP ak avantaj eksklizif.'},
    fr:{heroTitle:'Statut VIP. Plus d’avantages.',heroDesc:'Choisissez votre formule VIP pour obtenir le statut VIP et des avantages exclusifs sur DOBERTO VCF.',b1:'Statut VIP',b1d:'Votre compte affiche le statut VIP pendant toute la durée active.',b2:'Accès exclusif',b2d:'Profitez d’avantages et de fonctions réservés aux membres VIP.',b3:'Paiement sécurisé',b3d:'MonCash est vérifié automatiquement. NatCash utilise la référence de transaction.',standard:'Vous êtes sur le plan Standard.',confirmed:'Paiement confirmé. Votre VIP est maintenant actif.',loginTitle:'Connectez-vous pour continuer avec VIP',loginText:'Les formules et tarifs restent visibles. Connectez-vous à votre compte ou terminez votre inscription avant un paiement VIP.',loginButton:'Se connecter / S’inscrire',planDesc:'Accès VIP et avantages exclusifs.'},
    en:{heroTitle:'VIP status. More benefits.',heroDesc:'Choose your VIP plan to get VIP status and exclusive DOBERTO VCF benefits.',b1:'VIP status',b1d:'Your account shows VIP status while your plan is active.',b2:'Exclusive access',b2d:'Get benefits and features reserved for VIP members.',b3:'Secure payment',b3d:'MonCash is verified automatically. NatCash uses the transaction reference.',standard:'You are on the Standard plan.',confirmed:'Payment confirmed. Your VIP is now active.',loginTitle:'Sign in to continue with VIP',loginText:'Plans and prices remain visible. Sign in to your account or complete registration before making a VIP payment.',loginButton:'Sign in / Register',planDesc:'VIP access and exclusive benefits.'}
  };
  function lang(){const s=document.getElementById('langSelect');return s&&copy[s.value]?s.value:'ht'}
  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
  function stale(text){return /Google Contacts|Auto-Sync|\bsync\b|synchron/i.test(String(text||''))}
  function patch(){
    const c=copy[lang()];
    setText(document.querySelector('[data-vip-key="heroTitle"]'),c.heroTitle);
    setText(document.querySelector('[data-vip-key="heroDesc"]'),c.heroDesc);
    ['b1','b1d','b2','b2d','b3','b3d'].forEach(k=>setText(document.querySelector(`[data-vip-key="${k}"]`),c[k]));

    const status=document.getElementById('vipStatus');
    if(status&&stale(status.textContent))setText(status,/active|actif|aktif|confirm/i.test(status.textContent||'')?c.confirmed:c.standard);

    const message=document.getElementById('vipMessage');
    if(message&&stale(message.textContent))setText(message,/confirm|active|actif|aktif/i.test(message.textContent||'')?c.confirmed:c.standard);

    document.querySelectorAll('.vip-plan-desc').forEach(el=>{if(stale(el.textContent))setText(el,c.planDesc)});

    const gate=document.getElementById('vipLoginGate');
    if(gate){
      setText(gate.querySelector('strong'),c.loginTitle);
      setText(gate.querySelector('p'),c.loginText);
      const a=gate.querySelector('a');if(a)setText(a,`${c.loginButton} →`);
    }
  }
  let queued=false;
  const observer=new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;patch()},0)});
  if(document.body)observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(patch,20));
  [0,80,250,600,1200].forEach(ms=>setTimeout(patch,ms));
})();
