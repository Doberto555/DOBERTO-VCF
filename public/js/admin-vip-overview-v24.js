(() => {
  'use strict';
  if (window.__DV_ADMIN_VIP_OVERVIEW_V24__) return;
  window.__DV_ADMIN_VIP_OVERVIEW_V24__ = true;

  const COPY = {
    ht: {
      kicker: 'VIP OVERVIEW', title: 'Rezime VIP', active: 'VIP aktif', lifetime: 'VIP à vie',
      expiring: 'Ekspire nan 7 jou', pending: 'Peman an atant', revenue: 'Revni valide',
      sandbox: 'MonCash Sandbox aktif. Peman tès MonCash yo pa konte kòm revni reyèl.',
      live: 'MonCash Live aktif.', refresh: 'Rafrechi', error: 'Nou pa ka chaje rezime VIP la.'
    },
    fr: {
      kicker: 'APERÇU VIP', title: 'Vue d’ensemble VIP', active: 'VIP actifs', lifetime: 'VIP à vie',
      expiring: 'Expire sous 7 jours', pending: 'Paiements en attente', revenue: 'Revenus validés',
      sandbox: 'MonCash Sandbox est actif. Les paiements de test MonCash ne sont pas comptés comme revenus réels.',
      live: 'MonCash Live est actif.', refresh: 'Actualiser', error: 'Impossible de charger le résumé VIP.'
    },
    en: {
      kicker: 'VIP OVERVIEW', title: 'VIP overview', active: 'Active VIP', lifetime: 'Lifetime VIP',
      expiring: 'Expiring in 7 days', pending: 'Pending payments', revenue: 'Verified revenue',
      sandbox: 'MonCash Sandbox is active. MonCash test payments are not counted as real revenue.',
      live: 'MonCash Live is active.', refresh: 'Refresh', error: 'VIP overview could not be loaded.'
    }
  };

  let data = null;
  let loading = false;

  const lang = () => {
    const el = document.getElementById('langSelect');
    return el && COPY[el.value] ? el.value : 'ht';
  };
  const t = key => COPY[lang()]?.[key] || COPY.ht[key] || key;
  const token = () => {
    try { return sessionStorage.getItem('doberto_admin_token') || ''; }
    catch (_) { return ''; }
  };

  function ensurePanel() {
    if (document.getElementById('adminVipOverview')) return;
    const admin = document.getElementById('adminPanel');
    if (!admin) return;
    const panel = document.createElement('section');
    panel.id = 'adminVipOverview';
    panel.className = 'dv-vip-overview';
    panel.innerHTML = `
      <div class="dv-vip-overview-head">
        <div><span id="vipOverviewKicker"></span><h3 id="vipOverviewTitle"></h3></div>
        <button type="button" id="vipOverviewRefresh" class="secondary"></button>
      </div>
      <div id="vipOverviewMode" class="dv-vip-mode"></div>
      <div id="vipOverviewCards" class="dv-vip-overview-grid">
        <div class="dv-vip-overview-skeleton"></div><div class="dv-vip-overview-skeleton"></div>
        <div class="dv-vip-overview-skeleton"></div><div class="dv-vip-overview-skeleton"></div>
      </div>`;
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.insertAdjacentElement('afterend', panel); else admin.prepend(panel);
    document.getElementById('vipOverviewRefresh')?.addEventListener('click', () => load(true));
    renderCopy();
  }

  function formatMoney(revenue) {
    const entries = Object.entries(revenue || {}).filter(([, amount]) => Number(amount));
    if (!entries.length) return '0 HTG';
    return entries.map(([currency, amount]) => `${Number(amount).toLocaleString(lang()==='en'?'en-US':'fr-FR',{maximumFractionDigits:2})} ${currency}`).join(' · ');
  }

  function renderCopy() {
    ensurePanel();
    const kicker = document.getElementById('vipOverviewKicker');
    const title = document.getElementById('vipOverviewTitle');
    const refresh = document.getElementById('vipOverviewRefresh');
    if (kicker) kicker.textContent = t('kicker');
    if (title) title.textContent = t('title');
    if (refresh) refresh.textContent = t('refresh');
    render();
  }

  function render() {
    const root = document.getElementById('vipOverviewCards');
    const mode = document.getElementById('vipOverviewMode');
    if (!root || !mode || loading) return;
    if (!data) return;
    const s = data.stats || {};
    const pending = Number(s.pendingManual || 0) + Number(s.pendingMoncash || 0);
    root.innerHTML = `
      <article><span>${t('active')}</span><strong>${Number(s.activeVip || 0)}</strong></article>
      <article><span>${t('lifetime')}</span><strong>${Number(s.lifetimeVip || 0)}</strong></article>
      <article><span>${t('expiring')}</span><strong>${Number(s.expiringSoon || 0)}</strong></article>
      <article><span>${t('pending')}</span><strong>${pending}</strong></article>
      <article class="wide"><span>${t('revenue')}</span><strong>${formatMoney(s.revenue)}</strong></article>`;
    mode.textContent = data.moncashMode === 'live' ? t('live') : t('sandbox');
    mode.className = `dv-vip-mode ${data.moncashMode === 'live' ? 'live' : 'sandbox'}`;
  }

  async function load(force=false) {
    ensurePanel();
    if (loading && !force) return;
    const auth = token();
    const admin = document.getElementById('adminPanel');
    if (!auth || !admin || admin.style.display === 'none') return;
    loading = true;
    const root = document.getElementById('vipOverviewCards');
    if (root) root.innerHTML = '<div class="dv-vip-overview-skeleton"></div><div class="dv-vip-overview-skeleton"></div><div class="dv-vip-overview-skeleton"></div><div class="dv-vip-overview-skeleton"></div>';
    try {
      const res = await fetch('/api/admin-vip-overview', { headers:{Authorization:`Bearer ${auth}`}, cache:'no-store' });
      const payload = await res.json().catch(() => ({}));
      if (res.status === 401) { document.getElementById('logoutBtn')?.click(); return; }
      if (!res.ok) throw new Error(payload.error || t('error'));
      data = payload;
    } catch (e) {
      data = null;
      if (root) root.innerHTML = `<div class="dv-vip-overview-error">${String(e.message || t('error'))}</div>`;
    } finally {
      loading = false;
      render();
    }
  }

  function boot() {
    ensurePanel();
    const admin = document.getElementById('adminPanel');
    if (admin && 'MutationObserver' in window) {
      new MutationObserver(() => { if (admin.style.display !== 'none' && token()) load(); }).observe(admin, {attributes:true, attributeFilter:['style']});
    }
    document.getElementById('langSelect')?.addEventListener('change', () => setTimeout(renderCopy, 0));
    window.addEventListener('pageshow', () => { if (token()) load(); });
    if (admin && admin.style.display !== 'none' && token()) load();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
