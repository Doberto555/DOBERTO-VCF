(() => {
  'use strict';

  const COPY = {
    ht: {
      title1: 'Bati rezo WhatsApp ou',
      title2: 'Otomatikman',
      howTitle: 'Twa etap nan kèk segond',
      whyTitle: 'Fèt pou grandi epi rete senp'
    },
    fr: {
      title1: 'Développez votre réseau WhatsApp',
      title2: 'Automatiquement',
      howTitle: 'Trois étapes en quelques secondes',
      whyTitle: 'Conçu pour grandir et rester simple'
    },
    en: {
      title1: 'Build your WhatsApp network',
      title2: 'Automatically',
      howTitle: 'Three steps in seconds',
      whyTitle: 'Built to grow and stay simple'
    }
  };

  function currentLang() {
    const select = document.getElementById('langSelect');
    if (select && COPY[select.value]) return select.value;
    try {
      const saved = localStorage.getItem('doberto_lang');
      if (COPY[saved]) return saved;
    } catch (_) {}
    return 'ht';
  }

  function apply() {
    if (!document.body || !document.body.classList.contains('home-page')) return;
    const copy = COPY[currentLang()];
    const nodes = {
      title1: document.querySelector('[data-home-key="title1"]'),
      title2: document.querySelector('[data-home-key="title2"]'),
      howTitle: document.querySelector('[data-home-key="howTitle"]'),
      whyTitle: document.querySelector('[data-home-key="whyTitle"]')
    };
    Object.entries(nodes).forEach(([key, node]) => {
      if (node && node.textContent !== copy[key]) node.textContent = copy[key];
    });
  }

  function boot() {
    apply();
    document.getElementById('langSelect')?.addEventListener('change', () => {
      window.setTimeout(apply, 40);
      window.setTimeout(apply, 180);
    });
    window.addEventListener('pageshow', apply);

    const targets = [
      document.querySelector('[data-home-key="title1"]'),
      document.querySelector('[data-home-key="title2"]'),
      document.querySelector('[data-home-key="howTitle"]'),
      document.querySelector('[data-home-key="whyTitle"]')
    ].filter(Boolean);
    if (targets.length && 'MutationObserver' in window) {
      const observer = new MutationObserver(() => window.setTimeout(apply, 0));
      targets.forEach((node) => observer.observe(node, { childList: true, characterData: true, subtree: true }));
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
