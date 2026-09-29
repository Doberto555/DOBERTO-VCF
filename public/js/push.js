// DOBERTO VCF — OneSignal Web Push integration (real server-sent notifications)
(function () {
  const state = {
    status: 'loading',
    configured: null,
    subscribed: false,
    appId: null,
    error: null,
    instance: null
  };

  let resolveReady;
  const ready = new Promise((resolve) => { resolveReady = resolve; });

  function emit() {
    window.dispatchEvent(new CustomEvent('doberto:pushchange', { detail: { ...state, instance: undefined } }));
  }

  function sync(OneSignal) {
    try {
      state.subscribed = Boolean(
        OneSignal &&
        OneSignal.Notifications && OneSignal.Notifications.permission &&
        OneSignal.User && OneSignal.User.PushSubscription && OneSignal.User.PushSubscription.optedIn
      );
    } catch (_) {
      state.subscribed = false;
    }
    emit();
  }

  async function requestPermission() {
    await ready;

    if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
      return { ok: false, configured: Boolean(state.configured), reason: 'denied' };
    }

    if (!state.configured) {
      return { ok: false, configured: false, reason: 'not_configured', error: state.error || null };
    }

    if (!state.instance) {
      return {
        ok: false,
        configured: true,
        reason: state.status === 'error' ? 'sdk_error' : 'sdk_not_ready',
        error: state.error || null
      };
    }

    try {
      const OneSignal = state.instance;
      if (!OneSignal.Notifications.isPushSupported()) {
        return { ok: false, configured: true, reason: 'unsupported' };
      }

      await OneSignal.Notifications.requestPermission();

      if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        return { ok: false, configured: true, reason: 'denied' };
      }

      if (OneSignal.Notifications.permission) {
        await OneSignal.User.PushSubscription.optIn();
      }

      sync(OneSignal);

      return {
        ok: Boolean(OneSignal.Notifications.permission && OneSignal.User.PushSubscription.optedIn),
        configured: true,
        reason: OneSignal.User.PushSubscription.optedIn ? 'subscribed' : 'not_subscribed',
        permission: Boolean(OneSignal.Notifications.permission),
        browserPermission: typeof Notification !== 'undefined' ? Notification.permission : 'unknown',
        subscribed: Boolean(OneSignal.User.PushSubscription.optedIn),
        subscriptionId: OneSignal.User.PushSubscription.id || null
      };
    } catch (error) {
      state.error = String(error && error.message || error);
      emit();
      return {
        ok: false,
        configured: true,
        reason: 'error',
        error: state.error,
        browserPermission: typeof Notification !== 'undefined' ? Notification.permission : 'unknown'
      };
    }
  }

  async function optOut() {
    await ready;
    if (!state.instance) return false;
    try {
      await state.instance.User.PushSubscription.optOut();
      sync(state.instance);
      return true;
    } catch (_) {
      return false;
    }
  }

  window.DobertoPush = {
    state,
    ready,
    requestPermission,
    optOut,
    isSubscribed: () => Boolean(state.subscribed),
    isConfigured: () => state.configured === true
  };

  async function init() {
    try {
      const response = await fetch('/api/push/config', { cache: 'no-store', credentials: 'same-origin' });
      const config = await response.json();
      if (!response.ok || !config.enabled || !config.appId) {
        state.status = 'disabled';
        state.configured = false;
        resolveReady(state);
        emit();
        return;
      }

      state.configured = true;
      state.appId = config.appId;
      window.OneSignalDeferred = window.OneSignalDeferred || [];

      window.OneSignalDeferred.push(async function (OneSignal) {
        try {
          await OneSignal.init({
            appId: config.appId,
            serviceWorkerPath: config.workerPath || 'push/onesignal/OneSignalSDKWorker.js',
            serviceWorkerParam: { scope: config.workerScope || '/push/onesignal/' },
            notifyButton: { enable: false },
            autoResubscribe: true,
            allowLocalhostAsSecureOrigin: true
          });

          state.instance = OneSignal;
          state.status = 'ready';
          sync(OneSignal);

          try {
            OneSignal.User.PushSubscription.addEventListener('change', () => sync(OneSignal));
            OneSignal.Notifications.addEventListener('permissionChange', () => sync(OneSignal));
          } catch (_) {}

          resolveReady(state);
          emit();
        } catch (error) {
          state.status = 'error';
          state.error = String(error && error.message || error);
          resolveReady(state);
          emit();
        }
      });

      const sdk = document.createElement('script');
      sdk.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      sdk.defer = true;
      sdk.async = true;
      sdk.onerror = () => {
        state.status = 'error';
        state.error = 'onesignal_sdk_load_failed';
        resolveReady(state);
        emit();
      };
      document.head.appendChild(sdk);
    } catch (error) {
      state.status = 'error';
      state.configured = false;
      state.error = String(error && error.message || error);
      resolveReady(state);
      emit();
    }
  }

  init();
})();
