// DOBERTO VCF — V12 shared copy additions.
// This file extends the original I18N dictionary so every page uses the same
// saved language (doberto_lang) and newly-added UI stays translated.
(function(){
  if (typeof I18N === 'undefined') return;

  const EXTRA = {
    ht: {
      nav_home:'Akèy', nav_privacy:'Konfidansyalite', nav_terms:'Kondisyon',
      reg_flow_title:'Premye etap',
      reg_flow_desc:'Ranpli enskripsyon an. Lè li fini, DOBERTO VCF ap ouvri Home Page la otomatikman pou ou.',
      reg_already_member:'Mwen deja enskri — kontinye sou Home Page',
      reg_side_fast_title:'Rapid & gratis', reg_side_fast_desc:'Pa gen peman. Fòm lan pran sèlman kèk segond pou ranpli.',
      reg_side_privacy_title:'Vi prive', reg_side_privacy_desc:'Nimewo telefòn ou pa afiche sou lis piblik moun ki enskri yo.',
      reg_side_vcf_title:'Yon sèl fichye', reg_side_vcf_desc:'Apre verifikasyon, ou ka jwenn fichye kontak la dirèkteman sou paj lis la.',
      admin_secure_desc:'Aksè sa a rezève pou administrasyon DOBERTO VCF.',
      admin_manage:'Jesyon enskripsyon yo',
      privacy_title:'Politik konfidansyalite',
      privacy_intro:'DOBERTO VCF kolekte enfòmasyon ou bay pandan enskripsyon an, tankou non ou, nimewo WhatsApp ou ak, si ou chwazi bay li, email ou, pou nou ka bay sèvis VCF la.',
      privacy_use_title:'Itilizasyon done yo',
      privacy_use_desc:'Done yo sèvi pou fonksyònman sèvis la, pou jenere lis kontak la ak pou anpeche abi. Nimewo telefòn yo pa afiche piblikman nan lis sit la.',
      privacy_notifications_title:'Notifikasyon sèvis',
      privacy_notifications_desc:'Si ou bay yon adrès email, DOBERTO VCF ka itilize li pou avèti ou lè objektif enskripsyon an rive epi fichye VCF la disponib. Si ou aktive notifikasyon navigatè a, sèvis la itilize OneSignal pou jere abònman push la ak voye alèt yo. Ou ka retire pèmisyon sa a nenpòt lè nan paramèt navigatè ou.',
      privacy_choices_title:'Chwa ou yo',
      privacy_choices_desc:'Ou ka mande koreksyon oswa efasman enfòmasyon ou lè ou kontakte administratè sèvis la.',
      privacy_ads_title:'Piblisite',
      privacy_ads_desc:'Sit la ka chaje sèvis piblisite twazyèm pati. Founisè sa yo ka aplike pwòp teknoloji ak règleman konfidansyalite pa yo.',
      legal_updated:'Dènye mizajou: 5 septanm 2026.', legal_back:'Retounen sou Akèy',
      terms_title:'Kondisyon itilizasyon',
      terms_intro:'Lè ou itilize DOBERTO VCF, ou dakò pou bay enfòmasyon ki kòrèk epi itilize sèvis la yon fason lejitim.',
      terms_registration_title:'Enskripsyon',
      terms_registration_desc:'Ou dwe enskri sèlman yon nimewo ou gen otorizasyon pou itilize. Enskripsyon abizif, otomatik oswa fwod ka efase.',
      terms_service_title:'Sèvis VCF',
      terms_service_desc:'Disponiblite telechajman an ka depann de objektif enskripsyon ki afiche sou sit la. Sèvis la ka evolye pou amelyore sekirite ak fonksyònman li.',
      terms_responsibility_title:'Responsablite',
      terms_responsibility_desc:'Chak itilizatè responsab fason li itilize kontak li jwenn yo epi li dwe respekte vi prive lòt itilizatè yo ak règleman ki aplikab yo.'
    },
    fr: {
      nav_home:'Accueil', nav_privacy:'Confidentialité', nav_terms:'Conditions',
      reg_flow_title:'Première étape',
      reg_flow_desc:'Complétez votre inscription. Une fois terminée, DOBERTO VCF ouvrira automatiquement la page d’accueil.',
      reg_already_member:'Je suis déjà inscrit — continuer vers l’accueil',
      reg_side_fast_title:'Rapide et gratuit', reg_side_fast_desc:'Aucun paiement. Le formulaire ne prend que quelques secondes à remplir.',
      reg_side_privacy_title:'Confidentialité', reg_side_privacy_desc:'Votre numéro de téléphone n’est jamais affiché dans la liste publique des membres.',
      reg_side_vcf_title:'Un seul fichier', reg_side_vcf_desc:'Après vérification, vous pouvez récupérer le fichier de contacts directement depuis la page des membres.',
      admin_secure_desc:'Cet accès est réservé à l’administration de DOBERTO VCF.',
      admin_manage:'Gestion des inscriptions',
      privacy_title:'Politique de confidentialité',
      privacy_intro:'DOBERTO VCF collecte les informations que vous fournissez lors de votre inscription, notamment votre nom, votre numéro WhatsApp et, si vous choisissez de le fournir, votre email, afin de fournir le service VCF.',
      privacy_use_title:'Utilisation des données',
      privacy_use_desc:'Les données servent au fonctionnement du service, à la génération de la liste de contacts et à la prévention des abus. Les numéros ne sont pas affichés publiquement sur la liste du site.',
      privacy_notifications_title:'Notifications de service',
      privacy_notifications_desc:'Si vous fournissez une adresse email, DOBERTO VCF peut l’utiliser pour vous avertir lorsque l’objectif d’inscriptions est atteint et que le fichier VCF devient disponible. Si vous activez les notifications dans votre navigateur, le service utilise OneSignal pour gérer votre abonnement push et livrer les alertes. Vous pouvez retirer cette autorisation à tout moment depuis les paramètres de votre navigateur.',
      privacy_choices_title:'Vos choix',
      privacy_choices_desc:'Vous pouvez demander la correction ou la suppression de vos informations en contactant l’administrateur du service.',
      privacy_ads_title:'Publicité',
      privacy_ads_desc:'Le site peut charger des services publicitaires tiers. Ces fournisseurs peuvent appliquer leurs propres technologies et politiques de confidentialité.',
      legal_updated:'Dernière mise à jour : 5 septembre 2026.', legal_back:'Retour à l’accueil',
      terms_title:'Conditions d’utilisation',
      terms_intro:'En utilisant DOBERTO VCF, vous acceptez de fournir des informations exactes et d’utiliser le service de manière légitime.',
      terms_registration_title:'Inscription',
      terms_registration_desc:'Vous devez uniquement inscrire un numéro que vous êtes autorisé à utiliser. Les inscriptions abusives, automatisées ou frauduleuses peuvent être supprimées.',
      terms_service_title:'Service VCF',
      terms_service_desc:'La disponibilité du téléchargement peut dépendre de l’objectif d’inscriptions affiché sur le site. Le service peut évoluer pour améliorer sa sécurité et son fonctionnement.',
      terms_responsibility_title:'Responsabilité',
      terms_responsibility_desc:'Chaque utilisateur reste responsable de l’utilisation qu’il fait des contacts obtenus et doit respecter la vie privée des autres utilisateurs ainsi que les règles applicables.'
    },
    en: {
      nav_home:'Home', nav_privacy:'Privacy', nav_terms:'Terms',
      reg_flow_title:'First step',
      reg_flow_desc:'Complete your registration. When it is finished, DOBERTO VCF will automatically open the Home Page for you.',
      reg_already_member:'I am already registered — continue to Home',
      reg_side_fast_title:'Fast & free', reg_side_fast_desc:'No payment required. The form only takes a few seconds to complete.',
      reg_side_privacy_title:'Privacy', reg_side_privacy_desc:'Your phone number is never shown in the public member directory.',
      reg_side_vcf_title:'One file', reg_side_vcf_desc:'After verification, you can get the contact file directly from the members page.',
      admin_secure_desc:'This access is reserved for DOBERTO VCF administration.',
      admin_manage:'Registration management',
      privacy_title:'Privacy Policy',
      privacy_intro:'DOBERTO VCF collects the information you provide when registering, including your name, WhatsApp number and, if you choose to provide it, your email, in order to provide the VCF service.',
      privacy_use_title:'How data is used',
      privacy_use_desc:'Data is used to operate the service, generate the contact list and prevent abuse. Phone numbers are not displayed publicly in the site directory.',
      privacy_notifications_title:'Service notifications',
      privacy_notifications_desc:'If you provide an email address, DOBERTO VCF may use it to notify you when the registration goal is reached and the VCF file becomes available. If you enable browser notifications, the service uses OneSignal to manage your push subscription and deliver alerts. You can revoke this permission at any time in your browser settings.',
      privacy_choices_title:'Your choices',
      privacy_choices_desc:'You may request correction or deletion of your information by contacting the service administrator.',
      privacy_ads_title:'Advertising',
      privacy_ads_desc:'The site may load third-party advertising services. Those providers may apply their own technologies and privacy policies.',
      legal_updated:'Last updated: September 5, 2026.', legal_back:'Back to Home',
      terms_title:'Terms of Use',
      terms_intro:'By using DOBERTO VCF, you agree to provide accurate information and use the service legitimately.',
      terms_registration_title:'Registration',
      terms_registration_desc:'You must only register a number that you are authorized to use. Abusive, automated or fraudulent registrations may be removed.',
      terms_service_title:'VCF service',
      terms_service_desc:'Download availability may depend on the registration goal shown on the site. The service may evolve to improve its security and operation.',
      terms_responsibility_title:'Responsibility',
      terms_responsibility_desc:'Each user remains responsible for how they use obtained contacts and must respect other users’ privacy and applicable rules.'
    }
  };

  Object.keys(EXTRA).forEach((lang) => {
    if (I18N[lang]) Object.assign(I18N[lang], EXTRA[lang]);
  });

  // Migrate the temporary Home-only language key used by an older build.
  try {
    const shared = localStorage.getItem('doberto_lang');
    const legacy = localStorage.getItem('dv_lang');
    if (!shared && legacy && I18N[legacy]) localStorage.setItem('doberto_lang', legacy);
    if (legacy) localStorage.removeItem('dv_lang');
  } catch (_) {}
})();
