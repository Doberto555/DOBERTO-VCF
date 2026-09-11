(() => {
  'use strict';
  if (window.__DV_MONCASH_HEALTH_V22__) return;
  window.__DV_MONCASH_HEALTH_V22__ = true;

  const COPY = {
    ht: 'Konfigirasyon an ap fèt',
    fr: 'Configuration en cours',
    en: 'Setup in progress'
  };

  let configured = null;
  const lang = () => {
    const select = document.getElementById('langSelect');
    if (select && COPY[select.value]) return select.value;
    try {
      const saved = localStorage.getItem('doberto_lang');
      if (COPY[saved]) return saved;
    } catch (_) {}
    return 'ht';
  };

  function apply() {
    if (configured !== false) return;
    const method = document.querySelector('#vipMethods [data-method="moncash"]');
    if (method) {
      method.disabled = true;
      method.classList.add('disabled', 'moncash-not-ready');
      method.setAttribute('aria-disabled', 'true');
      const status = method.querySelector('small');
      if (status) status.textContent = COPY[lang()] || COPY.ht;
    }

    const payButton = document.getElementById('startMoncashVip');
    if (payButton) payButton.hidden = true;

    if (method && method.classList.contains('selected')) {
      const fallback = [...document.querySelectorAll('#vipMethods [data-method]')]
        .find(el => el.dataset.method !== 'moncash' && !el.disabled);
      if (fallback) fallback.click();
    }
  }

  async function check() {
    try {
      const response = await fetch('/api/vip-moncash-health', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      configured = Boolean(response.ok && data.configured === true);
      apply();
    } catch (_) {
      configured = false;
      apply();
    }
  }

  const root = document.getElementById('vipMethods');
  if (root && 'MutationObserver' in window) {
    new MutationObserver(apply).observe(root, { childList: true, subtree: true });
  }

  document.getElementById('langSelect')?.addEventListener('change', () => setTimeout(apply, 0));
  window.addEventListener('pageshow', () => { apply(); check(); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check, { once: true });
  } else {
    check();
  }
})();
