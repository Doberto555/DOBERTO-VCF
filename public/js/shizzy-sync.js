/* DOBERTO VCF — sync kontak nan Google Contacts via Shizzy Connect.
   Kle API a pa janm nan navigatè a: tout apèl pase sou /api/shizzy/* (sèvè a). */
(function () {
  'use strict';

  var TOKEN_KEY = 'dv_auth_token';
  var POLL_MS = 4000;
  var POLL_MAX = 75; // ~5 minit

  var T = {
    ht: {
      kicker: 'GOOGLE CONTACTS',
      title: 'Sinkronize kontak yo nan Google',
      desc: 'Konekte Google Contacts ou atravè Shizzy Connect, epi manm yo ap ajoute otomatikman nan telefòn ou.',
      connect: 'Konekte Google Contacts',
      sync: 'Sinkronize kontak yo',
      resync: 'Resinkronize',
      onMsg: '✓ Google Contacts konekte. Peze Resinkronize pou ajoute nouvo manm yo.',
      lastSync: '✓ Dènye sync fini',
      disconnect: 'Dekonekte',
      confirmDisconnect: 'Ou sèten ou vle dekonekte Google Contacts epi netwaye kontak yo?',
      stNone: 'PA KONEKTE', stOn: 'KONEKTE', stReauth: 'RKONEKTE',
      reauth: 'Aksè Google la ekspire. Konekte ankò.',
      redirecting: 'Ap louvri Google...',
      syncing: 'Sync ap kouri... sa ka pran kèk minit.',
      done: 'Sync fini', created: 'ajoute', updated: 'mete ajou', failed: 'echwe',
      timeout: 'Sync lan ap kontinye an background. Tcheke ankò pita.',
      disconnected: 'Google Contacts dekonekte.',
      err: 'Erè. Eseye ankò.'
    },
    fr: {
      kicker: 'GOOGLE CONTACTS',
      title: 'Synchroniser les contacts avec Google',
      desc: 'Connectez vos Google Contacts via Shizzy Connect : les membres sont ajoutés automatiquement à votre téléphone.',
      connect: 'Connecter Google Contacts',
      sync: 'Synchroniser les contacts',
      resync: 'Resynchroniser',
      onMsg: '✓ Google Contacts connecté. Appuyez sur Resynchroniser pour ajouter les nouveaux membres.',
      lastSync: '✓ Dernière synchronisation terminée',
      disconnect: 'Déconnecter',
      confirmDisconnect: 'Déconnecter Google Contacts et nettoyer les contacts ?',
      stNone: 'NON CONNECTÉ', stOn: 'CONNECTÉ', stReauth: 'RECONNEXION',
      reauth: 'L\'accès Google a expiré. Reconnectez-vous.',
      redirecting: 'Ouverture de Google...',
      syncing: 'Synchronisation en cours... cela peut prendre quelques minutes.',
      done: 'Synchronisation terminée', created: 'ajoutés', updated: 'mis à jour', failed: 'échecs',
      timeout: 'La synchronisation continue en arrière-plan. Revenez vérifier plus tard.',
      disconnected: 'Google Contacts déconnecté.',
      err: 'Erreur. Réessayez.'
    },
    en: {
      kicker: 'GOOGLE CONTACTS',
      title: 'Sync contacts to Google',
      desc: 'Connect your Google Contacts through Shizzy Connect and members are added to your phone automatically.',
      connect: 'Connect Google Contacts',
      sync: 'Sync contacts',
      resync: 'Resync',
      onMsg: '✓ Google Contacts connected. Press Resync to add new members.',
      lastSync: '✓ Last sync finished',
      disconnect: 'Disconnect',
      confirmDisconnect: 'Disconnect Google Contacts and clean up the contacts?',
      stNone: 'NOT CONNECTED', stOn: 'CONNECTED', stReauth: 'RECONNECT',
      reauth: 'Google access expired. Please reconnect.',
      redirecting: 'Opening Google...',
      syncing: 'Sync running... this can take a few minutes.',
      done: 'Sync finished', created: 'added', updated: 'updated', failed: 'failed',
      timeout: 'Sync keeps running in the background. Check back later.',
      disconnected: 'Google Contacts disconnected.',
      err: 'Error. Please try again.'
    }
  };

  function lang() {
    var l = '';
    try { l = localStorage.getItem('doberto_lang') || ''; } catch (_) {}
    l = l || document.documentElement.lang || 'ht';
    return T[l] ? l : 'ht';
  }
  function t(key) { return T[lang()][key] || T.ht[key] || ''; }
  var LAST_KEY = 'dv_last_sync';
  function lastSyncAt() { try { return Number(localStorage.getItem(LAST_KEY)) || 0; } catch (_) { return 0; } }
  function saveLastSync() { try { localStorage.setItem(LAST_KEY, String(Date.now())); } catch (_) {} }
  function lastSyncLabel() {
    var at = lastSyncAt();
    if (!at) return t('onMsg');
    var d = new Date(at), pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return t('lastSync') + ' · ' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function token() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (_) { return ''; } }

  function api(method, path) {
    return fetch(path, {
      method: method,
      headers: { Authorization: 'Bearer ' + token(), Accept: 'application/json' },
      cache: 'no-store'
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, data: d }; });
    });
  }

  function connState(c) {
    if (!c) return 'none';
    var s = String(c.status || '').toLowerCase();
    if (s.indexOf('reauth') !== -1 || s === 'revoked' || s === 'expired') return 'reauth';
    if (c.connected === true || s === 'connected' || s === 'active') return 'on';
    return 'none';
  }

  var els = {};
  var busy = false;

  function build() {
    var anchor = document.getElementById('memberDirectoryPanel');
    if (!anchor || !anchor.parentNode) return false;
    var sec = document.createElement('section');
    sec.className = 'panel';
    sec.id = 'shizzyPanel';
    sec.style.marginBottom = '22px';
    sec.hidden = true;

    var head = document.createElement('div');
    head.className = 'member-directory-head';
    var left = document.createElement('div');
    els.kicker = document.createElement('span'); els.kicker.className = 'member-directory-kicker';
    els.title = document.createElement('h2');
    els.desc = document.createElement('p');
    left.appendChild(els.kicker); left.appendChild(els.title); left.appendChild(els.desc);
    els.state = document.createElement('span'); els.state.className = 'member-total-chip';
    head.appendChild(left); head.appendChild(els.state);

    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-top:14px';
    els.connect = document.createElement('button'); els.connect.type = 'button';
    els.sync = document.createElement('button'); els.sync.type = 'button';
    els.disconnect = document.createElement('button'); els.disconnect.type = 'button'; els.disconnect.className = 'secondary';
    actions.appendChild(els.connect); actions.appendChild(els.sync); actions.appendChild(els.disconnect);

    els.msg = document.createElement('div'); els.msg.className = 'msg'; els.msg.setAttribute('role', 'status'); els.msg.setAttribute('aria-live', 'polite');

    sec.appendChild(head); sec.appendChild(actions); sec.appendChild(els.msg);
    anchor.parentNode.insertBefore(sec, anchor);
    els.root = sec;

    els.connect.addEventListener('click', onConnect);
    els.sync.addEventListener('click', onSync);
    els.disconnect.addEventListener('click', onDisconnect);
    return true;
  }

  function say(text, kind) {
    els.msg.textContent = text || '';
    els.msg.className = 'msg' + (text ? ' show ' + (kind || '') : '');
  }

  var current = 'none';
  function render(state) {
    current = state || current;
    els.kicker.textContent = t('kicker');
    els.title.textContent = t('title');
    els.desc.textContent = t('desc');
    els.connect.textContent = state === 'reauth' || current === 'reauth' ? t('connect') : t('connect');
    els.sync.textContent = current === 'on' ? t('resync') : t('sync');
    els.disconnect.textContent = t('disconnect');
    els.state.textContent = current === 'on' ? t('stOn') : (current === 'reauth' ? t('stReauth') : t('stNone'));
    els.connect.hidden = current === 'on';
    els.sync.hidden = current !== 'on';
    els.disconnect.hidden = current === 'none';
    if (current === 'reauth' && !busy) say(t('reauth'), 'err');
    else if (current === 'on' && !busy) say(lastSyncLabel(), 'ok');
    els.root.hidden = false;
  }

  function setBusy(v) {
    busy = v;
    els.connect.disabled = els.sync.disabled = els.disconnect.disabled = v;
  }

  function errText(res) {
    return (res && res.data && res.data.error) || t('err');
  }

  function onConnect() {
    if (busy) return;
    setBusy(true); say(t('redirecting'), 'ok');
    api('POST', '/api/shizzy/connect').then(function (res) {
      if (res.ok && res.data && /^https:\/\//i.test(res.data.url || '')) {
        window.location.href = res.data.url;
        return;
      }
      say(errText(res), 'err'); setBusy(false);
    }).catch(function () { say(t('err'), 'err'); setBusy(false); });
  }

  function poll(jobId, n) {
    api('GET', '/api/shizzy/jobs/' + encodeURIComponent(jobId)).then(function (res) {
      var job = res.ok && res.data && res.data.job;
      if (!job) { say(errText(res), 'err'); setBusy(false); return; }
      var status = String(job.status || '').toLowerCase();
      if (status === 'completed') {
        var s = job.stats || {};
        say(t('done') + ': ' + (s.created || 0) + ' ' + t('created') + ', ' + (s.updated || 0) + ' ' + t('updated') + ', ' + (s.failed || 0) + ' ' + t('failed') + '.', 'ok');
        saveLastSync();
        setBusy(false);
      } else if (status === 'failed' || status === 'error') {
        say(job.error || t('err'), 'err'); setBusy(false);
      } else if (n >= POLL_MAX) {
        say(t('timeout'), 'ok'); setBusy(false);
      } else {
        setTimeout(function () { poll(jobId, n + 1); }, POLL_MS);
      }
    }).catch(function () { say(t('err'), 'err'); setBusy(false); });
  }

  function onSync() {
    if (busy) return;
    setBusy(true); say(t('syncing'), 'ok');
    api('POST', '/api/shizzy/sync').then(function (res) {
      if (res.ok && res.data && res.data.jobId) { poll(res.data.jobId, 0); return; }
      if (res.status === 409) { render('reauth'); }
      say(errText(res), 'err'); setBusy(false);
    }).catch(function () { say(t('err'), 'err'); setBusy(false); });
  }

  function onDisconnect() {
    if (busy || !window.confirm(t('confirmDisconnect'))) return;
    setBusy(true);
    api('DELETE', '/api/shizzy/connection').then(function (res) {
      if (res.ok) { render('none'); say(t('disconnected'), 'ok'); } else { say(errText(res), 'err'); }
      setBusy(false);
    }).catch(function () { say(t('err'), 'err'); setBusy(false); });
  }

  function init() {
    if (!token()) return; // sèlman pou itilizatè konekte
    api('GET', '/api/shizzy/status').then(function (res) {
      if (!res.ok || !res.data || res.data.configured === false) return;
      if (!build()) return;
      render(connState(res.data.connection));
      var sel = document.getElementById('langSelect');
      if (sel) sel.addEventListener('change', function () { setTimeout(function () { render(current); }, 50); });
    }).catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
