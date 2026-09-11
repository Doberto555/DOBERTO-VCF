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
      kicker:'Platfòm kwasans kontak', title1:'Bati rezo WhatsApp ou', title2:'Otomatikman',
      desc:'Konekte kont ou, ajoute nimewo WhatsApp ou epi kite DOBERTO VCF òganize kwasans rezo a. Google Contacts rete opsyonèl epi ou kontwole tout sa ou aktive.',
      join:'Antre nan rezo a', howLink:'Kijan sa mache', free:'Gratis pou enskri', private:'Nimewo pa piblik', auto:'Auto-Sync opsyonèl',
      consoleTitle:'Konsòl rezo', live:'Manm enskri', networkActive:'Rezo aktif', networkCaption:'Rezo DOBERTO VCF an dirèk', goal:'kapasite',
      downloads:'Plan', downloadsSub:'Standard oswa VIP', syncLabel:'Auto-Sync', syncSub:'Google Contacts', syncReady:'Sync fèt pou mache poukont li', syncReadySub:'Konekte yon sèl fwa epi kenbe kontak yo ajou.',
      how:'Kijan sa mache', howTitle:'Twa etap nan kèk segond', howDesc:'Pa gen pwosesis konplike. Konekte, ajoute enfòmasyon ou epi chwazi si ou vle aktive sync.',
      s1:'Konekte ak Google', s1d:'Sèvi ak kont Google ou pou kreye yon sesyon sekirize san yon lòt modpas.', s2:'Ajoute nimewo ou', s2d:'Ranpli non ak nimewo WhatsApp ou pou antre nan rezo a.', s3:'Aktive sync si ou vle', s3d:'Google Contacts ka resevwa nouvo manm yo otomatikman. Ou ka dezaktive l nenpòt lè.',
      controlKicker:'Sant kontwòl ou', controlTitle:'Tout rezo a nan yon eksperyans ki senp', controlDesc:'DOBERTO VCF mete enskripsyon, manm ak Google Contacts nan yon sèl eksperyans ki fèt pou mobil ak òdinatè.',
      control1:'Kont Google sekirize', control1d:'Login Google la rete separe ak pèmisyon Contacts.', control2:'Sync san travay manyèl', control2d:'Lè Auto-Sync aktive, sistèm nan kontinye travay pou ou.', control3:'Vi prive klè', control3d:'Lis piblik la montre sèlman enfòmasyon ki nesesè.',
      dashboard:'TABLO DE BÒ', overview:'Apèsi', members:'Manm', googleSync:'Google Sync', vcfAccess:'Plan', account:'Kont', networkOverview:'Apèsi rezo a', contactGrowth:'Kwasans kontak ou an yon kout je', privacyLabel:'Vi prive', safe:'Pwoteje', latestSync:'Dènye sync', automatic:'Otomatik', vcfSystem:'Plan aktyèl', publicNumber:'Nimewo piblik', hiddenState:'Kache',
      why:'Poukisa DOBERTO VCF', whyTitle:'Fèt pou grandi epi rete senp', whyDesc:'Nou retire etap initil yo pou ou ka konsantre sou rezo a.',
      c1:'Mobile-first', c1d:'Entèfas la fèt pou mache byen sou telefòn san li pa pèdi kalite sou desktop.', c2:'Sync otomatik', c2d:'Konekte Google Contacts epi kite nouvo kontak yo antre san travay repetitif.', c3:'Kontwòl sou done', c3d:'Ou chwazi ki pèmisyon ou bay epi ou ka revoke aksè Google nenpòt lè.',
      homeSyncTitle:'Kenbe kontak ou ajou otomatikman', homeSyncDesc:'Aktive sync sèlman si ou vle. Lè li aktive, nouvo manm yo ka ajoute nan Google Contacts ou otomatikman.', checkingSync:'N ap verifye senkronizasyon an…', connectContacts:'Konekte Google Contacts', syncNow:'Senkronize kounye a', auto15:'Auto-Sync chak 10 minit', logout:'Dekonekte',
      faqKicker:'Kesyon souvan', faqTitle:'Sa ou bezwen konnen anvan ou kòmanse', faqDesc:'Fonksyon prensipal yo klè epi chak pèmisyon rete anba kontwòl ou.',
      q1:'Kisa DOBERTO VCF fè?', a1:'Li ede manm yo bati yon rezo kontak WhatsApp epi kenbe nouvo kontak yo ajou atravè enskripsyon ak Google Contacts.',
      q2:'Èske Google Contacts obligatwa?', a2:'Non. Login Google la separe. Google Contacts aktive sèlman lè ou chwazi konekte li.',
      q3:'Èske nimewo mwen piblik?', a3:'Non. Paj manm yo montre non ak peyi sèlman. Nimewo telefòn yo pa afiche piblikman.',
      q4:'Kijan Auto-Sync la mache?', a4:'Apre ou otorize Google Contacts, sistèm nan ka ajoute nouvo manm yo otomatikman selon sync ki aktive sou kont ou.',
      q5:'Ki diferans ki genyen ant Standard ak VIP?', a5:'Plan Standard lan senkronize nouvo kontak yo apre 10 minit. Plan VIP la senkronize yo touswit.',
      cta:'Pare pou bati rezo ou?', ctad:'Kreye aksè ou gratis epi kite sistèm nan fè rès la pi fasil.', welcome:'Byenveni sou', welcomesub:'Rezo kontak ou pi entelijan', ready:'Sistèm nan pare',
      about:'Konsènan', privacy:'Konfidansyalite', terms:'Kondisyon', admin:'Admin'
    },
    fr: {
      navHome:'Accueil', navRegister:'Inscription', navList:'Membres',
      kicker:'Plateforme de croissance de contacts', title1:'Développez votre réseau WhatsApp', title2:'Automatiquement',
      desc:'Connectez votre compte, ajoutez votre numéro WhatsApp et laissez DOBERTO VCF organiser la croissance de votre réseau. Google Contacts reste facultatif et vous gardez le contrôle sur chaque autorisation.',
      join:'Rejoindre le réseau', howLink:'Comment ça marche', free:'Inscription gratuite', private:'Numéro non public', auto:'Auto-Sync facultatif',
      consoleTitle:'Console réseau', live:'Membres inscrits', networkActive:'Réseau actif', networkCaption:'Réseau DOBERTO VCF en direct', goal:'capacité',
      downloads:'Plan', downloadsSub:'Standard ou VIP', syncLabel:'Auto-Sync', syncSub:'Google Contacts', syncReady:'Une synchronisation conçue pour fonctionner seule', syncReadySub:'Connectez-vous une fois et gardez vos contacts à jour.',
      how:'Comment ça marche', howTitle:'Trois étapes en quelques secondes', howDesc:'Aucun parcours compliqué. Connectez-vous, ajoutez vos informations puis choisissez si vous souhaitez activer la synchronisation.',
      s1:'Connectez-vous avec Google', s1d:'Utilisez votre compte Google pour ouvrir une session sécurisée sans créer un nouveau mot de passe.', s2:'Ajoutez votre numéro', s2d:'Renseignez votre nom et votre numéro WhatsApp pour rejoindre le réseau.', s3:'Activez la synchronisation si vous le souhaitez', s3d:'Google Contacts peut recevoir automatiquement les nouveaux membres. Vous pouvez la désactiver à tout moment.',
      controlKicker:'Votre centre de contrôle', controlTitle:'Tout votre réseau dans une expérience simple', controlDesc:'DOBERTO VCF réunit l’inscription, les membres et Google Contacts dans une seule expérience conçue pour mobile et ordinateur.',
      control1:'Compte Google sécurisé', control1d:'La connexion Google reste séparée de l’autorisation Contacts.', control2:'Synchronisation sans travail manuel', control2d:'Lorsque Auto-Sync est activé, le système continue de travailler pour vous.', control3:'Confidentialité claire', control3d:'L’annuaire public n’affiche que les informations nécessaires.',
      dashboard:'TABLEAU DE BORD', overview:'Vue d’ensemble', members:'Membres', googleSync:'Google Sync', vcfAccess:'Plan', account:'Compte', networkOverview:'Vue d’ensemble du réseau', contactGrowth:'Votre croissance de contacts en un coup d’œil', privacyLabel:'Confidentialité', safe:'Protégé', latestSync:'Dernière sync', automatic:'Automatique', vcfSystem:'Plan actuel', publicNumber:'Numéro public', hiddenState:'Masqué',
      why:'Pourquoi DOBERTO VCF', whyTitle:'Conçu pour grandir et rester simple', whyDesc:'Nous supprimons les étapes inutiles pour vous laisser vous concentrer sur votre réseau.',
      c1:'Mobile-first', c1d:'L’interface est optimisée pour le téléphone sans perdre en qualité sur ordinateur.', c2:'Synchronisation automatique', c2d:'Connectez Google Contacts et laissez les nouveaux contacts arriver sans tâches répétitives.', c3:'Contrôle des données', c3d:'Vous choisissez les autorisations accordées et pouvez révoquer l’accès Google à tout moment.',
      homeSyncTitle:'Gardez vos contacts à jour automatiquement', homeSyncDesc:'Activez la synchronisation uniquement si vous le souhaitez. Une fois activée, les nouveaux membres peuvent être ajoutés automatiquement à Google Contacts.', checkingSync:'Vérification de la synchronisation…', connectContacts:'Connecter Google Contacts', syncNow:'Synchroniser maintenant', auto15:'Auto-Sync toutes les 10 minutes', logout:'Se déconnecter',
      faqKicker:'Questions fréquentes', faqTitle:'Ce qu’il faut savoir avant de commencer', faqDesc:'Les fonctions principales sont claires et chaque autorisation reste sous votre contrôle.',
      q1:'Que fait DOBERTO VCF ?', a1:'La plateforme aide les membres à développer leur réseau de contacts WhatsApp et à garder les nouveaux contacts à jour grâce à l’inscription et Google Contacts.',
      q2:'Google Contacts est-il obligatoire ?', a2:'Non. La connexion Google est séparée. Google Contacts n’est activé que lorsque vous choisissez de le connecter.',
      q3:'Mon numéro est-il public ?', a3:'Non. La page Membres affiche seulement le nom et le pays. Les numéros de téléphone ne sont pas affichés publiquement.',
      q4:'Comment fonctionne Auto-Sync ?', a4:'Après autorisation de Google Contacts, le système peut ajouter automatiquement les nouveaux membres selon la synchronisation activée sur votre compte.',
      q5:'Quelle est la différence entre Standard et VIP ?', a5:'Le plan Standard synchronise les nouveaux contacts après 10 minutes. Le plan VIP les synchronise immédiatement.',
      cta:'Prêt à développer votre réseau ?', ctad:'Créez votre accès gratuitement et laissez le système simplifier le reste.', welcome:'Bienvenue sur', welcomesub:'Votre réseau de contacts plus intelligent', ready:'Système prêt',
      about:'À propos', privacy:'Confidentialité', terms:'Conditions', admin:'Admin'
    },
    en: {
      navHome:'Home', navRegister:'Register', navList:'Members',
      kicker:'Contact growth platform', title1:'Build your WhatsApp network', title2:'Automatically',
      desc:'Connect your account, add your WhatsApp number and let DOBERTO VCF organize network growth. Google Contacts remains optional and every permission stays under your control.',
      join:'Join the network', howLink:'How it works', free:'Free to join', private:'Number stays private', auto:'Optional Auto-Sync',
      consoleTitle:'Network Console', live:'Registered members', networkActive:'Network active', networkCaption:'Live DOBERTO VCF network', goal:'capacity',
      downloads:'Plan', downloadsSub:'Standard or VIP', syncLabel:'Auto-Sync', syncSub:'Google Contacts', syncReady:'Sync designed to run on its own', syncReadySub:'Connect once and keep your contacts up to date.',
      how:'How it works', howTitle:'Three steps in seconds', howDesc:'No complicated process. Sign in, add your information and choose whether to enable sync.',
      s1:'Sign in with Google', s1d:'Use your Google account for a secure session without creating another password.', s2:'Add your number', s2d:'Enter your name and WhatsApp number to join the network.', s3:'Enable sync if you want', s3d:'Google Contacts can receive new members automatically. You can disable it at any time.',
      controlKicker:'Your control center', controlTitle:'Your whole network in one simple experience', controlDesc:'DOBERTO VCF brings registration, members and Google Contacts into one experience built for mobile and desktop.',
      control1:'Secure Google account', control1d:'Google sign-in stays separate from Contacts permission.', control2:'Sync without manual work', control2d:'When Auto-Sync is enabled, the system keeps working for you.', control3:'Clear privacy', control3d:'The public directory only shows the information that is needed.',
      dashboard:'DASHBOARD', overview:'Overview', members:'Members', googleSync:'Google Sync', vcfAccess:'Plan', account:'Account', networkOverview:'Network overview', contactGrowth:'Your contact growth at a glance', privacyLabel:'Privacy', safe:'Safe', latestSync:'Latest sync', automatic:'Automatic', vcfSystem:'Current plan', publicNumber:'Public number', hiddenState:'Hidden',
      why:'Why DOBERTO VCF', whyTitle:'Built to grow and stay simple', whyDesc:'We remove unnecessary steps so you can focus on your network.',
      c1:'Mobile-first', c1d:'The interface is designed for phones without losing quality on desktop.', c2:'Automatic sync', c2d:'Connect Google Contacts and let new contacts arrive without repetitive work.', c3:'Data control', c3d:'You choose which permissions to grant and can revoke Google access at any time.',
      homeSyncTitle:'Keep your contacts updated automatically', homeSyncDesc:'Enable sync only if you want it. Once enabled, new members can be added to Google Contacts automatically.', checkingSync:'Checking synchronization…', connectContacts:'Connect Google Contacts', syncNow:'Sync now', auto15:'Auto-Sync every 10 minutes', logout:'Sign out',
      faqKicker:'Frequently asked questions', faqTitle:'What you should know before getting started', faqDesc:'Core features are clear and every permission remains under your control.',
      q1:'What does DOBERTO VCF do?', a1:'It helps members grow a WhatsApp contact network and keep new contacts updated through registration and Google Contacts.',
      q2:'Is Google Contacts required?', a2:'No. Google sign-in is separate. Google Contacts is enabled only when you choose to connect it.',
      q3:'Is my phone number public?', a3:'No. The Members page shows only name and country. Phone numbers are not displayed publicly.',
      q4:'How does Auto-Sync work?', a4:'After you authorize Google Contacts, the system can add new members automatically according to the sync enabled on your account.',
      q5:'What is the difference between Standard and VIP?', a5:'Standard syncs new contacts after 10 minutes. VIP syncs them immediately.',
      cta:'Ready to grow your network?', ctad:'Create your access for free and let the system make the rest easier.', welcome:'Welcome to', welcomesub:'Your smarter contact network', ready:'System ready',
      about:'About', privacy:'Privacy', terms:'Terms', admin:'Admin'
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
    document.title = lang === 'fr' ? 'DOBERTO VCF — Accueil' : lang === 'en' ? 'DOBERTO VCF — Home' : 'DOBERTO VCF — Akèy';
    document.querySelectorAll('[data-home-key]').forEach(el => {
      const key = el.dataset.homeKey;
      if (c[key] != null) el.textContent = c[key];
    });
    const badge = document.getElementById('homeUnlockBadge');
    if (badge) badge.textContent = c.networkActive;
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
      const max = Number(s.maxInFile || 50000);
      const pct = Math.min(100, max ? (total / max) * 100 : 0);
      const num = document.getElementById('homeMemberCount');
      const mock = document.getElementById('homeMockMembers');
      const maxEl = document.getElementById('homeMaxCount');
      const fill = document.getElementById('homeProgressFill');
      const pctEl = document.getElementById('homeProgressPct');
      const badge = document.getElementById('homeUnlockBadge');
      const formatted = total.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR');
      if (num) num.textContent = formatted;
      if (mock) mock.textContent = formatted;
      if (maxEl) maxEl.textContent = max.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR');
      if (fill) fill.style.width = `${Math.max(pct, total > 0 ? 1.2 : 0)}%`;
      if (pctEl) pctEl.textContent = `${pct.toFixed(pct < 1 ? 1 : 0)}%`;
      if (badge) badge.textContent = COPY[lang].networkActive;
    } catch (_) {}
  }
  loadStats();

  const scene = document.getElementById('welcomeScene');
  let shouldWelcome = params.get('welcome') === '1';
  try { shouldWelcome = shouldWelcome || sessionStorage.getItem('dv_show_welcome') === '1'; } catch (_) {}
  if (scene) {
    if (!shouldWelcome) scene.remove();
    else {
      try { sessionStorage.removeItem('dv_show_welcome'); } catch (_) {}
      if (params.get('welcome') === '1') history.replaceState({}, '', '/');
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.setTimeout(() => {
        scene.classList.add('is-leaving');
        window.setTimeout(() => scene.remove(), reduce ? 80 : 650);
      }, reduce ? 500 : 1900);
    }
  }
})();