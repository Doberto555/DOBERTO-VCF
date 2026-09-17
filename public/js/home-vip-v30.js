(() => {
  'use strict';
  const COPY={
    ht:{nav:'VIP',kicker:'VIP DOBERTO VCF',title:'Plis vit ak Auto-Sync imedyat',desc:'Standard mete nouvo kontak yo ajou apre 10 minit. VIP retire tann lan epi senkronize Google Contacts ou touswit.',cta:'Dekouvri VIP',join:'Enskri kounye a',standard:'STANDARD',standardTitle:'Auto-Sync apre 10 minit',standardDesc:'Gratis pou kòmanse. Sistèm nan senkronize otomatikman sou sik Standard la.',vip:'VIP',vipTitle:'Auto-Sync imedyat',vipDesc:'Nouvo kontak yo antre san tann pwochen sik Standard la.'},
    fr:{nav:'VIP',kicker:'DOBERTO VCF VIP',title:'Plus rapide avec la synchronisation instantanée',desc:'Standard met les nouveaux contacts à jour après 10 minutes. VIP supprime l’attente et synchronise Google Contacts immédiatement.',cta:'Découvrir VIP',join:'S’inscrire',standard:'STANDARD',standardTitle:'Auto-Sync après 10 minutes',standardDesc:'Gratuit pour commencer. Le système synchronise automatiquement selon le cycle Standard.',vip:'VIP',vipTitle:'Auto-Sync instantané',vipDesc:'Les nouveaux contacts sont ajoutés sans attendre le prochain cycle Standard.'},
    en:{nav:'VIP',kicker:'DOBERTO VCF VIP',title:'Faster with instant Auto-Sync',desc:'Standard updates new contacts after 10 minutes. VIP removes the wait and syncs Google Contacts immediately.',cta:'Explore VIP',join:'Register now',standard:'STANDARD',standardTitle:'Auto-Sync after 10 minutes',standardDesc:'Free to start. The system syncs automatically on the Standard cycle.',vip:'VIP',vipTitle:'Instant Auto-Sync',vipDesc:'New contacts are added without waiting for the next Standard cycle.'}
  };
  const lang=()=>{const s=document.getElementById('langSelect');return COPY[s?.value]?s.value:'ht'};
  function apply(){const c=COPY[lang()];document.querySelectorAll('[data-home-vip-key]').forEach(el=>{const key=el.dataset.homeVipKey;if(c[key]!=null)el.textContent=c[key]})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(apply,0));
})();
