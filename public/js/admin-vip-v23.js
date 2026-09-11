(() => {
  'use strict';
  if (window.__DV_ADMIN_VIP_V23__) return;
  window.__DV_ADMIN_VIP_V23__ = true;

  const COPY = {
    ht: {
      kicker: 'VIP PAYMENT CENTER', title: 'Jesyon peman VIP',
      desc: 'Revize peman NatCash ak Binance yo epi aktive VIP apre verifikasyon.',
      refresh: 'Rafrechi', pending: 'An atant', approved: 'Apwouve', rejected: 'Rejte',
      all: 'Tout', empty: 'Pa gen okenn demann peman VIP pou kounye a.',
      method: 'Metòd', plan: 'Plan', amount: 'Montan', reference: 'Referans', date: 'Dat', note: 'Nòt',
      approve: 'Apwouve', reject: 'Rejte', reviewing: 'N ap trete…',
      approveConfirm: 'Konfime peman sa a epi aktive VIP pou itilizatè a?',
      rejectConfirm: 'Rejte demann peman sa a?',
      approvedOk: 'Peman an apwouve. VIP aktive.', rejectedOk: 'Peman an rejte.',
      loadError: 'Nou pa ka chaje peman VIP yo kounye a.', actionError: 'Aksyon an pa t fèt.'
    },
    fr: {
      kicker: 'CENTRE DE PAIEMENTS VIP', title: 'Gestion des paiements VIP',
      desc: 'Vérifiez les paiements NatCash et Binance puis activez le VIP après validation.',
      refresh: 'Actualiser', pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté',
      all: 'Tous', empty: 'Aucune demande de paiement VIP pour le moment.',
      method: 'Moyen', plan: 'Formule', amount: 'Montant', reference: 'Référence', date: 'Date', note: 'Note',
      approve: 'Approuver', reject: 'Rejeter', reviewing: 'Traitement…',
      approveConfirm: 'Confirmer ce paiement et activer le VIP pour cet utilisateur ?',
      rejectConfirm: 'Rejeter cette demande de paiement ?',
      approvedOk: 'Paiement approuvé. VIP activé.', rejectedOk: 'Paiement rejeté.',
      loadError: 'Impossible de charger les paiements VIP pour le moment.', actionError: 'Action impossible.'
    },
    en: {
      kicker: 'VIP PAYMENT CENTER', title: 'VIP payment management',
      desc: 'Review NatCash and Binance payments, then activate VIP after verification.',
      refresh: 'Refresh', pending: 'Pending', approved: 'Approved', rejected: 'Rejected',
      all: 'All', empty: 'There are no VIP payment requests right now.',
      method: 'Method', plan: 'Plan', amount: 'Amount', reference: 'Reference', date: 'Date', note: 'Note',
      approve: 'Approve', reject: 'Reject', reviewing: 'Processing…',
      approveConfirm: 'Confirm this payment and activate VIP for this user?',
      rejectConfirm: 'Reject this payment request?',
      approvedOk: 'Payment approved. VIP activated.', rejectedOk: 'Payment rejected.',
      loadError: 'VIP payments cannot be loaded right now.', actionError: 'Action failed.'
    }
  };

  let requests = [];
  let filter = 'pending';
  let loading = false;
  let timer = null;

  const lang = () => {
    const s = document.getElementById('langSelect');
    return s && COPY[s.value] ? s.value : 'ht';
  };
  const t = key => COPY[lang()]?.[key] || COPY.ht[key] || key;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const planName = code => ({
    ht:{monthly:'1 mwa',quarterly:'3 mwa',yearly:'1 an',lifetime:'À vie'},
    fr:{monthly:'1 mois',quarterly:'3 mois',yearly:'1 an',lifetime:'À vie'},
    en:{monthly:'1 month',quarterly:'3 months',yearly:'1 year',lifetime:'Lifetime'}
  })[lang()]?.[code] || code || '—';

  function token() {
    try { return adminToken || sessionStorage.getItem('doberto_admin_token') || ''; }
    catch (_) { return ''; }
  }

  function ensurePanel() {
    if (document.getElementById('adminVipPanel')) return;
    const admin = document.getElementById('adminPanel');
    if (!admin) return;
    const panel = document.createElement('section');
    panel.id = 'adminVipPanel';
    panel.className = 'dv-admin-vip';
    panel.innerHTML = `
      <div class="dv-admin-vip-head">
        <div><span id="adminVipKicker" class="dv-admin-vip-kicker"></span><h3 id="adminVipTitle"></h3><p id="adminVipDesc"></p></div>
        <div class="dv-admin-vip-head-actions"><span id="adminVipPendingCount" class="dv-admin-vip-count">0</span><button type="button" id="adminVipRefresh" class="secondary"></button></div>
      </div>
      <div class="dv-admin-vip-tabs" id="adminVipTabs">
        <button type="button" data-vip-filter="pending" class="active"></button>
        <button type="button" data-vip-filter="approved"></button>
        <button type="button" data-vip-filter="rejected"></button>
        <button type="button" data-vip-filter="all"></button>
      </div>
      <div id="adminVipMessage" class="msg"></div>
      <div id="adminVipList" class="dv-admin-vip-list"><div class="dv-admin-vip-loading"></div><div class="dv-admin-vip-loading"></div></div>`;
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.insertAdjacentElement('afterend', panel); else admin.appendChild(panel);
    document.getElementById('adminVipRefresh')?.addEventListener('click', () => load(true));
    panel.querySelectorAll('[data-vip-filter]').forEach(btn => btn.addEventListener('click', () => {
      filter = btn.dataset.vipFilter;
      renderTabs();
      renderList();
    }));
    renderCopy();
  }

  function renderCopy() {
    ensurePanel();
    const map = {
      adminVipKicker:t('kicker'), adminVipTitle:t('title'), adminVipDesc:t('desc'), adminVipRefresh:t('refresh')
    };
    Object.entries(map).forEach(([id,text]) => { const el=document.getElementById(id); if(el) el.textContent=text; });
    renderTabs();
    renderList();
  }

  function renderTabs() {
    const root = document.getElementById('adminVipTabs');
    if (!root) return;
    const labels = {pending:t('pending'), approved:t('approved'), rejected:t('rejected'), all:t('all')};
    root.querySelectorAll('[data-vip-filter]').forEach(btn => {
      btn.textContent = labels[btn.dataset.vipFilter] || btn.dataset.vipFilter;
      btn.classList.toggle('active', btn.dataset.vipFilter === filter);
    });
  }

  function setMessage(text, error=false, ok=false) {
    const el = document.getElementById('adminVipMessage');
    if (!el) return;
    el.textContent = text || '';
    el.className = `msg${text ? ' show' : ''}${error ? ' err' : ''}${ok ? ' ok' : ''}`;
  }

  function formatDate(value) {
    if (!value) return '—';
    try { return new Date(value).toLocaleString(lang()==='en'?'en-US':'fr-FR', {dateStyle:'medium', timeStyle:'short'}); }
    catch (_) { return value; }
  }

  function renderList() {
    const root = document.getElementById('adminVipList');
    if (!root || loading) return;
    const visible = requests.filter(r => filter === 'all' || r.status === filter);
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const count = document.getElementById('adminVipPendingCount');
    if (count) { count.textContent = String(pendingCount); count.title = t('pending'); }
    if (!visible.length) { root.innerHTML = `<div class="dv-admin-vip-empty">${esc(t('empty'))}</div>`; return; }
    root.innerHTML = visible.map(r => {
      const pending = r.status === 'pending';
      const statusLabel = t(r.status) || r.status;
      return `<article class="dv-admin-vip-card" data-vip-request="${esc(r.id)}">
        <div class="dv-admin-vip-card-top">
          <div><strong>${esc(String(r.method || '').toUpperCase())}</strong><span>VIP ${esc(planName(r.plan_code))}</span></div>
          <span class="dv-admin-vip-status ${esc(r.status)}">${esc(statusLabel)}</span>
        </div>
        <div class="dv-admin-vip-grid">
          <div><span>${esc(t('amount'))}</span><strong>${esc(Number(r.amount || 0).toLocaleString(lang()==='en'?'en-US':'fr-FR',{maximumFractionDigits:2}))} ${esc(r.currency || '')}</strong></div>
          <div><span>${esc(t('reference'))}</span><strong class="mono">${esc(r.transaction_ref || '—')}</strong></div>
          <div><span>${esc(t('date'))}</span><strong>${esc(formatDate(r.created_at))}</strong></div>
          <div><span>${esc(t('note'))}</span><strong>${esc(r.note || '—')}</strong></div>
        </div>
        ${pending ? `<div class="dv-admin-vip-actions"><button type="button" class="dv-vip-approve" data-vip-action="approve" data-vip-id="${esc(r.id)}">${esc(t('approve'))}</button><button type="button" class="secondary dv-vip-reject" data-vip-action="reject" data-vip-id="${esc(r.id)}">${esc(t('reject'))}</button></div>` : ''}
      </article>`;
    }).join('');
    root.querySelectorAll('[data-vip-action]').forEach(btn => btn.addEventListener('click', () => review(btn.dataset.vipId, btn.dataset.vipAction, btn)));
  }

  async function load(force=false) {
    ensurePanel();
    if (loading && !force) return;
    const auth = token();
    const panel = document.getElementById('adminPanel');
    if (!auth || !panel || panel.style.display === 'none') return;
    loading = true;
    const root = document.getElementById('adminVipList');
    if (root) root.innerHTML = '<div class="dv-admin-vip-loading"></div><div class="dv-admin-vip-loading"></div>';
    setMessage('');
    try {
      const res = await fetch('/api/admin/vip/payments', { headers:{Authorization:`Bearer ${auth}`}, cache:'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { document.getElementById('logoutBtn')?.click(); return; }
      if (!res.ok) throw new Error(data.error || t('loadError'));
      requests = Array.isArray(data.requests) ? data.requests : [];
    } catch (e) {
      requests = [];
      setMessage(e.message || t('loadError'), true);
    } finally {
      loading = false;
      renderList();
    }
  }

  async function review(id, action, button) {
    const question = action === 'approve' ? t('approveConfirm') : t('rejectConfirm');
    if (!confirm(question)) return;
    const auth = token();
    if (!auth) return;
    const original = button.textContent;
    button.disabled = true;
    button.textContent = t('reviewing');
    setMessage('');
    try {
      const res = await fetch('/api/admin/vip/payments', {
        method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${auth}`},
        body:JSON.stringify({id, action})
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { document.getElementById('logoutBtn')?.click(); return; }
      if (!res.ok) throw new Error(data.error || t('actionError'));
      setMessage(action === 'approve' ? t('approvedOk') : t('rejectedOk'), false, true);
      await load(true);
    } catch (e) {
      setMessage(e.message || t('actionError'), true);
      button.disabled = false;
      button.textContent = original;
    }
  }

  function schedule() {
    clearInterval(timer);
    timer = setInterval(() => {
      const panel = document.getElementById('adminPanel');
      if (panel && panel.style.display !== 'none' && token()) load();
    }, 30000);
  }

  function boot() {
    ensurePanel();
    const panel = document.getElementById('adminPanel');
    if (panel && panel.style.display !== 'none' && token()) load();
    if (panel && 'MutationObserver' in window) {
      new MutationObserver(() => {
        if (panel.style.display !== 'none' && token()) load();
      }).observe(panel, {attributes:true, attributeFilter:['style']});
    }
    document.getElementById('langSelect')?.addEventListener('change', () => setTimeout(renderCopy, 0));
    window.addEventListener('pageshow', () => { if (token()) load(); });
    schedule();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
