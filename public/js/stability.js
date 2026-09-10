(() => {
  'use strict';

  if (window.__DOBERTO_STABILITY__) return;
  window.__DOBERTO_STABILITY__ = true;

  const nativeFetch = window.fetch.bind(window);
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

  window.addEventListener('pageshow', restoreButtonsAfterBackNavigation);
  window.addEventListener('online', updateConnectionState);
  window.addEventListener('offline', updateConnectionState);
  updateConnectionState();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
        registration.update().catch(() => {});
      } catch (_) {}
    }, { once: true });
  }
})();
