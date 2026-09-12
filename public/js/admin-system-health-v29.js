(() => {
  'use strict';
  if (window.__DV_ADMIN_SYSTEM_HEALTH_V29__) return;
  window.__DV_ADMIN_SYSTEM_HEALTH_V29__ = true;

  const COPY = {
    ht: {
      kicker:'SYSTEM HEALTH', title:'Sante sistèm nan', desc:'Verifye sèvis prensipal DOBERTO VCF yo san ekspoze okenn secret.',
      refresh:'Rafrechi', overall:'Eta jeneral', database:'Database', moncash:'MonCash', push:'Push notifications', email:'Email', google:'Google OAuth',
      operational:'Operasyonèl', configured:'Konfigire', missing:'Manke konfigirasyon', error:'Erè', degraded:'Degrade', checking:'Ap verifye…',
      sandbox:'Sandbox', live:'Live', checked:'Dènye verifikasyon', googleNote:'Sa verifye sèlman konfigirasyon OAuth la; verifikasyon Google rete nan Google Cloud Console.',
      loadError:'Nou pa ka verifye sante sistèm nan kounye a.'
    },
    fr: {
      kicker:'ÉTAT DU SYSTÈME', title:'Santé du système', desc:'Vérifiez les services principaux de DOBERTO VCF sans exposer de secret.',
      refresh:'Actualiser', overall:'État général', database:'Base de données', moncash:'MonCash', push:'Notifications push', email:'E-mail', google:'Google OAuth',
      operational:'Opérationnel', configured:'Configuré', missing:'Configuration manquante', error:'Erreur', degraded:'Dégradé', checking:'Vérification…',
      sandbox:'Sandbox', live:'Live', checked:'Dernière vérification', googleNote:'Ceci vérifie uniquement la configuration OAuth ; la validation Google reste suivie dans Google Cloud Console.',
      loadError:'Impossible de vérifier l’état du système pour le moment.'
    },
    en: {
      kicker:'SYSTEM HEALTH', title:'System health', desc:'Check DOBERTO VCF core services without exposing any secrets.',
      refresh:'Refresh', overall:'Overall status', database:'Database', moncash:'MonCash', push:'Push notifications', email:'Email', google:'Google OAuth',
      operational:'Operational', configured:'Configured', missing:'Missing configuration', error:'Error', degraded:'Degraded', checking:'Checking…',
      sandbox:'Sandbox', live:'Live', checked:'Last checked', googleNote:'This only checks OAuth configuration; Google verification remains tracked in Google Cloud Console.',
      loadError:'System health cannot be checked right now.'
    }
  };

  let data = null;
  let loading = false;
  let timer = null;

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
    if (document.getElementById('adminSystemHealth')) return;
    const admin = document.getElementById('adminPanel');
    if (!admin) return;
    const section = document.createElement('section');
    section.id = 'adminSystemHealth';
    section.className = 'dv-system-health';
    section.innerHTML = `
      <div class="dv-system-health-head">
        <div><span id="systemHealthKicker"></span><h3 id="systemHealthTitle"></h3><p id="systemHealthDesc"></p></div>
        <button type="button" id="systemHealthRefresh" class="secondary"></button>
      </div>
      <div id="systemHealthOverall" class="dv-system-health-overall"></div>
      <div id="systemHealthGrid" class="dv-system-health-grid"></div>
      <div class="dv-system-health-foot"><span id="systemHealthChecked"></span><small id="systemHealthGoogleNote"></small></div>`;
    admin.appendChild(section);
    document.getElementById('systemHealthRefresh')?.addEventListener('click', () => load(true));
    renderCopy();
  }

  function statusText(value) {
    return t(value === 'operational' ? 'operational' : value === 'configured' ? 'configured' : value === 'missing' ? 'missing' : value === 'error' ? 'error' : value === 'degraded' ? 'degraded' : 'checking');
  }

  function statusClass(value) {
    if (value === 'operational' || value === 'configured') return 'ok';
    if (value === 'missing') return 'warn';
    if (value === 'error' || value === 'degraded') return 'bad';
    return 'neutral';
  }

  function card(label, service, extra='') {
    const state = service?.status || 'checking';
    return `<article class="dv-health-card ${statusClass(state)}"><span>${label}</span><strong>${statusText(state)}</strong>${extra ? `<small>${extra}</small>` : ''}</article>`;
  }

  function renderCopy() {
    ensurePanel();
    const map = {
      systemHealthKicker:t('kicker'), systemHealthTitle:t('title'), systemHealthDesc:t('desc'),
      systemHealthRefresh:t('refresh'), systemHealthGoogleNote:t('googleNote')
    };
    Object.entries(map).forEach(([id,text]) => { const el=document.getElementById(id); if(el)el.textContent=text; });
    render();
  }

  function render() {
    const grid = document.getElementById('systemHealthGrid');
    const overall = document.getElementById('systemHealthOverall');
    const checked = document.getElementById('systemHealthChecked');
    if (!grid || !overall) return;

    if (loading && !data) {
      overall.innerHTML = `<span>${t('overall')}</span><strong>${t('checking')}</strong>`;
      grid.innerHTML = Array.from({length:5},()=>'<div class="dv-health-skeleton"></div>').join('');
      return;
    }
    if (!data) return;

    const s = data.services || {};
    overall.className = `dv-system-health-overall ${statusClass(data.status)}`;
    overall.innerHTML = `<span>${t('overall')}</span><strong>${statusText(data.status)}</strong>`;
    const mode = s.moncash?.mode === 'live' ? t('live') : t('sandbox');
    grid.innerHTML = [
      card(t('database'), s.database),
      card(t('moncash'), s.moncash, mode),
      card(t('push'), s.push),
      card(t('email'), s.email),
      card(t('google'), s.google)
    ].join('');
    if (checked) {
      const date = data.checkedAt ? new Date(data.checkedAt) : null;
      checked.textContent = `${t('checked')}: ${date && !Number.isNaN(date.getTime()) ? date.toLocaleString(lang()==='en'?'en-US':'fr-FR') : '—'}`;
    }
  }

  async function load(force=false) {
    ensurePanel();
    if (loading && !force) return;
    const auth = token();
    const admin = document.getElementById('adminPanel');
    if (!auth || !admin || admin.style.display === 'none') return;
    loading = true;
    render();
    try {
      const res = await fetch('/api/admin/system/health', { headers:{Authorization:`Bearer ${auth}`}, cache:'no-store' });
      const payload = await res.json().catch(() => ({}));
      if (res.status === 401) { document.getElementById('logoutBtn')?.click(); return; }
      if (!res.ok) throw new Error(payload.error || t('loadError'));
      data = payload;
    } catch (_) {
      data = {
        status:'degraded', checkedAt:new Date().toISOString(),
        services:{ database:{status:'error'}, moncash:{status:'checking'}, push:{status:'checking'}, email:{status:'checking'}, google:{status:'checking'} }
      };
    } finally {
      loading = false;
      render();
    }
  }

  function schedule() {
    clearInterval(timer);
    timer = setInterval(() => {
      const admin = document.getElementById('adminPanel');
      if (admin && admin.style.display !== 'none' && token()) load();
    }, 60000);
  }

  function boot() {
    ensurePanel();
    const admin = document.getElementById('adminPanel');
    if (admin && 'MutationObserver' in window) {
      new MutationObserver(() => { if (admin.style.display !== 'none' && token()) load(); }).observe(admin,{attributes:true,attributeFilter:['style']});
    }
    document.getElementById('langSelect')?.addEventListener('change',()=>setTimeout(renderCopy,0));
    window.addEventListener('pageshow',()=>{if(token())load();});
    if (admin && admin.style.display !== 'none' && token()) load();
    schedule();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
