(() => {
  'use strict';

  const BRAND_LOGOS = {
    moncash: [
      'https://play-lh.googleusercontent.com/gh5vciO93wEDR2OvjkZk62Pdbn9PODYI7QXRSLl6MBIo8qE898cj8hcmmDqgbTOMGMselKMkeF1KZvHoGZ48bQ=w240-h480',
      'https://cdn.aptoide.com/imgs/d/6/f/d6fb107b85364c2fc2e2376995f3aed3_icon.jpg'
    ],
    natcash: [
      'https://play-lh.googleusercontent.com/VSzs3X7r3DNthDl1jvhmtrAY7p1jX2LeX3i7l9uZsolwVU85CapsmKYPdPzkp4ZQrEKf6nsHmuk9qUbbZWKp2bc=w240-h480',
      '/icons/natcash.svg'
    ],
    binance: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Binance_Logo.svg/500px-Binance_Logo.svg.png'
    ]
  };

  function mount(logo, method, label) {
    const sources = BRAND_LOGOS[method] || [];
    if (!sources.length) return;
    const key = `${method}:${sources.join('|')}`;
    if (logo.dataset.brandApplied === key && logo.querySelector('img')) return;

    logo.dataset.brandApplied = key;
    logo.classList.add('payment-brand-logo', `payment-brand-${method}`);
    logo.textContent = '';

    const img = document.createElement('img');
    img.alt = `${label} logo`;
    img.loading = 'eager';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    let index = 0;
    img.src = sources[index];
    img.addEventListener('error', () => {
      index += 1;
      if (index < sources.length) {
        img.src = sources[index];
        return;
      }
      logo.classList.add('brand-fallback');
      logo.textContent = method === 'moncash' ? 'MC' : method === 'natcash' ? 'NC' : 'BN';
    });
    logo.appendChild(img);
  }

  function apply() {
    document.querySelectorAll('#vipMethods .vip-method[data-method]').forEach((card) => {
      const method = String(card.dataset.method || '').toLowerCase();
      const logo = card.querySelector('.vip-method-mark');
      if (!logo || !BRAND_LOGOS[method]) return;
      const label = card.querySelector('strong')?.textContent?.trim() || method;
      mount(logo, method, label);
    });
  }

  function boot() {
    const root = document.getElementById('vipMethods');
    if (!root) return;
    apply();
    if ('MutationObserver' in window) {
      new MutationObserver(apply).observe(root, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();