(() => {
  'use strict';

  if (window.__DOBERTO_STABILITY__) return;
  window.__DOBERTO_STABILITY__ = true;

  const nativeFetch = window.fetch.bind(window);
  const nativeAlert = window.alert.bind(window);
  const RETRY_STATUS = new Set([502, 503, 504]);

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function requestMeta(input, init) {
    try {
      const raw = typeof input === 'string' || input instanceof URL ? input : input.url;
      const url = new URL(raw, location.href);
      const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      return {
        url,
        method,
        sameOriginApi: url.origin === location.origin && url.pathname.startsWith('/api/')
      };
    } catch (_) {
      return { url: null, method: 'GET', sameOriginApi: false };
    }
  }

  async function fetchOnce(input, init, timeoutMs) {
    if (init && init.signal) return nativeFetch(input, init);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await nativeFetch(input, { ...(init || {}), signal: controller.signal });
    } finally {
      window.clearTimeout(timer);
    }
  }

  window.fetch = async function stableFetch(input, init) {
    const meta = requestMeta(input, init);
    if (!meta.sameOriginApi) return nativeFetch(input, init);

    const readOnly = meta.method === 'GET' || meta.method === 'HEAD';
    const attempts = readOnly ? 2 : 1;
    const timeoutMs = readOnly ? 14000 : 22000;
    let lastError = null;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const response = await fetchOnce(input, init, timeoutMs);
        if (readOnly && attempt + 1 < attempts && RETRY_STATUS.has(response.status)) {
          await sleep(350 + attempt * 300);
          continue;
        }
        return response;
      } catch (error) {
        lastError = error;
        if (!readOnly || attempt + 1 >= attempts) throw error;
        await sleep(350 + attempt * 300);
      }
    }

    throw lastError || new Error('Network request failed');
  };

  function loadPremiumCss() {
    if (!document.querySelector('link[data-dv-v15]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/css/site-v15.css?v=20260910-1';
      link.dataset.dvV15 = '1';
      document.head.appendChild(link);
    }

    if (!document.querySelector('link[data-dv-v16]')) {
      const cleanup = document.createElement('link');
      cleanup.rel = 'stylesheet';
      cleanup.href = '/css/site-v16.css?v=20260910-1';
      cleanup.dataset.dvV16 = '1';
      document.head.appendChild(cleanup);
    }
  }

  function toast(message, type = 'info', duration = 4300) {
    const text = String(message || '').trim();
    if (!text) return;

    let host = document.querySelector('.dv-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'dv-toast-host';
      host.setAttribute('aria-live', 'polite');
      host.setAttribute('aria-atomic', 'false');
      document.body.appendChild(host);
    }

    const item = document.createElement('div');
    item.className = `dv-toast${type === 'error' ? ' is-error' : type === 'warning' ? ' is-warning' : ''}`;
    const icon = type === 'error' ? '!' : type === 'warning' ? '!' : '✓';
    item.innerHTML = `<span class="dv-toast-icon" aria-hidden="true">${icon}</span><div class="dv-toast-copy"></div><button type="button" class="dv-toast-close" aria-label="Fèmen">×</button>`;
    item.querySelector('.dv-toast-copy').textContent = text;

    const remove = () => {
      if (!item.isConnected) return;
      item.classList.add('is-leaving');
      window.setTimeout(() => item.remove(), 210);
    };
    item.querySelector('.dv-toast-close').addEventListener('click', remove);
    host.appendChild(item);
    window.setTimeout(remove, Math.max(1800, duration));
  }

  window.DobertoUI = Object.assign(window.DobertoUI || {}, { toast });

  function installHumanAlerts() {
    if (!document.body || !document.body.classList.contains('site-v10')) return;
    if (window.__DOBERTO_ALERT_POLISH__) return;
    window.__DOBERTO_ALERT_POLISH__ = true;
    window.alert = (message) => toast(message, /erè|error|failed|pa mache|expir|invalid|refus/i.test(String(message || '')) ? 'error' : 'info');
  }

  function labelsFor(lang) {
    if (lang === 'fr') return { home: 'Accueil', register: 'Inscription', list: 'Membres', offline: 'Connexion interrompue' };
    if (lang === 'en') return { home: 'Home', register: 'Register', list: 'Members', offline: 'Connection interrupted' };
    return { home: 'Akèy', register: 'Enskri', list: 'Manm', offline: 'Koneksyon koupe' };
  }

  const ICONS = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.4 12 3.5l8.5 6.9v9.1a1 1 0 0 1-1 1h-5.2v-6.1H9.7v6.1H4.5a1 1 0 0 1-1-1z"/></svg>',
    register: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.8 19.5c.5-3.1 2.3-5 5.2-5 1.4 0 2.6.4 3.5 1.2M17.5 10.5v7m-3.5-3.5h7"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="2.8"/><circle cx="16.5" cy="9" r="2.2"/><path d="M3.7 19c.5-3.4 2-5.3 4.3-5.3s3.8 1.9 4.3 5.3M13.7 15c.7-.8 1.6-1.2 2.8-1.2 2.1 0 3.4 1.6 3.8 4.4"/></svg>'
  };

  function currentSection() {
    const path = location.pathname.replace(/\/$/, '') || '/';
    if (path === '/' || path === '/index' || path === '/index.html') return 'home';
    if (path === '/register' || path === '/register.html') return 'register';
    if (path === '/list' || path === '/list.html') return 'list';
    return '';
  }

  function setupMobileDock() {
    if (!document.body || !document.body.classList.contains('site-v10')) return;
    const section = currentSection();
    if (!section || document.querySelector('.dv-mobile-dock')) return;

    const dock = document.createElement('nav');
    dock.className = 'dv-mobile-dock';
    dock.setAttribute('aria-label', 'Navigasyon mobil');
    dock.innerHTML = `
      <a href="/" data-dock="home">${ICONS.home}<span></span></a>
      <a href="/register.html" data-dock="register">${ICONS.register}<span></span></a>
      <a href="/list.html" data-dock="list">${ICONS.list}<span></span></a>`;
    document.body.appendChild(dock);

    const update = () => {
      const select = document.getElementById('langSelect');
      const lang = select && ['ht', 'fr', 'en'].includes(select.value) ? select.value : 'ht';
      const copy = labelsFor(lang);
      dock.querySelector('[data-dock="home"] span').textContent = copy.home;
      dock.querySelector('[data-dock="register"] span').textContent = copy.register;
      dock.querySelector('[data-dock="list"] span').textContent = copy.list;
      dock.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.dock === section));
    };
    update();
    document.getElementById('langSelect')?.addEventListener('change', () => window.setTimeout(update, 0));
  }

  function setupNetworkState() {
    if (!document.body || !document.body.classList.contains('site-v10') || document.querySelector('.dv-network-state')) return;
    const state = document.createElement('div');
    state.className = 'dv-network-state';
    const lang = document.getElementById('langSelect')?.value || 'ht';
    state.innerHTML = `<i></i><span>${labelsFor(lang).offline}</span>`;
    document.body.appendChild(state);
    document.getElementById('langSelect')?.addEventListener('change', (event) => {
      state.querySelector('span').textContent = labelsFor(event.target.value).offline;
    });
  }

  function setupScrollHeader() {
    const header = document.querySelector('.topbar');
    if (!header) return;
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 18);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function setupReveal() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = [...document.querySelectorAll('.network-console,.step-card,.info-card,.control-center,.dashboard-mock,.faq-list details,.register-wrap>.panel,.side-card,.member-directory-panel,.privacy-chip,.vcf-card-v14,.home-cta')];
    if (!elements.length || !('IntersectionObserver' in window)) return;

    elements.forEach((el, index) => {
      el.classList.add('js-reveal');
      el.style.setProperty('--dv-delay', `${Math.min(index % 4, 3) * 55}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    elements.forEach((el) => observer.observe(el));
  }

  function setupListSkeleton() {
    const body = document.getElementById('listBody');
    if (!body || body.children.length) return;
    body.innerHTML = Array.from({ length: 5 }, () => '<tr class="dv-skeleton-row"><td><span class="dv-skeleton-line"></span></td><td><span class="dv-skeleton-line"></span></td></tr>').join('');
  }

  function restoreButtonsAfterBackNavigation(event) {
    if (!event.persisted) return;
    document.querySelectorAll('button[data-label][disabled]').forEach((button) => {
      button.disabled = false;
      if (button.dataset.label) button.textContent = button.dataset.label;
    });
  }

  function updateConnectionState() {
    document.documentElement.classList.toggle('is-offline', !navigator.onLine);
  }

  function setupUi() {
    installHumanAlerts();
    setupMobileDock();
    setupNetworkState();
    setupScrollHeader();
    setupListSkeleton();
    setupReveal();
  }

  loadPremiumCss();
  updateConnectionState();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupUi, { once: true });
  else setupUi();

  window.addEventListener('pageshow', restoreButtonsAfterBackNavigation);
  window.addEventListener('online', updateConnectionState);
  window.addEventListener('offline', updateConnectionState);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
        registration.update().catch(() => {});
      } catch (_) {}
    }, { once: true });
  }

  window.__DOBERTO_NATIVE_ALERT__ = nativeAlert;
})();
