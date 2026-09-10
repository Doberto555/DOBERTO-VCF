// DOBERTO VCF — shared copy and typography refinements.
(function () {
  if (typeof I18N === 'undefined') return;

  // Load the typography refinement without changing the existing layout system.
  if (!document.querySelector('link[data-human-v13]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/human-v13.css?v=20260910-1';
    link.dataset.humanV13 = '1';
    document.head.appendChild(link);
  }

  const EXTRA = {
    ht: {
      nav_home: 'Akèy',
      nav_privacy: 'Konfidansyalite',
      nav_terms: 'Kondisyon',

      hero_title_1: 'Antre nan rezo a',
      hero_title_2: 'epi fè plis moun wè status ou',
      hero_desc: 'Konekte ak Google epi enskri nimewo WhatsApp ou pou antre nan rezo DOBERTO VCF la. Google Contacts rete opsyonèl.',
      label_email: 'Email',
      capacity_label: 'Objektif rezo a',

      reg_flow_title: 'Kòmanse isit la',
      reg_flow_desc: 'Konekte ak Google epi ranpli enfòmasyon ou. Apre sa ou ka chwazi si ou vle aktive Google Contacts.',
      reg_already_member: 'Mwen deja enskri',
      reg_side_fast_title: 'Rapid ak gratis',
      reg_side_fast_desc: 'Enskripsyon an gratis epi li pran sèlman kèk segond.',
      reg_side_privacy_title: 'Vi prive',
      reg_side_privacy_desc: 'Nimewo telefòn ou pa parèt sou lis piblik la.',
      reg_side_vcf_title: 'Google Contacts ak VCF',
      reg_side_vcf_desc: 'Google Contacts se yon opsyon. Fichye VCF la disponib lè objektif rezo a rive.',

      tour1_title: 'Byenveni sou DOBERTO VCF',
      tour1_desc: 'DOBERTO VCF ede moun antre nan yon rezo kontak WhatsApp pandan nimewo telefòn yo rete prive sou sit la.',
      tour2_title: 'Objektif rezo a',
      tour2_desc: 'Ba pwogrè a montre konbyen moun ki deja enskri ak kantite ki rete pou rive nan objektif la.',
      tour3_title: 'Enskripsyon',
      tour3_desc: 'Konekte ak Google epi mete enfòmasyon ki nesesè pou antre nan rezo a.',
      tour4_title: 'Telechajman VCF',
      tour4_desc: 'Lè objektif la rive ou ka verifye enfòmasyon ou epi telechaje fichye VCF la.',
      tour5_title: 'Lis manm yo',
      tour5_desc: 'Paj sa a montre non moun ki deja enskri san li pa montre nimewo telefòn yo.',

      faq_a1: 'Nimewo ou sèvi pou mete ou nan rezo kontak la. Li pa parèt piblikman sou sit la.',
      faq_a2: 'Fichye VCF la disponib lè kantite enskripsyon yo rive nan minimòm ki nesesè a. Ba pwogrè a montre kote nou rive.',
      faq_a3: 'Non. Lis piblik la montre non manm yo sèlman. Nimewo telefòn yo rete prive.',
      faq_a4: 'Wi. Enskripsyon an gratis epi pa gen peman pou antre nan rezo a.',

      list_title_1: 'Moun',
      list_title_2: 'ki deja enskri',
      list_desc: 'Pou pwoteje vi prive manm yo nimewo telefòn yo pa parèt sou paj sa a. Se non yo sèlman ki vizib.',
      dl_title: 'Telechaje fichye VCF la',
      dl_desc: 'Pou telechaje fichye VCF la ou dwe deja enskri ak menm non ak nimewo a. Fichye a disponib lè gen omwen {min} manm epi li ka gen jiska {max} kontak.',

      admin_secure_desc: 'Aksè sa a rezève pou administrasyon DOBERTO VCF.',
      admin_manage: 'Jere enskripsyon yo',

      privacy_title: 'Politik konfidansyalite',
      privacy_intro: 'DOBERTO VCF kolekte enfòmasyon ou bay lè ou enskri tankou non ou, nimewo WhatsApp ou ak email ou. Si ou konekte ak Google nou ka resevwa non ou, email ou ak foto pwofil ou pou idantifye kont lan.',
      privacy_use_title: 'Kijan nou itilize done yo',
      privacy_use_desc: 'Nou itilize done yo pou fè sèvis la fonksyone, jere rezo kontak la epi limite abi. Nimewo telefòn yo pa parèt sou lis piblik la.',
      privacy_google_title: 'Google ak Google Contacts',
      privacy_google_desc: 'Koneksyon Google sèvi pou idantifye kont ou. Google Contacts se yon otorizasyon apa ki rete opsyonèl. Si ou aktive li DOBERTO VCF itilize aksè sa a sèlman pou ajoute kontak manm yo nan Google Contacts ou epi fè senkronizasyon ou mande a.',
      privacy_google_security_title: 'Sekirite done Google yo',
      privacy_google_security_desc: 'Token OAuth Google yo estoke sou sèvè a an fòm chiffres pou senkronizasyon an ka fonksyone. DOBERTO VCF pa vann done Google ou epi li pa itilize yo pou piblisite.',
      privacy_google_control_title: 'Kontwòl ou sou aksè Google',
      privacy_google_control_desc: 'Ou ka dezaktive Auto-Sync nenpòt lè. Ou ka retire aksè DOBERTO VCF nan paramèt Kont Google ou tou. Si ou bezwen sa ou ka mande efasman done ak token ki estoke yo.',
      privacy_limited_use_title: 'Règleman Google API',
      privacy_limited_use_desc: 'DOBERTO VCF limite itilizasyon done Google yo ak fonksyon itilizatè a mande yo epi li respekte Google API Services User Data Policy ak kondisyon Limited Use yo.',
      privacy_notifications_title: 'Notifikasyon',
      privacy_notifications_desc: 'Si ou bay yon email nou ka itilize li pou fè ou konnen lè fichye VCF la disponib. Si ou aktive notifikasyon navigatè a OneSignal ka sèvi pou voye alèt sèvis yo. Ou ka retire pèmisyon sa a nenpòt lè.',
      privacy_choices_title: 'Chwa ou yo',
      privacy_choices_desc: 'Ou ka mande koreksyon oswa efasman enfòmasyon ou lè ou kontakte administratè sèvis la.',
      privacy_ads_title: 'Piblisite',
      privacy_ads_desc: 'DOBERTO VCF pa montre piblisite twazyèm pati sou paj sèvis prensipal yo.',
      legal_updated: 'Dènye mizajou: 10 septanm 2026.',
      legal_back: 'Retounen sou Akèy',

      terms_title: 'Kondisyon itilizasyon',
      terms_intro: 'Lè ou itilize DOBERTO VCF ou dakò pou bay enfòmasyon ki kòrèk epi sèvi ak sèvis la yon fason responsab.',
      terms_registration_title: 'Enskripsyon',
      terms_registration_desc: 'Enskri sèlman yon nimewo ou gen dwa itilize. Nou ka retire enskripsyon ki abizif, otomatik oswa fwod.',
      terms_service_title: 'Sèvis VCF',
      terms_service_desc: 'Fichye VCF la ka disponib sèlman lè objektif enskripsyon an rive. Nou ka amelyore sèvis la pou ogmante sekirite ak estabilite li.',
      terms_responsibility_title: 'Responsablite',
      terms_responsibility_desc: 'Chak itilizatè responsab fason li sèvi ak kontak li jwenn yo. Respekte vi prive lòt moun ak règleman ki aplikab yo.',

      mesi_desc: 'Ou fin enskri. Si ou vle ede rezo a grandi ou ka pataje lyen DOBERTO VCF la sou status WhatsApp ou.',
      mesi_share_text: 'Mwen antre nan rezo DOBERTO VCF la. Ou ka enskri tou pou devlope rezo kontak WhatsApp ou.'
    },

    fr: {
      nav_home: 'Accueil',
      nav_privacy: 'Confidentialité',
      nav_terms: 'Conditions',

      hero_title_1: 'Rejoignez le réseau',
      hero_title_2: 'et donnez plus de portée à vos statuts',
      hero_desc: 'Connectez-vous avec Google puis enregistrez votre numéro WhatsApp pour rejoindre DOBERTO VCF. La synchronisation Google Contacts reste facultative.',
      label_email: 'Email',
      capacity_label: 'Objectif du réseau',

      reg_flow_title: 'Commencez ici',
      reg_flow_desc: 'Connectez-vous avec Google puis complétez vos informations. Vous pourrez ensuite choisir si vous souhaitez activer Google Contacts.',
      reg_already_member: 'Je suis déjà inscrit',
      reg_side_fast_title: 'Rapide et gratuit',
      reg_side_fast_desc: 'L’inscription est gratuite et ne prend que quelques secondes.',
      reg_side_privacy_title: 'Confidentialité',
      reg_side_privacy_desc: 'Votre numéro de téléphone n’apparaît pas dans la liste publique.',
      reg_side_vcf_title: 'Google Contacts et VCF',
      reg_side_vcf_desc: 'Google Contacts reste facultatif. Le fichier VCF devient disponible lorsque l’objectif du réseau est atteint.',

      tour1_title: 'Bienvenue sur DOBERTO VCF',
      tour1_desc: 'DOBERTO VCF permet de rejoindre un réseau de contacts WhatsApp tout en gardant les numéros de téléphone privés sur le site.',
      tour2_title: 'Objectif du réseau',
      tour2_desc: 'La barre de progression indique le nombre de membres inscrits et ce qu’il reste avant d’atteindre l’objectif.',
      tour3_title: 'Inscription',
      tour3_desc: 'Connectez-vous avec Google puis renseignez les informations nécessaires pour rejoindre le réseau.',
      tour4_title: 'Téléchargement du VCF',
      tour4_desc: 'Une fois l’objectif atteint vous pourrez vérifier vos informations et télécharger le fichier VCF.',
      tour5_title: 'Liste des membres',
      tour5_desc: 'Cette page affiche les noms des membres inscrits sans publier leurs numéros de téléphone.',

      faq_a1: 'Votre numéro sert à vous intégrer au réseau de contacts. Il n’est pas affiché publiquement sur le site.',
      faq_a2: 'Le fichier VCF devient disponible lorsque le nombre d’inscriptions atteint le minimum requis. La barre de progression indique l’avancement.',
      faq_a3: 'Non. La liste publique affiche uniquement les noms des membres. Les numéros restent privés.',
      faq_a4: 'Oui. L’inscription est gratuite et aucun paiement n’est demandé pour rejoindre le réseau.',

      list_title_1: 'Membres',
      list_title_2: 'déjà inscrits',
      list_desc: 'Pour protéger la vie privée des membres les numéros de téléphone ne sont pas affichés sur cette page. Seuls les noms sont visibles.',
      dl_title: 'Télécharger le fichier VCF',
      dl_desc: 'Pour télécharger le fichier VCF vous devez déjà être inscrit avec le même nom et le même numéro. Le fichier devient disponible à partir de {min} membres et peut contenir jusqu’à {max} contacts.',

      admin_secure_desc: 'Cet accès est réservé à l’administration de DOBERTO VCF.',
      admin_manage: 'Gérer les inscriptions',

      privacy_title: 'Politique de confidentialité',
      privacy_intro: 'DOBERTO VCF collecte les informations que vous fournissez lors de votre inscription comme votre nom, votre numéro WhatsApp et votre email. Si vous vous connectez avec Google nous pouvons recevoir votre nom, votre email et votre photo de profil afin d’identifier votre compte.',
      privacy_use_title: 'Utilisation des données',
      privacy_use_desc: 'Nous utilisons les données pour faire fonctionner le service, gérer le réseau de contacts et limiter les abus. Les numéros de téléphone ne sont pas affichés dans la liste publique.',
      privacy_google_title: 'Google et Google Contacts',
      privacy_google_desc: 'La connexion Google sert à identifier votre compte. Google Contacts correspond à une autorisation distincte et facultative. Si vous l’activez DOBERTO VCF utilise cet accès uniquement pour ajouter les contacts des membres à votre compte Google Contacts et effectuer la synchronisation demandée.',
      privacy_google_security_title: 'Sécurité des données Google',
      privacy_google_security_desc: 'Les jetons OAuth Google sont stockés sur le serveur sous forme chiffrée afin de permettre la synchronisation. DOBERTO VCF ne vend pas vos données Google et ne les utilise pas à des fins publicitaires.',
      privacy_google_control_title: 'Votre contrôle sur l’accès Google',
      privacy_google_control_desc: 'Vous pouvez désactiver Auto-Sync à tout moment. Vous pouvez également révoquer l’accès de DOBERTO VCF depuis les paramètres de votre compte Google et demander la suppression des données ou jetons stockés.',
      privacy_limited_use_title: 'Règles Google API',
      privacy_limited_use_desc: 'DOBERTO VCF limite l’utilisation des données Google aux fonctionnalités demandées par l’utilisateur et respecte la Google API Services User Data Policy ainsi que les exigences de Limited Use.',
      privacy_notifications_title: 'Notifications',
      privacy_notifications_desc: 'Si vous fournissez une adresse email nous pouvons l’utiliser pour vous avertir lorsque le fichier VCF devient disponible. Si vous activez les notifications du navigateur OneSignal peut être utilisé pour envoyer les alertes du service. Vous pouvez retirer cette autorisation à tout moment.',
      privacy_choices_title: 'Vos choix',
      privacy_choices_desc: 'Vous pouvez demander la correction ou la suppression de vos informations en contactant l’administrateur du service.',
      privacy_ads_title: 'Publicité',
      privacy_ads_desc: 'DOBERTO VCF n’affiche pas de publicité tierce sur les principales pages du service.',
      legal_updated: 'Dernière mise à jour : 10 septembre 2026.',
      legal_back: 'Retour à l’accueil',

      terms_title: 'Conditions d’utilisation',
      terms_intro: 'En utilisant DOBERTO VCF vous acceptez de fournir des informations exactes et d’utiliser le service de manière responsable.',
      terms_registration_title: 'Inscription',
      terms_registration_desc: 'Inscrivez uniquement un numéro que vous êtes autorisé à utiliser. Les inscriptions abusives, automatisées ou frauduleuses peuvent être supprimées.',
      terms_service_title: 'Service VCF',
      terms_service_desc: 'Le fichier VCF peut devenir disponible uniquement lorsque l’objectif d’inscriptions est atteint. Le service peut évoluer afin d’améliorer sa sécurité et sa stabilité.',
      terms_responsibility_title: 'Responsabilité',
      terms_responsibility_desc: 'Chaque utilisateur est responsable de l’utilisation des contacts obtenus. Respectez la vie privée des autres personnes et les règles applicables.',

      mesi_desc: 'Votre inscription est terminée. Si vous souhaitez aider le réseau à grandir vous pouvez partager le lien DOBERTO VCF sur votre statut WhatsApp.',
      mesi_share_text: 'Je viens de rejoindre le réseau DOBERTO VCF. Vous pouvez aussi vous inscrire pour développer votre réseau de contacts WhatsApp.'
    },

    en: {
      nav_home: 'Home',
      nav_privacy: 'Privacy',
      nav_terms: 'Terms',

      hero_title_1: 'Join the network',
      hero_title_2: 'and reach more people with your status',
      hero_desc: 'Sign in with Google and register your WhatsApp number to join DOBERTO VCF. Google Contacts synchronization remains optional.',
      label_email: 'Email',
      capacity_label: 'Network goal',

      reg_flow_title: 'Start here',
      reg_flow_desc: 'Sign in with Google and complete your details. You can then choose whether to enable Google Contacts.',
      reg_already_member: 'I am already registered',
      reg_side_fast_title: 'Fast and free',
      reg_side_fast_desc: 'Registration is free and takes only a few seconds.',
      reg_side_privacy_title: 'Privacy',
      reg_side_privacy_desc: 'Your phone number is not displayed in the public directory.',
      reg_side_vcf_title: 'Google Contacts and VCF',
      reg_side_vcf_desc: 'Google Contacts is optional. The VCF file becomes available when the network goal is reached.',

      tour1_title: 'Welcome to DOBERTO VCF',
      tour1_desc: 'DOBERTO VCF lets people join a WhatsApp contact network while keeping phone numbers private on the website.',
      tour2_title: 'Network goal',
      tour2_desc: 'The progress bar shows how many members have registered and how much remains before the goal is reached.',
      tour3_title: 'Registration',
      tour3_desc: 'Sign in with Google and provide the information needed to join the network.',
      tour4_title: 'VCF download',
      tour4_desc: 'Once the goal is reached you can verify your information and download the VCF file.',
      tour5_title: 'Member directory',
      tour5_desc: 'This page shows the names of registered members without publishing their phone numbers.',

      faq_a1: 'Your number is used to include you in the contact network. It is not displayed publicly on the website.',
      faq_a2: 'The VCF file becomes available when registrations reach the required minimum. The progress bar shows the current status.',
      faq_a3: 'No. The public directory shows member names only. Phone numbers remain private.',
      faq_a4: 'Yes. Registration is free and no payment is required to join the network.',

      list_title_1: 'Members',
      list_title_2: 'already registered',
      list_desc: 'To protect member privacy phone numbers are not displayed on this page. Only names are visible.',
      dl_title: 'Download the VCF file',
      dl_desc: 'To download the VCF file you must already be registered with the same name and phone number. The file becomes available at {min} members and can contain up to {max} contacts.',

      admin_secure_desc: 'This area is reserved for DOBERTO VCF administration.',
      admin_manage: 'Manage registrations',

      privacy_title: 'Privacy Policy',
      privacy_intro: 'DOBERTO VCF collects the information you provide during registration such as your name, WhatsApp number and email. If you sign in with Google we may receive your name, email and profile picture to identify your account.',
      privacy_use_title: 'How we use data',
      privacy_use_desc: 'We use data to operate the service, manage the contact network and limit abuse. Phone numbers are not displayed in the public directory.',
      privacy_google_title: 'Google and Google Contacts',
      privacy_google_desc: 'Google sign-in is used to identify your account. Google Contacts is a separate optional permission. If you enable it DOBERTO VCF uses this access only to add member contacts to your Google Contacts account and perform the synchronization you requested.',
      privacy_google_security_title: 'Google data security',
      privacy_google_security_desc: 'Google OAuth tokens are stored on the server in encrypted form so synchronization can work. DOBERTO VCF does not sell your Google data or use it for advertising.',
      privacy_google_control_title: 'Your control over Google access',
      privacy_google_control_desc: 'You can disable Auto-Sync at any time. You can also revoke DOBERTO VCF access from your Google Account settings and request deletion of stored data or tokens.',
      privacy_limited_use_title: 'Google API policy',
      privacy_limited_use_desc: 'DOBERTO VCF limits the use of Google data to features requested by the user and complies with the Google API Services User Data Policy including Limited Use requirements.',
      privacy_notifications_title: 'Notifications',
      privacy_notifications_desc: 'If you provide an email address we may use it to notify you when the VCF file becomes available. If browser notifications are enabled OneSignal may be used to deliver service alerts. You can revoke this permission at any time.',
      privacy_choices_title: 'Your choices',
      privacy_choices_desc: 'You may request correction or deletion of your information by contacting the service administrator.',
      privacy_ads_title: 'Advertising',
      privacy_ads_desc: 'DOBERTO VCF does not display third-party advertising on the main service pages.',
      legal_updated: 'Last updated: September 10, 2026.',
      legal_back: 'Back to Home',

      terms_title: 'Terms of Use',
      terms_intro: 'By using DOBERTO VCF you agree to provide accurate information and use the service responsibly.',
      terms_registration_title: 'Registration',
      terms_registration_desc: 'Register only a number you are authorized to use. Abusive, automated or fraudulent registrations may be removed.',
      terms_service_title: 'VCF service',
      terms_service_desc: 'The VCF file may become available only when the registration goal is reached. The service may evolve to improve security and stability.',
      terms_responsibility_title: 'Responsibility',
      terms_responsibility_desc: 'Each user is responsible for how obtained contacts are used. Respect other people’s privacy and applicable rules.',

      mesi_desc: 'Your registration is complete. If you want to help the network grow you can share the DOBERTO VCF link on your WhatsApp Status.',
      mesi_share_text: 'I joined the DOBERTO VCF network. You can register too if you want to grow your WhatsApp contact network.'
    }
  };

  Object.keys(EXTRA).forEach((lang) => {
    if (I18N[lang]) Object.assign(I18N[lang], EXTRA[lang]);
  });

  try {
    const shared = localStorage.getItem('doberto_lang');
    const legacy = localStorage.getItem('dv_lang');
    if (!shared && legacy && I18N[legacy]) localStorage.setItem('doberto_lang', legacy);
    if (legacy) localStorage.removeItem('dv_lang');
  } catch (_) {}
})();
