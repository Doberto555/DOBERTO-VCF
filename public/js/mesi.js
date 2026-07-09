// DOBERTO VCF — Paj "Mèsi" apre enskripsyon, envite moun pataje sou WhatsApp Status

const params = new URLSearchParams(window.location.search);
const regName = (params.get('name') || '').trim();

const siteUrl = window.location.origin + '/';

function shareMessage() {
  return t('mesi_share_text') + '\n' + siteUrl;
}

function renderTitle() {
  const el = document.getElementById('mesiTitle');
  if (!el) return;
  const namePart = regName ? ', ' + regName : '';
  el.textContent = t('mesi_title', { name: namePart });
}

function renderLinkBox() {
  const box = document.getElementById('mesiLinkBox');
  if (box) box.textContent = siteUrl;
}

function renderWaLink() {
  const a = document.getElementById('whatsappSendBtn');
  if (!a) return;
  a.href = 'https://wa.me/?text=' + encodeURIComponent(shareMessage());
}

function showMesiMsg(text) {
  const msg = document.getElementById('mesiMsg');
  if (!msg) return;
  msg.textContent = text;
  msg.className = 'msg show ok';
  setTimeout(() => { msg.className = 'msg'; }, 2500);
}

async function handleShareStatus() {
  const text = shareMessage();
  if (navigator.share) {
    try {
      await navigator.share({ text, url: siteUrl });
      return;
    } catch (err) {
      // Moun nan anile pataje a — pa fè anyen
      if (err && err.name === 'AbortError') return;
    }
  }
  // Fallback pou navigatè ki pa sipòte Web Share API
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
}

async function handleCopyLink() {
  try {
    await navigator.clipboard.writeText(shareMessage());
  } catch (err) {
    // Fallback si clipboard API pa disponib
    const tmp = document.createElement('textarea');
    tmp.value = shareMessage();
    tmp.style.position = 'fixed';
    tmp.style.opacity = '0';
    document.body.appendChild(tmp);
    tmp.select();
    try { document.execCommand('copy'); } catch (e) { /* silans */ }
    document.body.removeChild(tmp);
  }
  showMesiMsg(t('mesi_copied'));
}

document.getElementById('shareStatusBtn').addEventListener('click', handleShareStatus);
document.getElementById('copyLinkBtn').addEventListener('click', handleCopyLink);

function onLangChange() {
  renderTitle();
  renderLinkBox();
  renderWaLink();
}

onLangChange();
