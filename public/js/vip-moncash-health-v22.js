(() => {
  'use strict';
  if (window.__DV_MONCASH_HEALTH_V22__) return;
  window.__DV_MONCASH_HEALTH_V22__ = true;

  // MonCash can return directly with transactionId/orderId depending on the merchant
  // Return URL. Normalize that callback so vip.js verifies the payment automatically.
  try {
    const url = new URL(window.location.href);
    const hasReturnReference = Boolean(
      url.searchParams.get('transactionId') || url.searchParams.get('orderId')
    );
    if (hasReturnReference && url.searchParams.get('moncash') !== 'return') {
      url.searchParams.set('moncash', 'return');
      history.replaceState({}, '', `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
    }
  } catch (_) {}

  const COPY = {
    ht: {
      setup: 'Konfigirasyon an ap fèt',
      unavailable: 'MonCash pa disponib pou kounye a'
    },
    fr: {
      setup: 'Configuration en cours',
      unavailable: 'MonCash est temporairement indisponible'
    },
    en: {
      setup: 'Setup in progress',
      unavailable: 'MonCash is temporarily unavailable'
    }
  };

  let ready = null;
  let reason = 'setup';

  const lang = () => {
    const select = document.getElementById('langSelect');
    if (select && COPY[select.value]) return select.value;
    try {
      const saved = localStorage.getItem('doberto_lang');
      if (COPY[saved]) return saved;
    } catch (_) {}
    return 'ht';
  };

  const statusCopy = () => {
    const selected = COPY[lang()] || COPY.ht;
    return selected[reason] || selected.unavailable;
  };

  function apply() {
    if (ready !== false) return;

    const method = document.querySelector('#vipMethods [data-method="moncash"]');
    if (method) {
      method.disabled = true;
      method.classList.add('disabled', 'moncash-not-ready');
      method.setAttribute('aria-disabled', 'true');
      const status = method.querySelector('small');
      if (status) status.textContent = statusCopy();
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
      ready = Boolean(
        response.ok &&
        data.configured === true &&
        data.authenticated === true
      );
      reason = data.configured === true ? 'unavailable' : 'setup';
      apply();
    } catch (_) {
      ready = false;
      reason = 'unavailable';
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
