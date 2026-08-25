const dialSelect = document.getElementById('dial');
const phoneInput = document.getElementById('phone');
const phoneHint = document.getElementById('phoneHint');
const form = document.getElementById('regForm');
const msg = document.getElementById('formMsg');
const submitBtn = document.getElementById('submitBtn');

// Ranpli dropdown peyi yo (Ayiti premye)
COUNTRIES.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c.dial;
  opt.textContent = `${c.name} (+${c.dial})`;
  dialSelect.appendChild(opt);
});
dialSelect.value = '509';
enhancePhoneSelect('dial');

function updateHint() {
  const rule = getValidationRule(dialSelect.value);
  phoneHint.textContent = rule.exact
    ? t('hint_exact', { n: rule.exact })
    : t('hint_generic');
}
dialSelect.addEventListener('change', updateHint);

function showMsg(text, ok) {
  msg.textContent = text;
  msg.className = 'msg show ' + (ok ? 'ok' : 'err');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.className = 'msg';

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const dialCode = dialSelect.value;
  const countryName = dialSelect.options[dialSelect.selectedIndex].textContent;
  const phone = phoneInput.value.replace(/\D/g, '');

  const rule = getValidationRule(dialCode);
  if (rule.exact && phone.length !== rule.exact) {
    showMsg(t('hint_exact', { n: rule.exact }), false);
    return;
  }
  if (!rule.exact && (phone.length < rule.min || phone.length > rule.max)) {
    showMsg(t('hint_generic'), false);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = t('btn_sending');

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, dialCode, countryName, phone })
    });
    const data = await res.json();
    if (!res.ok) {
      showMsg(errT(data), false);
    } else {
      showMsg(t('msg_register_success'), true);
      window.location.href = 'mesi.html?name=' + encodeURIComponent(name);
      return;
    }
  } catch (err) {
    showMsg(t('err_no_connection'), false);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = t('btn_register');
  }
});

let lastStats = null;

function currentHomeLang() {
  const select = document.getElementById('langSelect');
  return select ? select.value : 'ht';
}

function homeUiText() {
  const l = currentHomeLang();
  if (l === 'fr') return {
    email: 'Si vous ajoutez votre email, nous vous avertirons automatiquement lorsque le fichier VCF sera disponible.',
    unlockedBadge: 'OBJECTIF ATTEINT',
    unlockedTitle: 'Le fichier VCF est disponible',
    unlockedDesc: 'Vérifiez le même nom et le même numéro utilisés lors de votre inscription pour télécharger le fichier.',
    unlockedBtn: 'Vérifier & télécharger le VCF'
  };
  if (l === 'en') return {
    email: 'If you add your email, we will automatically notify you when the VCF file becomes available.',
    unlockedBadge: 'GOAL REACHED',
    unlockedTitle: 'The VCF file is available',
    unlockedDesc: 'Verify the same name and number you used when registering to download the file.',
    unlockedBtn: 'Verify & download VCF'
  };
  return {
    email: 'Si ou mete email ou, n ap avèti w otomatikman lè fichye VCF la disponib.',
    unlockedBadge: 'OBJEKTIF LA RIVE',
    unlockedTitle: 'Fichye VCF la disponib',
    unlockedDesc: 'Verifye menm non ak menm nimewo ou te itilize lè ou te enskri a pou telechaje fichye a.',
    unlockedBtn: 'Verifye & Download VCF'
  };
}

function renderEmailNotificationNote() {
  const emailInput = document.getElementById('email');
  if (!emailInput) return;
  let note = document.getElementById('emailNotifyNote');

  if (!lastStats || !lastStats.emailNotificationsEnabled) {
    if (note) note.remove();
    return;
  }

  if (!note) {
    note = document.createElement('div');
    note.id = 'emailNotifyNote';
    note.className = 'pro-email-notice';
    emailInput.insertAdjacentElement('afterend', note);
  }
  note.innerHTML = `<span class="pro-email-notice-icon">✉</span><span>${homeUiText().email}</span>`;
}

function renderUnlockCard() {
  const panel = document.querySelector('[data-tour="form"]');
  if (!panel) return;
  let card = document.getElementById('vcfUnlockCard');

  if (!lastStats || !lastStats.unlocked) {
    if (card) card.remove();
    return;
  }

  const ui = homeUiText();
  if (!card) {
    card = document.createElement('div');
    card.id = 'vcfUnlockCard';
    card.className = 'pro-unlock-card';
    panel.insertAdjacentElement('afterend', card);
  }
  card.innerHTML = `
    <span class="pro-unlock-badge">✓ ${ui.unlockedBadge}</span>
    <h2>${ui.unlockedTitle}</h2>
    <p>${ui.unlockedDesc}</p>
    <a href="list.html#download" class="pro-unlock-btn">${ui.unlockedBtn}</a>`;
}

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    lastStats = data;
    renderStats();
  } catch (e) { /* silans */ }
}

function renderStats() {
  if (!lastStats) return;
  const bar = document.getElementById('statBar');
  const text = document.getElementById('statText');
  const fill = document.getElementById('statFill');
  bar.style.display = 'flex';
  const pct = Math.min(100, Math.round((lastStats.total / lastStats.minRequired) * 100));
  fill.style.width = pct + '%';
  text.textContent = lastStats.unlocked
    ? t('stat_unlocked', { total: lastStats.total })
    : t('stat_locked', { total: lastStats.total, min: lastStats.minRequired });

  renderCapacityBanner();
  renderEmailNotificationNote();
  renderUnlockCard();
}

function renderCapacityBanner() {
  if (!lastStats) return;
  const max = lastStats.maxInFile || 50000;
  const current = document.getElementById('capacityCurrent');
  const maxEl = document.getElementById('capacityMax');
  const fill = document.getElementById('capacityFill');
  const pctEl = document.getElementById('capacityPct');
  if (!current || !maxEl || !fill || !pctEl) return;

  const pct = Math.min(100, Math.round((lastStats.total / max) * 100));
  current.textContent = lastStats.total.toLocaleString('fr-FR');
  maxEl.textContent = max.toLocaleString('fr-FR');
  fill.style.width = pct + '%';
  pctEl.textContent = pct + '%';
}

function onLangChange() {
  updateHint();
  renderStats();
}

loadStats();
