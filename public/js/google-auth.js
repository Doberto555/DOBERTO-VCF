(function () {
  'use strict';

  const TOKEN_KEY = 'dv_auth_token';
  const OAUTH_STATE_KEY = 'dv_google_oauth_state';
  const OAUTH_FLOW_KEY = 'dv_google_oauth_flow';
  let session = null;
  let oauthBusy = false;
  let syncStatusBusy = false;

  function storageGet(storage, key) {
    try { return storage.getItem(key) || ''; } catch (_) { return ''; }
  }

  function storageSet(storage, key, value) {
    try { storage.setItem(key, value || ''); } catch (_) {}
  }

  function storageRemove(storage, key) {
    try { storage.removeItem(key); } catch (_) {}
  }

  function token() {
    return storageGet(localStorage, TOKEN_KEY);
  }

  function authHeaders(json) {
    const headers = json ? { 'Content-Type': 'application/json' } : {};
    const currentToken = token();
    if (currentToken) headers.Authorization = `Bearer ${currentToken}`;
    return headers;
  }

  function cleanOAuthQuery() {
    try {
      const url = new URL(location.href);
      ['code', 'state', 'scope', 'authuser', 'prompt', 'hd', 'iss', 'error', 'error_description'].forEach((key) => url.searchParams.delete(key));
      history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch (_) {}
  }

  function oauthStoreGet(key) {
    return storageGet(sessionStorage, key) || storageGet(localStorage, key);
  }

  function oauthStoreSet(key, value) {
    storageSet(sessionStorage, key, value);
    storageSet(localStorage, key, value);
  }

  function oauthStoreRemove(key) {
    storageRemove(sessionStorage, key);
    storageRemove(localStorage, key);
  }

  function setBusy(button, busy, label) {
    if (!button) return;
    if (!button.dataset.label) button.dataset.label = button.textContent.trim();
    button.disabled = busy;
    button.textContent = busy ? label : button.dataset.label;
  }

  async function startGoogleFlow(flow) {
    if (oauthBusy) return;
    oauthBusy = true;

    const button = flow === 'contacts' ? document.getElementById('googleConnectBtn') : document.getElementById('googleLoginBtn');
    setBusy(button, true, 'Tanpri tann...');

    try {
      const response = await fetch(`/api/auth/google/url?flow=${encodeURIComponent(flow)}`, {
        headers: authHeaders(false),
        cache: 'no-store'
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) throw new Error(data.error || 'Google OAuth pa disponib.');

      const state = new URL(data.url).searchParams.get('state');
      oauthStoreSet(OAUTH_STATE_KEY, state || '');
      oauthStoreSet(OAUTH_FLOW_KEY, flow);
      location.assign(data.url);
    } catch (error) {
      oauthBusy = false;
      setBusy(button, false);
      alert(error && error.message ? error.message : 'Koneksyon Google la pa mache.');
    }
  }

  async function finishGoogleFlow(code, state) {
    const flowHint = oauthStoreGet(OAUTH_FLOW_KEY) || 'login';
    const response = await fetch('/api/auth/google/callback', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ code, state })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Google authorization lan pa t fini.');

    oauthStoreRemove(OAUTH_STATE_KEY);
    oauthStoreRemove(OAUTH_FLOW_KEY);
    cleanOAuthQuery();
    oauthBusy = false;

    const resolvedFlow = data.flow || flowHint;
    if (resolvedFlow === 'login') {
      if (!data.token) throw new Error('Google login lan pa retounen yon sesyon valid.');
      storageSet(localStorage, TOKEN_KEY, data.token);
      session = data;
      if (data.registered) {
        storageSet(localStorage, 'dv_registered', '1');
        storageSet(localStorage, 'dv_member_name', (data.registration && data.registration.name) || (data.user && data.user.name) || '');
        storageSet(localStorage, 'dv_member_dial', (data.registration && data.registration.dial_code) || '');
        storageSet(localStorage, 'dv_member_phone', (data.registration && data.registration.phone) || '');
      }
      return data;
    }

    await loadSyncStatus();
    alert(`Google Contacts konekte. ${(data.sync && data.sync.created) || 0} kontak senkronize.`);
    return data;
  }

  async function loadSession() {
    if (!token()) return null;

    try {
      const response = await fetch('/api/auth/session', { headers: authHeaders(false), cache: 'no-store' });
      if (!response.ok) {
        storageRemove(localStorage, TOKEN_KEY);
        storageRemove(localStorage, 'dv_registered');
        return null;
      }

      session = await response.json();
      if (session.registered) {
        storageSet(localStorage, 'dv_registered', '1');
        if (session.registration) {
          storageSet(localStorage, 'dv_member_name', session.registration.name || '');
          storageSet(localStorage, 'dv_member_dial', session.registration.dial_code || '');
          storageSet(localStorage, 'dv_member_phone', session.registration.phone || '');
        }
      }
      return session;
    } catch (_) {
      return session;
    }
  }

  function renderSession() {
    const gate = document.getElementById('googleAuthGate');
    const account = document.getElementById('googleAccountBar');
    const form = document.getElementById('regForm');
    const syncPanel = document.getElementById('googleSyncPanel');
    const alreadyLink = document.getElementById('alreadyRegisteredLink');
    if (!gate && !account && !form && !syncPanel) return;

    if (!session || !session.user) {
      if (gate) gate.hidden = false;
      if (account) account.hidden = true;
      if (form) form.hidden = true;
      if (syncPanel) syncPanel.hidden = true;
      if (alreadyLink && alreadyLink.parentElement) alreadyLink.parentElement.hidden = false;
      return;
    }

    if (gate) gate.hidden = true;
    if (account) account.hidden = false;

    const avatar = document.getElementById('googleAvatar');
    if (avatar) {
      avatar.src = session.user.avatarUrl || 'icons/doberto-vcf-192.png';
      avatar.alt = session.user.name || '';
      avatar.onerror = () => {
        avatar.onerror = null;
        avatar.src = 'icons/doberto-vcf-192.png';
      };
    }

    const nameEl = document.getElementById('googleName');
    const emailEl = document.getElementById('googleEmail');
    if (nameEl) nameEl.textContent = session.user.name || '';
    if (emailEl) emailEl.textContent = session.user.email || '';

    if (form) form.hidden = Boolean(session.registered);
    if (alreadyLink && alreadyLink.parentElement) alreadyLink.parentElement.hidden = true;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    if (nameInput && !nameInput.value) nameInput.value = (session.registration && session.registration.name) || session.user.name || '';
    if (emailInput) emailInput.value = session.user.email || '';
    if (syncPanel) syncPanel.hidden = !session.registered;
  }

  async function loadSyncStatus() {
    if (!session || !session.registered || syncStatusBusy) return;
    syncStatusBusy = true;

    const statusEl = document.getElementById('googleSyncStatus');
    try {
      const response = await fetch('/api/google/status', { headers: authHeaders(false), cache: 'no-store' });
      if (!response.ok) {
        if (response.status === 401) {
          storageRemove(localStorage, TOKEN_KEY);
          session = null;
          renderSession();
        }
        return;
      }

      const status = await response.json();
      const connectBtn = document.getElementById('googleConnectBtn');
      const syncBtn = document.getElementById('googleSyncNowBtn');
      const autoWrap = document.getElementById('googleAutoSyncWrap');
      const autoInput = document.getElementById('googleAutoSync');

      if (connectBtn) connectBtn.textContent = status.connected ? 'Rekonekte Google Contacts' : 'Konekte Google Contacts';
      if (syncBtn) syncBtn.hidden = !status.connected;
      if (autoWrap) autoWrap.hidden = !status.connected;
      if (autoInput) autoInput.checked = Boolean(status.autoSync);

      if (statusEl) {
        if (!status.connected) statusEl.textContent = 'Google Contacts poko konekte.';
        else if (status.lastError) statusEl.textContent = `Dènye sync la gen yon pwoblèm: ${status.lastError}`;
        else if (status.lastSyncedAt) statusEl.textContent = `Dènye senkronizasyon: ${new Date(status.lastSyncedAt).toLocaleString()}`;
        else statusEl.textContent = 'Google Contacts konekte. Premye senkronizasyon an pare.';
      }
    } catch (_) {
      if (statusEl && !navigator.onLine) statusEl.textContent = 'Pa gen koneksyon entènèt kounye a. Sync la ap retounen lè koneksyon an disponib.';
    } finally {
      syncStatusBusy = false;
    }
  }

  async function syncNow() {
    const button = document.getElementById('googleSyncNowBtn');
    setBusy(button, true, 'Senkronizasyon...');
    try {
      const response = await fetch('/api/google/sync', {
        method: 'POST',
        headers: authHeaders(true),
        body: '{}'
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 409 && data.code === 'google_contacts_required') {
        setBusy(button, false);
        return startGoogleFlow('contacts');
      }
      if (!response.ok) throw new Error(data.error || 'Senkronizasyon an pa mache.');
      await loadSyncStatus();
      alert(`${(data.sync && data.sync.created) || 0} nouvo kontak ajoute nan Google Contacts ou.`);
    } catch (error) {
      alert(error && error.message ? error.message : 'Senkronizasyon an pa mache.');
    } finally {
      setBusy(button, false);
    }
  }

  async function toggleAutoSync(event) {
    const input = event.currentTarget;
    input.disabled = true;
    try {
      const response = await fetch('/api/google/auto-sync', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ enabled: input.checked })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Auto-Sync pa ka modifye.');
    } catch (error) {
      input.checked = !input.checked;
      alert(error && error.message ? error.message : 'Auto-Sync pa ka modifye.');
    } finally {
      input.disabled = false;
    }
  }

  async function boot() {
    document.getElementById('googleLoginBtn')?.addEventListener('click', () => startGoogleFlow('login'));
    document.getElementById('alreadyRegisteredLink')?.addEventListener('click', (event) => {
      event.preventDefault();
      startGoogleFlow('login');
    });
    document.getElementById('googleConnectBtn')?.addEventListener('click', () => startGoogleFlow('contacts'));
    document.getElementById('googleSyncNowBtn')?.addEventListener('click', syncNow);
    document.getElementById('googleAutoSync')?.addEventListener('change', toggleAutoSync);
    document.getElementById('googleLogoutBtn')?.addEventListener('click', () => {
      [TOKEN_KEY, 'dv_registered', 'dv_member_name', 'dv_member_dial', 'dv_member_phone'].forEach((key) => storageRemove(localStorage, key));
      [OAUTH_STATE_KEY, OAUTH_FLOW_KEY].forEach(oauthStoreRemove);
      session = null;
      location.replace('/register.html');
    });

    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    const oauthError = params.get('error');

    try {
      if (oauthError) throw new Error(params.get('error_description') || 'Google pa t bay otorizasyon an.');
      if (code && state) await finishGoogleFlow(code, state);
      if (!session) await loadSession();
    } catch (error) {
      oauthBusy = false;
      [OAUTH_STATE_KEY, OAUTH_FLOW_KEY].forEach(oauthStoreRemove);
      cleanOAuthQuery();
      alert(error && error.message ? error.message : 'Koneksyon Google la pa t fini.');
    }

    renderSession();
    await loadSyncStatus();
  }

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    oauthBusy = false;
    renderSession();
    loadSyncStatus().catch(() => {});
  });

  window.addEventListener('online', () => {
    if (session && session.registered) loadSyncStatus().catch(() => {});
  });

  window.DobertoGoogle = {
    authHeaders,
    currentSession: () => session,
    registrationCompleted(registration) {
      if (!session) return;
      session.registered = true;
      session.registration = registration || null;
      storageSet(localStorage, 'dv_registered', '1');
      if (registration) {
        storageSet(localStorage, 'dv_member_name', registration.name || '');
        storageSet(localStorage, 'dv_member_dial', registration.dial_code || '');
        storageSet(localStorage, 'dv_member_phone', registration.phone || '');
      }
      renderSession();
      loadSyncStatus().catch(() => {});
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
