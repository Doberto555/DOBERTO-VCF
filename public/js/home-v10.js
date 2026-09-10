(() => {
  if (!document.querySelector('link[data-human-v13]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/human-v13.css?v=20260910-1';
    link.dataset.humanV13 = '1';
    document.head.appendChild(link);
  }

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
      kicker:'Rezo kontak WhatsApp',
      title1:'Konekte ak plis moun.',
      title2:'Fè status ou rive pi lwen.',
      desc:'DOBERTO VCF ede ou antre nan yon rezo kontak WhatsApp san nimewo ou parèt piblikman. Lè fichye VCF la disponib ou ka telechaje li apre verifikasyon.',
      join:'Enskri kounye a', list:'Gade lis manm yo', free:'Enskripsyon gratis', private:'Nimewo yo rete prive',
      live:'Moun ki enskri', available:'VCF disponib', waiting:'An pwogrè', goal:'nan objektif la',
      downloads:'Telechajman VCF', downloadsSub:'telechajman verifye',
      why:'Poukisa DOBERTO VCF',
      whyTitle:'Yon fason senp pou devlope rezo ou',
      whyDesc:'Enskri, gade lis manm yo epi itilize Google Contacts oswa fichye VCF la selon sa ou bezwen.',
      c1:'Enskripsyon rapid', c1d:'Konekte ak Google epi ranpli enfòmasyon ou nan kèk segond.',
      c2:'Vi prive', c2d:'Lis piblik la montre non manm yo sèlman. Nimewo telefòn yo rete prive.',
      c3:'Google Contacts ak VCF', c3d:'Ou ka aktive Google Contacts si ou vle oswa telechaje fichye VCF la lè li disponib.',
      how:'Kijan li mache', howTitle:'Kèk etap senp pou kòmanse', howDesc:'Chak etap klè pou ou konnen ki enfòmasyon ou bay ak ki otorizasyon ou aktive.',
      s1:'Konekte epi enskri', s1d:'Konekte ak Google epi verifye non ak nimewo WhatsApp ou.',
      s2:'Antre nan rezo a', s2d:'Non ou antre nan lis manm yo san nimewo telefòn ou pa parèt piblikman.',
      s3:'Chwazi fason ou vle senkronize', s3d:'Aktive Google Contacts si sa itil pou ou oswa itilize fichye VCF la lè li pare.',
      cta:'Pare pou antre nan rezo a?', ctad:'Enskripsyon an gratis epi li pran sèlman kèk segond.',
      welcome:'Byenveni sou', welcomesub:'Rezo kontak DOBERTO VCF', ready:'Rezo kontak sekirize',
      sponsor:'', sponsorBtn:'', privacy:'Konfidansyalite', terms:'Kondisyon itilizasyon', admin:'Admin'
    },
    fr: {
      navHome:'Accueil', navRegister:'Inscription', navList:'Membres',
      kicker:'Réseau de contacts WhatsApp',
      title1:'Développez votre réseau.',
      title2:'Donnez plus de portée à vos statuts.',
      desc:'DOBERTO VCF vous permet de rejoindre un réseau de contacts WhatsApp sans afficher votre numéro publiquement. Lorsque le fichier VCF est disponible vous pouvez le télécharger après vérification.',
      join:'S’inscrire maintenant', list:'Voir les membres', free:'Inscription gratuite', private:'Numéros privés',
      live:'Membres inscrits', available:'VCF disponible', waiting:'En cours', goal:'de l’objectif',
      downloads:'Téléchargements VCF', downloadsSub:'téléchargements vérifiés',
      why:'Pourquoi DOBERTO VCF',
      whyTitle:'Une façon simple de développer votre réseau',
      whyDesc:'Inscrivez-vous, consultez les membres puis utilisez Google Contacts ou le fichier VCF selon vos besoins.',
      c1:'Inscription rapide', c1d:'Connectez-vous avec Google puis complétez vos informations en quelques secondes.',
      c2:'Confidentialité', c2d:'La liste publique affiche uniquement les noms. Les numéros de téléphone restent privés.',
      c3:'Google Contacts et VCF', c3d:'Vous pouvez activer Google Contacts si vous le souhaitez ou télécharger le fichier VCF lorsqu’il est disponible.',
      how:'Comment ça marche', howTitle:'Quelques étapes simples pour commencer', howDesc:'Chaque étape est claire afin que vous sachiez quelles informations vous partagez et quelles autorisations vous activez.',
      s1:'Connectez-vous et inscrivez-vous', s1d:'Connectez-vous avec Google puis vérifiez votre nom et votre numéro WhatsApp.',
      s2:'Rejoignez le réseau', s2d:'Votre nom apparaît dans la liste des membres sans publier votre numéro de téléphone.',
      s3:'Choisissez votre méthode de synchronisation', s3d:'Activez Google Contacts si cela vous convient ou utilisez le fichier VCF lorsqu’il est prêt.',
      cta:'Prêt à rejoindre le réseau ?', ctad:'L’inscription est gratuite et ne prend que quelques secondes.',
      welcome:'Bienvenue sur', welcomesub:'Le réseau de contacts DOBERTO VCF', ready:'Réseau de contacts sécurisé',
      sponsor:'', sponsorBtn:'', privacy:'Confidentialité', terms:'Conditions d’utilisation', admin:'Admin'
    },
    en: {
      navHome:'Home', navRegister:'Register', navList:'Members',
      kicker:'WhatsApp contact network',
      title1:'Grow your network.',
      title2:'Give your status more reach.',
      desc:'DOBERTO VCF lets you join a WhatsApp contact network without displaying your phone number publicly. When the VCF file is available you can download it after verification.',
      join:'Register now', list:'View members', free:'Free registration', private:'Phone numbers stay private',
      live:'Registered members', available:'VCF available', waiting:'In progress', goal:'of the goal',
      downloads:'VCF downloads', downloadsSub:'verified downloads',
      why:'Why DOBERTO VCF',
      whyTitle:'A simple way to grow your network',
      whyDesc:'Register, view members and use Google Contacts or the VCF file depending on what works for you.',
      c1:'Fast registration', c1d:'Sign in with Google and complete your details in a few seconds.',
      c2:'Privacy', c2d:'The public directory shows names only. Phone numbers stay private.',
      c3:'Google Contacts and VCF', c3d:'You can enable Google Contacts if you want or download the VCF file when it becomes available.',
      how:'How it works', howTitle:'A few simple steps to get started', howDesc:'Each step is clear so you know what information you share and which permissions you enable.',
      s1:'Sign in and register', s1d:'Sign in with Google and confirm your name and WhatsApp number.',
      s2:'Join the network', s2d:'Your name appears in the member directory without publishing your phone number.',
      s3:'Choose how you want to sync', s3d:'Enable Google Contacts if it is useful to you or use the VCF file when it is ready.',
      cta:'Ready to join the network?', ctad:'Registration is free and takes only a few seconds.',
      welcome:'Welcome to', welcomesub:'The DOBERTO VCF contact network', ready:'Secure contact network',
      sponsor:'', sponsorBtn:'', privacy:'Privacy', terms:'Terms of use', admin:'Admin'
    }
  };

  const select = document.getElementById('langSelect');
  let lang = 'ht';
  try {
    const shared = localStorage.getItem('doberto_lang');
    const legacy = localStorage.getItem('dv_lang');
    lang = COPY[shared] ? shared : (COPY[legacy] ? legacy : 'ht');
    localStorage.setItem('doberto_lang', lang);
    localStorage.removeItem('dv_lang');
  } catch (_) {}
  if (!COPY[lang]) lang = 'ht';
  if (select) select.value = lang;

  function applyCopy() {
    const c = COPY[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-home-key]').forEach(el => {
      const key = el.dataset.homeKey;
      if (c[key] != null) el.textContent = c[key];
    });
  }
  applyCopy();
  if (select) select.addEventListener('change', () => {
    lang = COPY[select.value] ? select.value : 'ht';
    try { localStorage.setItem('doberto_lang', lang); } catch (_) {}
    applyCopy();
    loadStats();
  });

  async function loadStats() {
    try {
      const r = await fetch('/api/stats', { cache: 'no-store' });
      if (!r.ok) return;
      const s = await r.json();
      const total = Number(s.total || 0);
      const downloads = Number(s.downloadCount || 0);
      const max = Number(s.maxInFile || 50000);
      const pct = Math.min(100, max ? (total / max) * 100 : 0);
      const num = document.getElementById('homeMemberCount');
      const downloadNum = document.getElementById('homeDownloadCount');
      const maxEl = document.getElementById('homeMaxCount');
      const fill = document.getElementById('homeProgressFill');
      const pctEl = document.getElementById('homeProgressPct');
      const badge = document.getElementById('homeUnlockBadge');
      if (num) num.textContent = total.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR');
      if (downloadNum) downloadNum.textContent = downloads.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR');
      if (maxEl) maxEl.textContent = max.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR');
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
