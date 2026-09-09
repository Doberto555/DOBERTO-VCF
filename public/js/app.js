(function loadDobertoBrand(){
  const VERSION='20260905-2';
  if(!document.querySelector('link[data-doberto-brand]')){
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='css/brand-v7.css?v=20260904-1';
    css.dataset.dobertoBrand='1';
    document.head.appendChild(css);
  }

  const manifest=document.querySelector('link[rel="manifest"]');
  if(manifest) manifest.href=`manifest.webmanifest?v=${VERSION}`;

  document.querySelectorAll('link[rel~="icon"]').forEach((el)=>el.remove());
  const icon=document.createElement('link');
  icon.rel='icon';
  icon.type='image/png';
  icon.href='icons/doberto-vcf-192.png?v=20260904-1';
  document.head.appendChild(icon);

  const apple=document.querySelector('link[rel="apple-touch-icon"]');
  if(apple) apple.href='icons/doberto-vcf-192.png?v=20260904-1';
  const theme=document.querySelector('meta[name="theme-color"]');
  if(theme) theme.content='#020705';

  const brand=document.querySelector('.brand');
  const dot=brand && brand.querySelector('.dot');
  if(dot){
    const img=document.createElement('img');
    img.className='brand-logo';
    img.src='icons/doberto-vcf-mark.svg?v=20260904-1';
    img.alt='';
    img.width=38;
    img.height=38;
    dot.replaceWith(img);
  }

  if('ServiceWorkerRegistration' in window && ServiceWorkerRegistration.prototype.showNotification){
    const original=ServiceWorkerRegistration.prototype.showNotification;
    if(!ServiceWorkerRegistration.prototype.__dvBrandPatched){
      ServiceWorkerRegistration.prototype.showNotification=function(title,options){
        const next=Object.assign({},options||{}, {
          icon:'icons/doberto-vcf-192.png?v=20260904-1',
          badge:'icons/doberto-vcf-192.png?v=20260904-1'
        });
        return original.call(this,title,next);
      };
      ServiceWorkerRegistration.prototype.__dvBrandPatched=true;
    }
  }
})();

const dialSelect = document.getElementById('dial');
const phoneInput = document.getElementById('phone');
const phoneHint = document.getElementById('phoneHint');
const form = document.getElementById('regForm');
const msg = document.getElementById('formMsg');
const submitBtn = document.getElementById('submitBtn');

const REGISTRATION_COPY = {
  ht: {
    kicker: 'ENSKRIPSYON',
    title: 'Antre nan rezo DOBERTO VCF la',
    desc: 'Ajoute non ou ak nimewo WhatsApp ou. Sa pran kèk segond.'
  },
  en: {
    kicker: 'REGISTRATION',
    title: 'Join the DOBERTO VCF network',
    desc: 'Add your name and WhatsApp number. It only takes a few seconds.'
  },
  fr: {
    kicker: 'INSCRIPTION',
    title: 'Rejoignez le réseau DOBERTO VCF',
    desc: 'Ajoutez votre nom et votre numéro WhatsApp. Cela ne prend que quelques secondes.'
  }
};

function currentHomeLang() {
  const select = document.getElementById('langSelect');
  return select && REGISTRATION_COPY[select.value] ? select.value : (window.currentLang || 'ht');
}

function ensureRegistrationHead() {
  if (!form || document.getElementById('registrationHead')) return;
  const head = document.createElement('div');
  head.id = 'registrationHead';
  head.className = 'registration-head';
  head.innerHTML = '<span class="registration-kicker" id="registrationKicker"></span><h2 id="registrationTitle"></h2><p id="registrationDesc"></p>';
  form.insertAdjacentElement('beforebegin', head);
}

function renderRegistrationHead() {
  ensureRegistrationHead();
  const copy = REGISTRATION_COPY[currentHomeLang()] || REGISTRATION_COPY.ht;
  const kicker = document.getElementById('registrationKicker');
  const title = document.getElementById('registrationTitle');
  const desc = document.getElementById('registrationDesc');
  if (kicker) kicker.textContent = copy.kicker;
  if (title) title.textContent = copy.title;
  if (desc) desc.textContent = copy.desc;
}

if (dialSelect && typeof COUNTRIES !== 'undefined') {
  COUNTRIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.dial;
    opt.textContent = `${c.name} (+${c.dial})`;
    dialSelect.appendChild(opt);
  });
  dialSelect.value = '509';
  enhancePhoneSelect('dial');
}
renderRegistrationHead();

function updateHint() {
  if (!dialSelect || !phoneHint) return;
  const rule = getValidationRule(dialSelect.value);
  phoneHint.textContent = rule.exact
    ? t('hint_exact', { n: rule.exact })
    : t('hint_generic');
}
if (dialSelect) dialSelect.addEventListener('change', updateHint);

function showMsg(text, ok) {
  if (!msg) return;
  msg.textContent = text;
  msg.className = 'msg show ' + (ok ? 'ok' : 'err');
}

if (form) form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (msg) msg.className = 'msg';

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
      headers: window.DobertoGoogle
        ? window.DobertoGoogle.authHeaders(true)
        : { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, dialCode, countryName, phone })
    });
    const data = await res.json();
    if (!res.ok) {
      showMsg(errT(data), false);
    } else {
      showMsg(t('msg_register_success'), true);
      try {
        localStorage.setItem('dv_registered', '1');
        localStorage.setItem('dv_member_name', name);
        sessionStorage.setItem('dv_show_welcome', '1');
      } catch (_) {}
      if (window.DobertoGoogle) {
        window.DobertoGoogle.registrationCompleted({ name, email, dial_code: dialCode, phone });
      }
      window.setTimeout(() => {
        window.location.replace('/?welcome=1');
      }, 280);
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

function homeUiText() {
  const l = currentHomeLang();
  if (l === 'fr') return {
    email: 'Ajoutez votre email si vous souhaitez être averti quand le fichier VCF sera disponible.',
    unlockedBadge: 'OBJECTIF ATTEINT',
    unlockedTitle: 'Le fichier VCF est disponible',
    unlockedDesc: 'Utilisez le même nom et le même numéro que lors de votre inscription pour récupérer le fichier.',
    unlockedBtn: 'Vérifier et télécharger'
  };
  if (l === 'en') return {
    email: 'Add your email if you want to be notified when the VCF file is ready.',
    unlockedBadge: 'GOAL REACHED',
    unlockedTitle: 'The VCF file is ready',
    unlockedDesc: 'Use the same name and number you registered with to get the file.',
    unlockedBtn: 'Verify and download'
  };
  return {
    email: 'Mete email ou si ou vle resevwa yon avètisman lè fichye VCF la pare.',
    unlockedBadge: 'OBJEKTIF LA RIVE',
    unlockedTitle: 'Fichye VCF la pare',
    unlockedDesc: 'Sèvi ak menm non ak menm nimewo ou te enskri ak yo pou pran fichye a.',
    unlockedBtn: 'Verifye epi telechaje'
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
  } catch (e) {}
}

function renderStats() {
  if (!lastStats) return;
  const bar = document.getElementById('statBar');
  const text = document.getElementById('statText');
  const fill = document.getElementById('statFill');
  if (bar) bar.style.display = 'flex';
  const pct = Math.min(100, Math.round((lastStats.total / lastStats.minRequired) * 100));
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = lastStats.unlocked
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
  renderRegistrationHead();
  renderStats();
}

loadStats();
