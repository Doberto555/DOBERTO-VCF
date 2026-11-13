/* DOBERTO VCF - bouton "Supprimer mon compte" (Mon profil) */
(function () {
  'use strict';
  var T = {
    fr: { btn: 'Supprimer mon compte', title: 'Supprimer votre compte ?',
      body: 'Cette action est définitive. Votre inscription et votre numéro seront retirés de la liste des membres et la synchronisation Google Contacts sera déconnectée.',
      ask: 'Pour confirmer, écrivez', word: 'SUPPRIMER', cancel: 'Annuler', ok: 'Supprimer définitivement',
      done: 'Compte supprimé.', fail: 'Suppression impossible. Réessayez.', expired: 'Session expirée. Reconnectez-vous avec Google.' },
    en: { btn: 'Delete my account', title: 'Delete your account?',
      body: 'This cannot be undone. Your registration and number will be removed from the members list and Google Contacts sync will be disconnected.',
      ask: 'To confirm, type', word: 'DELETE', cancel: 'Cancel', ok: 'Delete permanently',
      done: 'Account deleted.', fail: 'Could not delete. Try again.', expired: 'Session expired. Sign in with Google again.' },
    ht: { btn: 'Siprime kont mwen', title: 'Siprime kont ou ?',
      body: 'Aksyon sa a pa ka defèt. Enskripsyon ak nimewo ou ap retire nan lis manm yo, epi sinkwonizasyon Google Contacts la ap dekonekte.',
      ask: 'Pou konfime, ekri', word: 'SIPRIME', cancel: 'Anile', ok: 'Siprime pou tout tan',
      done: 'Kont lan siprime.', fail: 'Pa ka siprime. Eseye ankò.', expired: 'Sesyon an ekspire. Rekonekte ak Google.' }
  };
  var WORDS = ['SUPPRIMER', 'DELETE', 'SIPRIME'];

  function lang() { try { var l = localStorage.getItem('doberto_lang'); return T[l] ? l : 'ht'; } catch (_) { return 'ht'; } }
  function tok() { try { return localStorage.getItem('dv_auth_token') || ''; } catch (_) { return ''; } }

  var CSS =
    '.dv-danger{margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,118,118,.2)}' +
    '.dv-del{appearance:none;background:transparent;border:1px solid rgba(255,118,118,.5);color:#ff7676;border-radius:12px;padding:11px 18px;font:inherit;font-weight:700;font-size:14px;cursor:pointer;transition:background .15s ease,border-color .15s ease}' +
    '.dv-del:hover{background:rgba(255,118,118,.1);border-color:#ff7676}' +
    '.dv-ov{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:20px;background:rgba(2,7,5,.78);backdrop-filter:blur(4px)}' +
    '.dv-md{width:min(440px,100%);background:#0c1712;border:1px solid rgba(255,118,118,.3);border-radius:22px;padding:26px 24px;color:#f4fbf8;box-shadow:0 30px 80px rgba(0,0,0,.6)}' +
    '.dv-md h3{margin:0 0 10px;font-size:20px;font-weight:800}' +
    '.dv-md p{margin:0 0 14px;color:#9aa9a1;font-size:14px;line-height:1.6}' +
    '.dv-md .dv-ask b{color:#ff7676;letter-spacing:.06em}' +
    '.dv-md input{width:100%;box-sizing:border-box;margin:0 0 14px;padding:13px 14px;border-radius:12px;border:1px solid #2a3a33;background:#07100c;color:#f4fbf8;font:inherit;font-size:15px;letter-spacing:.06em;text-transform:uppercase}' +
    '.dv-md input:focus{outline:none;border-color:#ff7676}' +
    '.dv-md .dv-msg{min-height:20px;margin:0 0 12px;font-size:13px;color:#ff7676}' +
    '.dv-md .dv-msg.ok{color:#19e59b}' +
    '.dv-row{display:flex;gap:10px}' +
    '.dv-row button{flex:1;appearance:none;border-radius:12px;padding:12px 10px;font:inherit;font-weight:700;font-size:14px;cursor:pointer}' +
    '.dv-cancel{background:transparent;border:1px solid #2a3a33;color:#f4fbf8}' +
    '.dv-ok{background:#ff7676;border:1px solid #ff7676;color:#1a0505}' +
    '.dv-row button:disabled{opacity:.4;cursor:not-allowed}';

  var btn;

  function clearSession() {
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (/^dv_|google|auth|session|token/i.test(k)) localStorage.removeItem(k);
      });
    } catch (_) {}
  }

  function openModal() {
    var c = T[lang()];
    var ov = document.createElement('div');
    ov.className = 'dv-ov';
    ov.innerHTML =
      '<div class="dv-md" role="dialog" aria-modal="true">' +
        '<h3></h3><p class="dv-body"></p>' +
        '<p class="dv-ask"></p>' +
        '<input type="text" autocomplete="off" spellcheck="false" />' +
        '<p class="dv-msg" role="status"></p>' +
        '<div class="dv-row"><button type="button" class="dv-cancel"></button><button type="button" class="dv-ok" disabled></button></div>' +
      '</div>';
    document.body.appendChild(ov);
    var q = function (s) { return ov.querySelector(s); };
    q('h3').textContent = c.title;
    q('.dv-body').textContent = c.body;
    q('.dv-ask').innerHTML = c.ask + ' <b></b>.';
    q('.dv-ask b').textContent = c.word;
    q('.dv-cancel').textContent = c.cancel;
    q('.dv-ok').textContent = c.ok;
    var inp = q('input'), ok = q('.dv-ok'), cancel = q('.dv-cancel'), msg = q('.dv-msg');
    var busy = false;

    function close() { if (!busy) { ov.remove(); document.removeEventListener('keydown', onKey); } }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    cancel.addEventListener('click', close);
    inp.addEventListener('input', function () {
      ok.disabled = busy || WORDS.indexOf(inp.value.trim().toUpperCase()) === -1;
    });

    ok.addEventListener('click', function () {
      var t = tok();
      msg.className = 'dv-msg';
      if (!t) { msg.textContent = c.expired; return; }
      busy = true; ok.disabled = true; cancel.disabled = true; inp.disabled = true; msg.textContent = '…';
      fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + t },
        body: JSON.stringify({ confirm: true })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) { return { r: r, d: d }; });
      }).then(function (x) {
        if (x.r.ok && x.d && x.d.ok) {
          clearSession();
          msg.className = 'dv-msg ok'; msg.textContent = c.done;
          setTimeout(function () { location.replace('index.html'); }, 1200);
          return;
        }
        throw { status: x.r.status };
      }).catch(function (e) {
        busy = false; cancel.disabled = false; inp.disabled = false;
        ok.disabled = WORDS.indexOf(inp.value.trim().toUpperCase()) === -1;
        msg.className = 'dv-msg';
        msg.textContent = (e && e.status === 401) ? c.expired : c.fail;
      });
    });
    setTimeout(function () { inp.focus(); }, 50);
  }

  function label() { if (btn) btn.textContent = T[lang()].btn; }

  function build() {
    var form = document.getElementById('pfForm');
    if (!form || document.getElementById('dvDanger')) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var box = document.createElement('div');
    box.id = 'dvDanger'; box.className = 'dv-danger';
    btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'dv-del';
    btn.addEventListener('click', openModal);
    box.appendChild(btn);
    var after = document.getElementById('pfMsg') || form;
    after.parentNode.insertBefore(box, after.nextSibling);
    label();
  }

  function boot() {
    build();
    [300, 1000, 2500].forEach(function (ms) { setTimeout(build, ms); });
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('#acLang button, .dv-langbar button')) setTimeout(label, 200);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
