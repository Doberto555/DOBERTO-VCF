(() => {
  const params = new URLSearchParams(location.search);
  let registered = false;
  try { registered = localStorage.getItem('dv_registered') === '1'; } catch (_) {}
  if (!registered) {
    location.replace('/register.html');
    return;
  }

  const COPY = {
    ht: {
      navHome:'Akèy', navRegister:'Enskri', navList:'Lis moun',
      kicker:'REZO KONTAK WHATSAPP', title1:'Konekte plis.', title2:'Fè status ou rive pi lwen.',
      desc:'DOBERTO VCF ede kominote a pataje kontak fasil. Enskri nimewo WhatsApp ou, antre nan lis la epi telechaje VCF la lè li disponib.',
      join:'Enskri kounye a', list:'Gade lis moun yo', free:'100% gratis', private:'Nimewo pa afiche piblikman', live:'MOUN ENSKRI', available:'VCF DISPONIB', waiting:'AN PWOGRÈ', goal:'kapasite kontak',
      why:'POUKISA DOBERTO VCF', whyTitle:'Yon fason pi pwòp pou grandi rezo ou', whyDesc:'Tout bagay separe klèman: akèy, enskripsyon ak lis moun yo.',
      c1:'Enskripsyon rapid', c1d:'Antre non ou, chwazi peyi ou epi mete nimewo WhatsApp ou nan kèk segond.', c2:'Vi prive an premye', c2d:'Sou lis piblik la, se non moun yo sèlman ki parèt. Nimewo yo rete prive.', c3:'VCF pare pou itilize', c3d:'Lè kondisyon yo satisfè, verifye menm non ak nimewo a epi telechaje fichye VCF la.',
      how:'KIJAN LI MACHE', howTitle:'3 etap. Senp. Rapid.', howDesc:'Pa gen pwosesis konplike pou antre nan rezo DOBERTO VCF la.', s1:'Enskri', s1d:'Ranpli fòm enskripsyon an ak enfòmasyon ki kòrèk.', s2:'Antre nan lis la', s2d:'Non ou parèt nan anyè piblik la san nimewo telefòn ou.', s3:'Telechaje VCF', s3d:'Lè VCF la disponib, verifye enfòmasyon ou pou resevwa fichye a.',
      cta:'Pare pou antre nan rezo a?', ctad:'Enskripsyon an gratis epi li pran sèlman kèk segond.', welcome:'BYENVENI SOU', welcomesub:'Rezo kontak DOBERTO VCF'
    },
    fr: {
      navHome:'Accueil', navRegister:'Inscription', navList:'Membres',
      kicker:'RÉSEAU DE CONTACTS WHATSAPP', title1:'Connectez-vous davantage.', title2:'Donnez plus de portée à vos statuts.',
      desc:'DOBERTO VCF aide la communauté à partager ses contacts simplement. Inscrivez votre numéro WhatsApp, rejoignez la liste et téléchargez le VCF lorsqu’il est disponible.',
      join:'S’inscrire maintenant', list:'Voir les membres', free:'100 % gratuit', private:'Numéros jamais affichés publiquement', live:'MEMBRES INSCRITS', available:'VCF DISPONIBLE', waiting:'EN COURS', goal:'capacité de contacts',
      why:'POURQUOI DOBERTO VCF', whyTitle:'Une manière plus propre de développer votre réseau', whyDesc:'Tout est clairement séparé : accueil, inscription et liste des membres.',
      c1:'Inscription rapide', c1d:'Ajoutez votre nom, choisissez votre pays et saisissez votre numéro WhatsApp en quelques secondes.', c2:'Confidentialité d’abord', c2d:'Sur la liste publique, seuls les noms sont visibles. Les numéros restent privés.', c3:'VCF prêt à utiliser', c3d:'Lorsque les conditions sont remplies, vérifiez le même nom et numéro puis téléchargez le fichier VCF.',
      how:'COMMENT ÇA MARCHE', howTitle:'3 étapes. Simple. Rapide.', howDesc:'Aucune procédure compliquée pour rejoindre le réseau DOBERTO VCF.', s1:'Inscrivez-vous', s1d:'Remplissez le formulaire avec des informations correctes.', s2:'Rejoignez la liste', s2d:'Votre nom apparaît dans l’annuaire public sans votre numéro.', s3:'Téléchargez le VCF', s3d:'Quand le VCF est disponible, vérifiez vos informations pour récupérer le fichier.',
      cta:'Prêt à rejoindre le réseau ?', ctad:'L’inscription est gratuite et ne prend que quelques secondes.', welcome:'BIENVENUE SUR', welcomesub:'Le réseau de contacts DOBERTO VCF'
    },
    en: {
      navHome:'Home', navRegister:'Register', navList:'Members',
      kicker:'WHATSAPP CONTACT NETWORK', title1:'Connect more.', title2:'Give your status more reach.',
      desc:'DOBERTO VCF helps the community share contacts simply. Register your WhatsApp number, join the directory and download the VCF when it is available.',
      join:'Register now', list:'View members', free:'100% free', private:'Numbers are never shown publicly', live:'REGISTERED MEMBERS', available:'VCF AVAILABLE', waiting:'IN PROGRESS', goal:'contact capacity',
      why:'WHY DOBERTO VCF', whyTitle:'A cleaner way to grow your network', whyDesc:'Everything is clearly separated: home, registration and member directory.',
      c1:'Fast registration', c1d:'Add your name, choose your country and enter your WhatsApp number in seconds.', c2:'Privacy first', c2d:'Only names appear in the public directory. Phone numbers stay private.', c3:'Ready-to-use VCF', c3d:'When requirements are met, verify the same name and number and download the VCF file.',
      how:'HOW IT WORKS', howTitle:'3 steps. Simple. Fast.', howDesc:'No complicated process to join the DOBERTO VCF network.', s1:'Register', s1d:'Complete the registration form with accurate information.', s2:'Join the directory', s2d:'Your name appears publicly without exposing your phone number.', s3:'Download VCF', s3d:'When the VCF is available, verify your details to get the file.',
      cta:'Ready to join the network?', ctad:'Registration is free and takes only a few seconds.', welcome:'WELCOME TO', welcomesub:'The DOBERTO VCF contact network'
    }
  };

  const select = document.getElementById('langSelect');
  let lang = localStorage.getItem('dv_lang') || 'ht';
  if (!COPY[lang]) lang = 'ht';
  if (select) select.value = lang;

  function applyCopy() {
    const c = COPY[lang];
    document.documentElement.lang = lang === 'ht' ? 'ht' : lang;
    document.querySelectorAll('[data-home-key]').forEach(el => {
      const key = el.dataset.homeKey;
      if (c[key] != null) el.textContent = c[key];
    });
  }
  applyCopy();
  if (select) select.addEventListener('change', () => {
    lang = COPY[select.value] ? select.value : 'ht';
    localStorage.setItem('dv_lang', lang);
    applyCopy();
  });

  async function loadStats() {
    try {
      const r = await fetch('/api/stats', { cache: 'no-store' });
      if (!r.ok) return;
      const s = await r.json();
      const total = Number(s.total || 0);
      const max = Number(s.maxInFile || 50000);
      const pct = Math.min(100, max ? (total / max) * 100 : 0);
      const num = document.getElementById('homeMemberCount');
      const maxEl = document.getElementById('homeMaxCount');
      const fill = document.getElementById('homeProgressFill');
      const pctEl = document.getElementById('homeProgressPct');
      const badge = document.getElementById('homeUnlockBadge');
      if (num) num.textContent = total.toLocaleString('fr-FR');
      if (maxEl) maxEl.textContent = max.toLocaleString('fr-FR');
      if (fill) fill.style.width = `${Math.max(pct, total > 0 ? 1.2 : 0)}%`;
      if (pctEl) pctEl.textContent = `${pct.toFixed(pct < 1 ? 1 : 0)}%`;
      if (badge) {
        badge.dataset.state = s.unlocked ? 'available' : 'waiting';
        badge.textContent = COPY[lang][s.unlocked ? 'available' : 'waiting'];
      }
    } catch (_) {}
  }
  loadStats();

  const scene = document.getElementById('welcomeScene');
  const shouldWelcome = params.get('welcome') === '1' || sessionStorage.getItem('dv_show_welcome') === '1';
  if (scene) {
    if (!shouldWelcome) {
      scene.remove();
    } else {
      sessionStorage.removeItem('dv_show_welcome');
      if (params.get('welcome') === '1') history.replaceState({}, '', '/');
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const delay = reduce ? 550 : 3000;
      window.setTimeout(() => {
        scene.classList.add('is-leaving');
        window.setTimeout(() => scene.remove(), reduce ? 80 : 760);
      }, delay);
    }
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
})();
