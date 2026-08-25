// DOBERTO VCF — PRO V4 experience layer
(function () {
  const TEXT = {
    ht: {
      how: 'Kijan li mache?', step1: 'Enskri', step1d: 'Ajoute non ou ak nimewo WhatsApp ou an kèk segond.',
      step2: 'Kominote a grandi', step2d: 'Swiv pwogrè objektif la dirèkteman sou platfòm la.',
      step3: 'Pran VCF la', step3d: 'Lè objektif la rive, verifye enskripsyon ou epi telechaje fichye a.',
      privacyTitle: 'Konfidansyalite entegre', privacyDesc: 'Nimewo yo pa afiche piblikman nan lis moun ki enskri yo.',
      consent: 'Mwen dakò ak Politik konfidansyalite a ak Kondisyon itilizasyon yo.',
      search: 'Chèche yon moun pa non...', allCountries: 'Tout peyi', filters: 'Rechèch ak filtre', noResults: 'Pa gen okenn moun ki koresponn ak rechèch sa a.',
      total: 'Total enskri', today: 'Jodi a', remaining: 'Rete pou objektif', status: 'Estati VCF', unlocked: 'Debloke', locked: 'Ap grandi',
      privacy: 'Konfidansyalite', terms: 'Kondisyon itilizasyon'
    },
    en: {
      how: 'How does it work?', step1: 'Register', step1d: 'Add your name and WhatsApp number in a few seconds.',
      step2: 'The community grows', step2d: 'Track the goal progress directly on the platform.',
      step3: 'Get the VCF', step3d: 'When the goal is reached, verify your registration and download the file.',
      privacyTitle: 'Privacy built in', privacyDesc: 'Phone numbers are never displayed publicly in the member list.',
      consent: 'I agree to the Privacy Policy and Terms of Use.',
      search: 'Search people by name...', allCountries: 'All countries', filters: 'Search and filter', noResults: 'No members match this search.',
      total: 'Total members', today: 'Today', remaining: 'Left to goal', status: 'VCF status', unlocked: 'Unlocked', locked: 'Growing',
      privacy: 'Privacy', terms: 'Terms of Use'
    },
    fr: {
      how: 'Comment ça marche ?', step1: 'Inscris-toi', step1d: 'Ajoute ton nom et ton numéro WhatsApp en quelques secondes.',
      step2: 'La communauté grandit', step2d: 'Suis la progression de l’objectif directement sur la plateforme.',
      step3: 'Récupère le VCF', step3d: 'Quand l’objectif est atteint, vérifie ton inscription et télécharge le fichier.',
      privacyTitle: 'Confidentialité intégrée', privacyDesc: 'Les numéros ne sont jamais affichés publiquement dans la liste des inscrits.',
      consent: 'J’accepte la Politique de confidentialité et les Conditions d’utilisation.',
      search: 'Rechercher une personne par nom...', allCountries: 'Tous les pays', filters: 'Recherche et filtre', noResults: 'Aucun inscrit ne correspond à cette recherche.',
      total: 'Total inscrits', today: 'Aujourd’hui', remaining: 'Reste à atteindre', status: 'Statut VCF', unlocked: 'Débloqué', locked: 'En progression',
      privacy: 'Confidentialité', terms: 'Conditions d’utilisation'
    }
  };

  function lang() {
    const select = document.getElementById('langSelect');
    return (select && TEXT[select.value]) ? select.value : 'ht';
  }
  function tx(key) { return TEXT[lang()][key] || TEXT.ht[key] || key; }

  function removePublicAdminLink() {
    const nav = document.querySelector('.nav-links');
    if (!nav) return;
    nav.querySelectorAll('a').forEach((a) => {
      if ((a.getAttribute('href') || '').toLowerCase().includes('admin')) a.remove();
    });
  }

  function addHowItWorks() {
    const isHome = location.pathname === '/' || location.pathname.endsWith('/index.html') || location.pathname.endsWith('index.html');
    if (!isHome || document.querySelector('.pro-how')) return;
    const hero = document.querySelector('.container .hero');
    if (!hero) return;
    const section = document.createElement('section');
    section.className = 'pro-how';
    section.innerHTML = `
      <div class="pro-section-head"><span class="pro-eyebrow">DOBERTO VCF</span><h2 class="section-title" data-pro="how"></h2></div>
      <div class="pro-how-grid">
        <article class="pro-step"><span class="pro-step-num">1</span><h3 data-pro="step1"></h3><p data-pro="step1d"></p></article>
        <article class="pro-step"><span class="pro-step-num">2</span><h3 data-pro="step2"></h3><p data-pro="step2d"></p></article>
        <article class="pro-step"><span class="pro-step-num">3</span><h3 data-pro="step3"></h3><p data-pro="step3d"></p></article>
      </div>
      <div class="pro-trust"><span class="pro-trust-icon">✓</span><div><strong data-pro="privacyTitle"></strong><span class="hint" data-pro="privacyDesc"></span></div></div>`;
    hero.insertAdjacentElement('afterend', section);
  }

  function addConsent() {
    const form = document.getElementById('regForm');
    const submit = document.getElementById('submitBtn');
    if (!form || !submit || document.getElementById('privacyConsent')) return;
    const wrap = document.createElement('label');
    wrap.className = 'pro-consent';
    wrap.innerHTML = `<input id="privacyConsent" type="checkbox" required><span data-pro="consent"></span>`;
    wrap.querySelector('span').addEventListener('click', (e) => {
      if (e.target.closest('a')) e.preventDefault();
    });
    const text = wrap.querySelector('span');
    text.innerHTML = consentHtml();
    submit.insertAdjacentElement('beforebegin', wrap);
  }

  function consentHtml() {
    const l = lang();
    if (l === 'fr') return `J’accepte la <a href="privacy.html" target="_blank">Politique de confidentialité</a> et les <a href="terms.html" target="_blank">Conditions d’utilisation</a>.`;
    if (l === 'en') return `I agree to the <a href="privacy.html" target="_blank">Privacy Policy</a> and <a href="terms.html" target="_blank">Terms of Use</a>.`;
    return `Mwen dakò ak <a href="privacy.html" target="_blank">Politik konfidansyalite a</a> ak <a href="terms.html" target="_blank">Kondisyon itilizasyon yo</a>.`;
  }

  function addListFilters() {
    if (!document.getElementById('listBody') || document.querySelector('.pro-list-toolbar')) return;
    const tableScroll = document.querySelector('#listBody')?.closest('.table-scroll');
    if (!tableScroll) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'pro-list-toolbar';
    toolbar.innerHTML = `
      <div class="pro-filter-title" data-pro="filters"></div>
      <div class="pro-filter-grid">
        <div class="pro-search-wrap"><span>⌕</span><input id="publicSearch" type="search" autocomplete="off"></div>
        <select id="publicCountry"><option value=""></option></select>
      </div>`;
    tableScroll.insertAdjacentElement('beforebegin', toolbar);

    const countrySelect = document.getElementById('publicCountry');
    if (typeof COUNTRIES !== 'undefined') {
      COUNTRIES.forEach((c) => {
        const option = document.createElement('option');
        option.value = `${c.name} (+${c.dial})`;
        option.textContent = `${c.name} (+${c.dial})`;
        countrySelect.appendChild(option);
      });
    }

    let proSearch = '';
    let proCountry = '';
    const originalRender = (typeof renderList === 'function') ? renderList : null;

    if (typeof loadList === 'function' && originalRender) {
      loadList = async function (page) {
        const qs = new URLSearchParams({ page: String(page) });
        if (proSearch) qs.set('search', proSearch);
        if (proCountry) qs.set('country', proCountry);
        const res = await fetch(`/api/public-list?${qs.toString()}`);
        const data = await res.json();
        lastListData = data;
        currentPage = page;
        totalPages = Math.max(1, Math.ceil((data.total || 0) / data.pageSize));
        originalRender();
        if (!data.list || data.list.length === 0) {
          const body = document.getElementById('listBody');
          body.innerHTML = `<tr><td colspan="2"><div class="pro-empty">${tx('noResults')}</div></td></tr>`;
        }
      };
    }

    let timer;
    document.getElementById('publicSearch').addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        proSearch = e.target.value.trim();
        loadList(1);
      }, 300);
    });
    countrySelect.addEventListener('change', (e) => {
      proCountry = e.target.value;
      loadList(1);
    });

    loadList(1);
  }

  function ensureAdminKpis() {
    const panel = document.getElementById('adminPanel');
    if (!panel || document.getElementById('adminKpis')) return;
    const kicker = panel.querySelector('.admin-kicker');
    const grid = document.createElement('div');
    grid.id = 'adminKpis';
    grid.className = 'pro-kpi-grid';
    grid.innerHTML = `
      <article class="pro-kpi"><span class="pro-kpi-label" data-pro="total"></span><strong id="kpiTotal">—</strong><small>Database</small></article>
      <article class="pro-kpi"><span class="pro-kpi-label" data-pro="today"></span><strong id="kpiToday">—</strong><small>24h / UTC</small></article>
      <article class="pro-kpi"><span class="pro-kpi-label" data-pro="remaining"></span><strong id="kpiRemaining">—</strong><small id="kpiProgress">—</small></article>
      <article class="pro-kpi pro-kpi-status"><span class="pro-kpi-label" data-pro="status"></span><strong id="kpiStatus">—</strong><small>VCF</small></article>`;
    if (kicker) kicker.insertAdjacentElement('afterend', grid);
    else panel.prepend(grid);
  }

  async function loadAdminStatsPro() {
    const grid = document.getElementById('adminKpis');
    if (!grid || typeof adminToken === 'undefined' || !adminToken) return;
    try {
      const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) return;
      const data = await res.json();
      document.getElementById('kpiTotal').textContent = Number(data.total || 0).toLocaleString('fr-FR');
      document.getElementById('kpiToday').textContent = Number(data.today || 0).toLocaleString('fr-FR');
      document.getElementById('kpiRemaining').textContent = Number(data.remaining || 0).toLocaleString('fr-FR');
      document.getElementById('kpiProgress').textContent = `${data.progress || 0}% de l’objectif`;
      const status = document.getElementById('kpiStatus');
      status.textContent = data.unlocked ? tx('unlocked') : tx('locked');
      grid.classList.toggle('is-unlocked', !!data.unlocked);
    } catch (_) { /* UI silencieuse */ }
  }

  function hookAdmin() {
    if (!document.getElementById('adminPanel')) return;
    ensureAdminKpis();

    if (typeof showAdminPanel === 'function') {
      const originalShow = showAdminPanel;
      showAdminPanel = function () {
        const result = originalShow.apply(this, arguments);
        setTimeout(loadAdminStatsPro, 0);
        return result;
      };
    }
    if (typeof loadAdminList === 'function') {
      const originalLoad = loadAdminList;
      loadAdminList = async function () {
        const result = await originalLoad.apply(this, arguments);
        loadAdminStatsPro();
        return result;
      };
    }
    if (typeof adminToken !== 'undefined' && adminToken) loadAdminStatsPro();
  }

  function addFooter() {
    const container = document.querySelector('.container');
    if (!container || document.querySelector('.pro-footer')) return;
    const footer = document.createElement('footer');
    footer.className = 'pro-footer';
    footer.innerHTML = `<span class="hint">© 2026 DOBERTO VCF · Doberto Mr Lit</span><nav class="pro-footer-links"><a href="privacy.html" data-pro="privacy"></a><a href="terms.html" data-pro="terms"></a></nav>`;
    container.appendChild(footer);
  }

  function renderLanguage() {
    document.querySelectorAll('[data-pro]').forEach((el) => {
      const key = el.getAttribute('data-pro');
      if (key === 'consent') return;
      el.textContent = tx(key);
    });
    const consent = document.querySelector('.pro-consent span');
    if (consent) consent.innerHTML = consentHtml();
    const search = document.getElementById('publicSearch');
    if (search) search.placeholder = tx('search');
    const country = document.getElementById('publicCountry');
    if (country && country.options[0]) country.options[0].textContent = tx('allCountries');
  }

  document.addEventListener('DOMContentLoaded', () => {
    removePublicAdminLink();
    addHowItWorks();
    addConsent();
    addListFilters();
    hookAdmin();
    addFooter();
    renderLanguage();

    const select = document.getElementById('langSelect');
    if (select) select.addEventListener('change', () => setTimeout(() => {
      renderLanguage();
      loadAdminStatsPro();
    }, 0));
  });
})();
