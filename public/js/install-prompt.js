// DOBERTO VCF — Premium install + notification experience
(function () {
  const INSTALL_DELAY_MS = 4600;
  const INSTALL_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 3;
  const NOTIFY_DELAY_AFTER_INSTALL_MS = 9000;
  const NOTIFY_DELAY_NO_INSTALL_MS = 7000;
  const NOTIFY_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7;
  const LS_INSTALL_DISMISSED = 'dv_install_dismissed_until';
  const LS_INSTALLED = 'dv_installed';
  const LS_NOTIFY_DISMISSED = 'dv_notify_dismissed_until';
  const LS_NOTIFY_ENABLED = 'dv_notify_enabled';

  let deferredPrompt = null;
  let installOverlay = null;
  let notifyOverlay = null;
  let notifyTimer = null;

  const COPY = {
    ht: {
      installKicker: 'APP DOBERTO VCF',
      installTitle: 'Kenbe DOBERTO VCF sou telefòn ou',
      installDesc: 'Ajoute l sou ekran akèy ou pou w antre pi vit, san w pa bezwen chèche lyen an chak fwa.',
      installF1: 'Aksè rapid', installF1d: 'Yon sèl touche depi ekran akèy la.',
      installF2: 'Eksperyans app', installF2d: 'Louvri an plen ekran, san dezòd.',
      installF3: 'Toujou ajou', installF3d: 'Nouvo vèsyon yo parèt otomatikman.',
      installTrust: 'Enstalasyon an fèt atravè navigatè a. Pa gen APK ekstèn ni dosye sispèk pou telechaje.',
      installBtn: 'Enstale DOBERTO VCF',
      later: 'Pita',
      ios: 'Sou iPhone: peze bouton Pataje a, epi chwazi “Ajoute sou ekran akèy”.',
      manual: 'Louvri meni navigatè a epi chwazi “Enstale app” oswa “Add to Home Screen”.',
      notifyKicker: 'RETE ENFÒME',
      notifyTitle: 'Aktive notifikasyon',
      notifyDesc: 'Pèmèt DOBERTO VCF voye alèt sou aparèy sa a lè gen enfòmasyon enpòtan sou sèvis la.',
      notifyP1: 'Konnen lè VCF la disponib',
      notifyP2: 'Resevwa mizajou ki enpòtan',
      notifyP3: 'Ou ka dezaktive yo nenpòt lè',
      notifyBtn: 'Aktive notifikasyon',
      notNow: 'Pa kounye a',
      notifyPrivacy: 'Nou pa bezwen nimewo telefòn ou pou mande pèmisyon notifikasyon navigatè a.',
      granted: 'Pèmisyon notifikasyon aktive avèk siksè.',
      denied: 'Navigatè a bloke notifikasyon yo. Ou ka chanje sa pita nan paramèt sit la.',
      unsupported: 'Navigatè sa a pa sipòte notifikasyon web.'
    },
    fr: {
      installKicker: 'APP DOBERTO VCF',
      installTitle: 'Gardez DOBERTO VCF sur votre téléphone',
      installDesc: 'Ajoutez l’application à votre écran d’accueil pour y accéder plus vite, sans rechercher le lien à chaque fois.',
      installF1: 'Accès rapide', installF1d: 'Une seule touche depuis l’écran d’accueil.',
      installF2: 'Expérience app', installF2d: 'Ouverture en plein écran, sans distraction.',
      installF3: 'Toujours à jour', installF3d: 'Les nouvelles versions arrivent automatiquement.',
      installTrust: 'L’installation passe par votre navigateur. Aucun APK externe ni fichier douteux à télécharger.',
      installBtn: 'Installer DOBERTO VCF',
      later: 'Plus tard',
      ios: 'Sur iPhone : touchez Partager, puis choisissez “Sur l’écran d’accueil”.',
      manual: 'Ouvrez le menu du navigateur puis choisissez “Installer l’application” ou “Add to Home Screen”.',
      notifyKicker: 'RESTEZ INFORMÉ',
      notifyTitle: 'Activer les notifications',
      notifyDesc: 'Autorisez DOBERTO VCF à afficher des alertes sur cet appareil lorsqu’une information importante concerne le service.',
      notifyP1: 'Savoir quand le VCF est disponible',
      notifyP2: 'Recevoir les mises à jour importantes',
      notifyP3: 'Désactivation possible à tout moment',
      notifyBtn: 'Activer les notifications',
      notNow: 'Pas maintenant',
      notifyPrivacy: 'Votre numéro de téléphone n’est pas nécessaire pour demander l’autorisation de notification du navigateur.',
      granted: 'Les notifications sont maintenant autorisées.',
      denied: 'Le navigateur a bloqué les notifications. Vous pourrez modifier ce choix dans les paramètres du site.',
      unsupported: 'Ce navigateur ne prend pas en charge les notifications web.'
    },
    en: {
      installKicker: 'DOBERTO VCF APP',
      installTitle: 'Keep DOBERTO VCF on your phone',
      installDesc: 'Add it to your home screen for faster access without looking for the link every time.',
      installF1: 'Quick access', installF1d: 'Open it in one tap from your home screen.',
      installF2: 'App experience', installF2d: 'Runs full-screen with less browser clutter.',
      installF3: 'Always current', installF3d: 'New versions appear automatically.',
      installTrust: 'Installation is handled by your browser. No external APK or suspicious file download is required.',
      installBtn: 'Install DOBERTO VCF',
      later: 'Later',
      ios: 'On iPhone: tap Share, then choose “Add to Home Screen”.',
      manual: 'Open your browser menu and choose “Install app” or “Add to Home Screen”.',
      notifyKicker: 'STAY INFORMED',
      notifyTitle: 'Turn on notifications',
      notifyDesc: 'Allow DOBERTO VCF to show alerts on this device when important service information is available.',
      notifyP1: 'Know when the VCF is available',
      notifyP2: 'Receive important updates',
      notifyP3: 'Turn them off anytime',
      notifyBtn: 'Turn on notifications',
      notNow: 'Not now',
      notifyPrivacy: 'Your phone number is not needed to request browser notification permission.',
      granted: 'Notification permission is now enabled.',
      denied: 'Your browser blocked notifications. You can change this later in the site settings.',
      unsupported: 'This browser does not support web notifications.'
    }
  };

  function language() {
    const el = document.getElementById('langSelect');
    return el && COPY[el.value] ? el.value : 'ht';
  }
  function c() { return COPY[language()]; }

  function injectPremiumStyles() {
    if (document.querySelector('link[data-dv-prompts]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/prompt-premium.css?v=20260825-1';
    link.dataset.dvPrompts = '1';
    document.head.appendChild(link);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  function installHandled() {
    if (isStandalone() || localStorage.getItem(LS_INSTALLED) === '1') return true;
    const until = parseInt(localStorage.getItem(LS_INSTALL_DISMISSED) || '0', 10);
    return Date.now() < until;
  }
  function notificationsHandled() {
    if (!('Notification' in window)) return true;
    if (Notification.permission !== 'default') return true;
    if (localStorage.getItem(LS_NOTIFY_ENABLED) === '1') return true;
    const until = parseInt(localStorage.getItem(LS_NOTIFY_DISMISSED) || '0', 10);
    return Date.now() < until;
  }
  function uiBusy(ignoreInstall) {
    const tourOpen = !!document.querySelector('.tour-scrim.show');
    const installOpen = !ignoreInstall && !!document.querySelector('.install-overlay.show');
    const notifyOpen = !!document.querySelector('.notify-overlay.show');
    return tourOpen || installOpen || notifyOpen;
  }

  function svg(name) {
    const icons = {
      home: '<path d="M12 3 3 10.5V21h7v-6h4v6h7V10.5L12 3Z"/>',
      screen: '<path d="M4 4h6v2H6v4H4V4Zm10 0h6v6h-2V6h-4V4ZM4 14h2v4h4v2H4v-6Zm14 0h2v6h-6v-2h4v-4Z"/>',
      refresh: '<path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7a5 5 0 1 1-4.58 7H4.26A8 8 0 1 0 17.65 6.35Z"/>',
      shield: '<path d="M12 2 4 5v6c0 5.05 3.41 9.74 8 11 4.59-1.26 8-5.95 8-11V5l-8-3Zm-1 14-4-4 1.41-1.41L11 13.17l4.59-4.58L17 10l-6 6Z"/>',
      download: '<path d="M11 3h2v10.17l3.59-3.58L18 11l-6 6-6-6 1.41-1.41L11 13.17V3ZM5 19h14v2H5v-2Z"/>',
      bell: '<path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6v-5a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z"/>',
      check: '<path d="m9.2 16.6-4.1-4.1L3.7 14l5.5 5.5L20.3 8.4 18.9 7l-9.7 9.6Z"/>',
      clock: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 11h-5V11h3V6h2v7Z"/>',
      privacy: '<path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm0 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm4 9H8v-1c0-1.7 2.7-2.5 4-2.5s4 .8 4 2.5v1Z"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.check}</svg>`;
  }

  function buildInstallCard() {
    installOverlay = document.getElementById('installOverlay');
    if (!installOverlay) return;
    const x = c();
    installOverlay.innerHTML = `
      <div class="install-card" role="dialog" aria-modal="true" aria-labelledby="dvInstallTitle">
        <div class="install-handle"></div>
        <button class="install-close" id="installClose" type="button" aria-label="Close">✕</button>
        <div class="prompt-top">
          <img class="prompt-brand" src="icons/brand-mark.svg" alt="DOBERTO VCF" width="64" height="64">
          <div class="prompt-meta"><div class="prompt-kicker" id="installKicker">${x.installKicker}</div><h2 id="dvInstallTitle">${x.installTitle}</h2></div>
        </div>
        <p class="install-desc" id="installDescription">${x.installDesc}</p>
        <div class="prompt-features">
          <div class="prompt-feature"><span class="prompt-feature-icon">${svg('home')}</span><strong id="if1">${x.installF1}</strong><span id="if1d">${x.installF1d}</span></div>
          <div class="prompt-feature"><span class="prompt-feature-icon">${svg('screen')}</span><strong id="if2">${x.installF2}</strong><span id="if2d">${x.installF2d}</span></div>
          <div class="prompt-feature"><span class="prompt-feature-icon">${svg('refresh')}</span><strong id="if3">${x.installF3}</strong><span id="if3d">${x.installF3d}</span></div>
        </div>
        <div class="prompt-trust">${svg('shield')}<span id="installTrust">${x.installTrust}</span></div>
        <div class="prompt-status" id="installStatus"></div>
        <div class="prompt-actions">
          <button class="install-btn" id="installActionBtn" type="button">${svg('download')}<span id="installBtnText">${x.installBtn}</span></button>
          <button class="install-later" id="installLater" type="button"><span id="installLaterText">${x.later}</span></button>
        </div>
      </div>`;

    document.getElementById('installActionBtn').addEventListener('click', handleInstallClick);
    document.getElementById('installLater').addEventListener('click', dismissInstall);
    document.getElementById('installClose').addEventListener('click', dismissInstall);
    installOverlay.addEventListener('click', (e) => { if (e.target === installOverlay) dismissInstall(); });
  }

  function refreshInstallCopy() {
    if (!installOverlay) return;
    const x = c();
    const map = {
      installKicker: x.installKicker, dvInstallTitle: x.installTitle, installDescription: x.installDesc,
      if1: x.installF1, if1d: x.installF1d, if2: x.installF2, if2d: x.installF2d,
      if3: x.installF3, if3d: x.installF3d, installTrust: x.installTrust,
      installBtnText: x.installBtn, installLaterText: x.later
    };
    Object.entries(map).forEach(([id, text]) => { const el = document.getElementById(id); if (el) el.textContent = text; });
  }

  function showInstallWhenCalm() {
    if (!installOverlay || installHandled()) {
      scheduleNotification(NOTIFY_DELAY_NO_INSTALL_MS);
      return;
    }
    if (uiBusy(true)) {
      setTimeout(showInstallWhenCalm, 1000);
      return;
    }
    refreshInstallCopy();
    installOverlay.hidden = false;
    requestAnimationFrame(() => installOverlay.classList.add('show'));
  }
  function hideInstall() {
    if (!installOverlay) return;
    installOverlay.classList.remove('show');
    setTimeout(() => { installOverlay.hidden = true; }, 300);
  }
  function dismissInstall() {
    localStorage.setItem(LS_INSTALL_DISMISSED, String(Date.now() + INSTALL_COOLDOWN_MS));
    hideInstall();
    scheduleNotification(NOTIFY_DELAY_AFTER_INSTALL_MS);
  }

  function setInstallStatus(text, warning) {
    const el = document.getElementById('installStatus');
    if (!el) return;
    el.textContent = text;
    el.className = 'prompt-status show' + (warning ? ' warn' : '');
  }

  async function handleInstallClick() {
    const x = c();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => null);
      deferredPrompt = null;
      if (choice && choice.outcome === 'accepted') {
        localStorage.setItem(LS_INSTALLED, '1');
        hideInstall();
        scheduleNotification(3000);
      } else {
        localStorage.setItem(LS_INSTALL_DISMISSED, String(Date.now() + INSTALL_COOLDOWN_MS));
        hideInstall();
        scheduleNotification(NOTIFY_DELAY_AFTER_INSTALL_MS);
      }
      return;
    }
    if (isIOS()) {
      setInstallStatus(x.ios, false);
      return;
    }
    setInstallStatus(x.manual, false);
  }

  function buildNotificationOverlay() {
    if (document.getElementById('notifyOverlay')) return document.getElementById('notifyOverlay');
    const x = c();
    const overlay = document.createElement('div');
    overlay.className = 'notify-overlay';
    overlay.id = 'notifyOverlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="notify-card" role="dialog" aria-modal="true" aria-labelledby="dvNotifyTitle">
        <button class="notify-close" id="notifyClose" type="button" aria-label="Close">✕</button>
        <div class="prompt-top">
          <div class="notify-bell">${svg('bell')}</div>
          <div class="prompt-meta"><div class="prompt-kicker" id="notifyKicker">${x.notifyKicker}</div><h2 id="dvNotifyTitle">${x.notifyTitle}</h2></div>
        </div>
        <p class="notify-desc" id="notifyDescription">${x.notifyDesc}</p>
        <div class="notify-points">
          <div class="notify-point">${svg('check')}<span id="np1">${x.notifyP1}</span></div>
          <div class="notify-point">${svg('clock')}<span id="np2">${x.notifyP2}</span></div>
          <div class="notify-point">${svg('privacy')}<span id="np3">${x.notifyP3}</span></div>
        </div>
        <div class="prompt-status" id="notifyStatus"></div>
        <div class="prompt-actions">
          <button class="notify-btn" id="notifyEnable" type="button">${svg('bell')}<span id="notifyBtnText">${x.notifyBtn}</span></button>
          <button class="notify-later" id="notifyLater" type="button"><span id="notifyLaterText">${x.notNow}</span></button>
        </div>
        <div class="notify-privacy" id="notifyPrivacy">${x.notifyPrivacy}</div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) dismissNotification(); });
    document.getElementById('notifyClose').addEventListener('click', dismissNotification);
    document.getElementById('notifyLater').addEventListener('click', dismissNotification);
    document.getElementById('notifyEnable').addEventListener('click', enableNotifications);
    return overlay;
  }

  function refreshNotificationCopy() {
    if (!notifyOverlay) return;
    const x = c();
    const map = {
      notifyKicker: x.notifyKicker, dvNotifyTitle: x.notifyTitle, notifyDescription: x.notifyDesc,
      np1: x.notifyP1, np2: x.notifyP2, np3: x.notifyP3, notifyBtnText: x.notifyBtn,
      notifyLaterText: x.notNow, notifyPrivacy: x.notifyPrivacy
    };
    Object.entries(map).forEach(([id, text]) => { const el = document.getElementById(id); if (el) el.textContent = text; });
  }

  function scheduleNotification(delay) {
    clearTimeout(notifyTimer);
    if (notificationsHandled()) return;
    notifyTimer = setTimeout(showNotificationWhenCalm, delay);
  }
  function showNotificationWhenCalm() {
    if (notificationsHandled()) return;
    if (uiBusy(false)) {
      notifyTimer = setTimeout(showNotificationWhenCalm, 1200);
      return;
    }
    notifyOverlay = buildNotificationOverlay();
    refreshNotificationCopy();
    notifyOverlay.hidden = false;
    requestAnimationFrame(() => notifyOverlay.classList.add('show'));
  }
  function hideNotification() {
    if (!notifyOverlay) return;
    notifyOverlay.classList.remove('show');
    setTimeout(() => { notifyOverlay.hidden = true; }, 300);
  }
  function dismissNotification() {
    localStorage.setItem(LS_NOTIFY_DISMISSED, String(Date.now() + NOTIFY_COOLDOWN_MS));
    hideNotification();
  }
  function setNotifyStatus(text, warning) {
    const el = document.getElementById('notifyStatus');
    if (!el) return;
    el.textContent = text;
    el.className = 'prompt-status show' + (warning ? ' warn' : '');
  }

  async function enableNotifications() {
    const x = c();
    if (!('Notification' in window)) {
      setNotifyStatus(x.unsupported, true);
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem(LS_NOTIFY_ENABLED, '1');
        setNotifyStatus(x.granted, false);
        try {
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification('DOBERTO VCF', {
              body: x.granted,
              icon: 'icons/icon-192.png',
              badge: 'icons/icon-192.png',
              tag: 'doberto-vcf-enabled',
              renotify: false
            });
          }
        } catch (_) { /* permission itself is the important result */ }
        setTimeout(hideNotification, 1100);
      } else {
        localStorage.setItem(LS_NOTIFY_DISMISSED, String(Date.now() + NOTIFY_COOLDOWN_MS));
        setNotifyStatus(x.denied, true);
      }
    } catch (_) {
      setNotifyStatus(x.denied, true);
    }
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
  window.addEventListener('appinstalled', () => {
    localStorage.setItem(LS_INSTALLED, '1');
    hideInstall();
    scheduleNotification(3000);
  });

  function init() {
    injectPremiumStyles();
    buildInstallCard();
    const select = document.getElementById('langSelect');
    if (select) select.addEventListener('change', () => {
      refreshInstallCopy();
      refreshNotificationCopy();
    });
    setTimeout(showInstallWhenCalm, INSTALL_DELAY_MS);
    if (installHandled()) scheduleNotification(NOTIFY_DELAY_NO_INSTALL_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
