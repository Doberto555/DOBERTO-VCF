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
      navHome:'Akèy', navRegister:'Enskri', navList:'Manm',
      kicker:'Rezo kontak WhatsApp', title1:'Konekte ak plis moun.', title2:'Fè status ou rive pi lwen.',
      desc:'Enskri nimewo WhatsApp ou, antre nan kominote a epi kenbe kontak ou òganize. Google Contacts rete opsyonèl epi ou toujou gen kontwòl sou sa ou aktive.',
      join:'Enskri kounye a', list:'Gade manm yo', free:'Enskripsyon gratis', private:'Nimewo pa afiche piblikman', live:'Manm enskri', available:'VCF disponib', waiting:'An pwogrè', goal:'kapasite kontak',
      downloads:'VCF delivre', downloadsSub:'aksè verifye',
      why:'Poukisa DOBERTO VCF', whyTitle:'Tout sa ou bezwen nan yon sèl kote', whyDesc:'Enskripsyon an senp, manm yo fasil pou jwenn epi opsyon sync la rete anba kontwòl ou.',
      c1:'Enskripsyon rapid', c1d:'Konekte ak Google epi ajoute nimewo WhatsApp ou nan kèk segond.', c2:'Vi prive klè', c2d:'Sou anyè piblik la sèlman non ak peyi parèt. Nimewo telefòn yo rete prive.', c3:'Sync otomatik', c3d:'Si ou aktive Google Contacts, nouvo kontak yo ka ajoute otomatikman sou kont ou.',
      how:'Kijan sa mache', howTitle:'Twa etap senp', howDesc:'Konekte, enskri epi chwazi si ou vle aktive Google Contacts.', s1:'Konekte', s1d:'Sèvi ak kont Google ou pou idantifye pwofil ou.', s2:'Enskri', s2d:'Ajoute non ak nimewo WhatsApp ou pou antre nan rezo a.', s3:'Senkronize si ou vle', s3d:'Google Contacts separe ak login la epi li rete totalman opsyonèl.',
      cta:'Pare pou antre nan rezo a?', ctad:'Enskripsyon an gratis epi li pran sèlman kèk segond.', welcome:'Byenveni sou', welcomesub:'Rezo kontak DOBERTO VCF', ready:'Rezo a pare',
      privacy:'Konfidansyalite', terms:'Kondisyon', admin:'Admin'
    },
    fr: {
      navHome:'Accueil', navRegister:'Inscription', navList:'Membres',
      kicker:'Réseau de contacts WhatsApp', title1:'Connectez-vous à plus de personnes.', title2:'Donnez plus de portée à vos statuts.',
      desc:'Inscrivez votre numéro WhatsApp, rejoignez la communauté et gardez vos contacts organisés. Google Contacts reste facultatif et vous gardez le contrôle sur ce que vous activez.',
      join:'S’inscrire', list:'Voir les membres', free:'Inscription gratuite', private:'Numéros non affichés publiquement', live:'Membres inscrits', available:'VCF disponible', waiting:'En cours', goal:'capacité de contacts',
      downloads:'VCF délivrés', downloadsSub:'accès vérifiés',
      why:'Pourquoi DOBERTO VCF', whyTitle:'Tout ce dont vous avez besoin au même endroit', whyDesc:'L’inscription est simple, les membres sont faciles à retrouver et la synchronisation reste sous votre contrôle.',
      c1:'Inscription rapide', c1d:'Connectez-vous avec Google et ajoutez votre numéro WhatsApp en quelques secondes.', c2:'Confidentialité claire', c2d:'Seuls le nom et le pays apparaissent dans l’annuaire public. Les numéros restent privés.', c3:'Synchronisation automatique', c3d:'Si vous activez Google Contacts, les nouveaux contacts peuvent être ajoutés automatiquement à votre compte.',
      how:'Comment ça marche', howTitle:'Trois étapes simples', howDesc:'Connectez-vous, inscrivez-vous puis choisissez si vous souhaitez activer Google Contacts.', s1:'Connexion', s1d:'Utilisez votre compte Google pour identifier votre profil.', s2:'Inscription', s2d:'Ajoutez votre nom et votre numéro WhatsApp pour rejoindre le réseau.', s3:'Synchronisation facultative', s3d:'Google Contacts est séparé de la connexion et reste entièrement facultatif.',
      cta:'Prêt à rejoindre le réseau ?', ctad:'L’inscription est gratuite et ne prend que quelques secondes.', welcome:'Bienvenue sur', welcomesub:'Le réseau DOBERTO VCF', ready:'Réseau prêt',
      privacy:'Confidentialité', terms:'Conditions', admin:'Admin'
    },
    en: {
      navHome:'Home', navRegister:'Register', navList:'Members',
      kicker:'WhatsApp contact network', title1:'Connect with more people.', title2:'Give your status more reach.',
      desc:'Register your WhatsApp number, join the community and keep your contacts organized. Google Contacts stays optional and you remain in control of what you enable.',
      join:'Register now', list:'View members', free:'Free registration', private:'Numbers are not shown publicly', live:'Registered members', available:'VCF available', waiting:'In progress', goal:'contact capacity',
      downloads:'VCFs delivered', downloadsSub:'verified access',
      why:'Why DOBERTO VCF', whyTitle:'Everything you need in one place', whyDesc:'Registration is simple, members are easy to find and synchronization stays under your control.',
      c1:'Fast registration', c1d:'Sign in with Google and add your WhatsApp number in seconds.', c2:'Clear privacy', c2d:'Only names and countries appear in the public directory. Phone numbers stay private.', c3:'Automatic sync', c3d:'If you enable Google Contacts, new contacts can be added to your account automatically.',
      how:'How it works', howTitle:'Three simple steps', howDesc:'Sign in, register and choose whether you want to enable Google Contacts.', s1:'Sign in', s1d:'Use your Google account to identify your profile.', s2:'Register', s2d:'Add your name and WhatsApp number to join the network.', s3:'Sync if you want', s3d:'Google Contacts is separate from sign-in and remains fully optional.',
      cta:'Ready to join the network?', ctad:'Registration is free and takes only a few seconds.', welcome:'Welcome to', welcomesub:'The DOBERTO VCF network', ready:'Network ready',
      privacy:'Privacy', terms:'Terms', admin:'Admin'
    }
  };

  const select = document.getElementById('langSelect');
  let lang = 'ht';
  try {
    const shared = localStorage.getItem('doberto_lang');
    lang = COPY[shared] ? shared : 'ht';
    localStorage.setItem('doberto_lang', lang);
  } catch (_) {}
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
      const r = await fetch('/api/stats', { cache:'no-store' });
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
      if (badge) badge.textContent = COPY[lang][s.unlocked ? 'available' : 'waiting'];
    } catch (_) {}
  }
  loadStats();

  const scene = document.getElementById('welcomeScene');
  const shouldWelcome = params.get('welcome') === '1' || sessionStorage.getItem('dv_show_welcome') === '1';
  if (scene) {
    if (!shouldWelcome) scene.remove();
    else {
      sessionStorage.removeItem('dv_show_welcome');
      if (params.get('welcome') === '1') history.replaceState({}, '', '/');
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.setTimeout(() => {
        scene.classList.add('is-leaving');
        window.setTimeout(() => scene.remove(), reduce ? 80 : 650);
      }, reduce ? 500 : 2200);
    }
  }

  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
})();
