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
      label_name:'Non konplè', label_email:'Email', label_phone:'Nimewo WhatsApp', label_password:'Modpas admin',
      btn_register:'Enskri', btn_sending:'Ap voye…', btn_login:'Konekte', btn_logout:'Dekonekte',
      btn_export:'Ekspòte tout an CSV', btn_edit:'Modifye', btn_delete:'Efase', btn_cancel:'Anile', btn_save:'Sove chanjman', btn_saving:'Ap sove…',
      admin_login_title:'Koneksyon Admin', admin_secure_desc:'Aksè sa a rezève pou administrasyon DOBERTO VCF.', admin_manage:'Jere enskripsyon yo', admin_list_title:'Tout moun ki enskri',
      search_placeholder:'Chèche pa non…', th_name:'Non', th_email:'Email', th_country:'Peyi', th_phone:'Nimewo', th_actions:'Aksyon',
      pager_prev:'← Anvan', pager_next:'Apre →', footer_admin:'DOBERTO VCF — Zòn admin sèlman. Aksè restrenn.',
      list_title_1:'Dekouvri manm yo', list_title_2:'nan rezo a', list_desc:'Pou pwoteje vi prive chak moun, sèlman non ak peyi parèt nan anyè a.',
      dl_title:'Telechaje fichye VCF la', btn_verify:'Verifye & Telechaje', btn_verifying:'Ap verifye…',
      msg_register_success:'Enskripsyon an fini!', err_no_connection:'Koneksyon an te entèwonp. Verifye entènèt ou epi eseye ankò.'
    },
    fr: {
      nav_home:'Accueil', nav_register:'Inscription', nav_list:'Membres', nav_admin:'Admin',
      nav_privacy:'Confidentialité', nav_terms:'Conditions',
      label_name:'Nom complet', label_email:'Email', label_phone:'Numéro WhatsApp', label_password:'Mot de passe admin',
      btn_register:'S’inscrire', btn_sending:'Envoi…', btn_login:'Se connecter', btn_logout:'Se déconnecter',
      btn_export:'Exporter tout en CSV', btn_edit:'Modifier', btn_delete:'Supprimer', btn_cancel:'Annuler', btn_save:'Enregistrer', btn_saving:'Enregistrement…',
      admin_login_title:'Connexion administrateur', admin_secure_desc:'Cet accès est réservé à l’administration de DOBERTO VCF.', admin_manage:'Gérer les inscriptions', admin_list_title:'Toutes les inscriptions',
      search_placeholder:'Rechercher par nom…', th_name:'Nom', th_email:'Email', th_country:'Pays', th_phone:'Numéro', th_actions:'Actions',
      pager_prev:'← Précédent', pager_next:'Suivant →', footer_admin:'DOBERTO VCF — Zone administrateur. Accès restreint.',
      list_title_1:'Découvrez les membres', list_title_2:'du réseau', list_desc:'Pour protéger la vie privée de chacun, seuls le nom et le pays apparaissent dans l’annuaire.',
      dl_title:'Télécharger le fichier VCF', btn_verify:'Vérifier & Télécharger', btn_verifying:'Vérification…',
      msg_register_success:'Inscription terminée !', err_no_connection:'La connexion a été interrompue. Vérifiez votre accès Internet puis réessayez.'
    },
    en: {
      nav_home:'Home', nav_register:'Register', nav_list:'Members', nav_admin:'Admin',
      nav_privacy:'Privacy', nav_terms:'Terms',
      label_name:'Full name', label_email:'Email', label_phone:'WhatsApp number', label_password:'Admin password',
      btn_register:'Register', btn_sending:'Sending…', btn_login:'Sign in', btn_logout:'Sign out',
      btn_export:'Export all as CSV', btn_edit:'Edit', btn_delete:'Delete', btn_cancel:'Cancel', btn_save:'Save changes', btn_saving:'Saving…',
      admin_login_title:'Admin sign-in', admin_secure_desc:'This area is reserved for DOBERTO VCF administration.', admin_manage:'Manage registrations', admin_list_title:'All registrations',
      search_placeholder:'Search by name…', th_name:'Name', th_email:'Email', th_country:'Country', th_phone:'Number', th_actions:'Actions',
      pager_prev:'← Previous', pager_next:'Next →', footer_admin:'DOBERTO VCF — Admin area only. Restricted access.',
      list_title_1:'Meet the members', list_title_2:'in the network', list_desc:'To protect everyone’s privacy, only names and countries appear in the directory.',
      dl_title:'Download the VCF file', btn_verify:'Verify & Download', btn_verifying:'Verifying…',
      msg_register_success:'Registration complete!', err_no_connection:'The connection was interrupted. Check your Internet connection and try again.'
    }
  };

  Object.keys(EXTRA).forEach(function(lang){
    I18N[lang] = Object.assign(I18N[lang] || {}, EXTRA[lang]);
  });
})();
