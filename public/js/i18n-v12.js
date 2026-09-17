// DOBERTO VCF — current shared translation refinements.
(function () {
  if (typeof I18N === 'undefined') return;

  if (!document.querySelector('link[data-human-v13]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/human-v13.css?v=20260910-1';
    link.dataset.humanV13 = '1';
    document.head.appendChild(link);
  }

  const EXTRA = {
    ht: {
      nav_home:'Akèy', nav_register:'Enskri', nav_list:'Manm', nav_admin:'Admin',
      nav_privacy:'Konfidansyalite', nav_terms:'Kondisyon',
      label_email:'Email', admin_secure_desc:'Aksè sa a rezève pou administrasyon DOBERTO VCF.', admin_manage:'Jere enskripsyon yo',
      list_title_1:'Dekouvri manm yo', list_title_2:'nan rezo a', list_desc:'Pou pwoteje vi prive chak moun, sèlman non ak peyi parèt nan anyè a.'
    },
    fr: {
      nav_home:'Accueil', nav_register:'Inscription', nav_list:'Membres', nav_admin:'Admin',
      nav_privacy:'Confidentialité', nav_terms:'Conditions',
      label_email:'Email', admin_secure_desc:'Cet accès est réservé à l’administration de DOBERTO VCF.', admin_manage:'Gérer les inscriptions',
      list_title_1:'Découvrez les membres', list_title_2:'du réseau', list_desc:'Pour protéger la vie privée de chacun, seuls le nom et le pays apparaissent dans l’annuaire.'
    },
    en: {
      nav_home:'Home', nav_register:'Register', nav_list:'Members', nav_admin:'Admin',
      nav_privacy:'Privacy', nav_terms:'Terms',
      label_email:'Email', admin_secure_desc:'This area is reserved for DOBERTO VCF administration.', admin_manage:'Manage registrations',
      list_title_1:'Meet the members', list_title_2:'in the network', list_desc:'To protect everyone’s privacy, only names and countries appear in the directory.'
    }
  };

  Object.keys(EXTRA).forEach(function(lang){
    I18N[lang] = Object.assign(I18N[lang] || {}, EXTRA[lang]);
  });
})();
