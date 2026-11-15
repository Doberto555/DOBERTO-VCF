/* DOBERTO VCF - videyo tuto (YouTube Shorts): kijan pou enskri. Ranpli <div id="dvTuto">. Videyo a chaje sèlman lè moun nan klike. */
(function () {
  'use strict';
  var ID = '56xR__cYnMg';
  var URL_ = 'https://youtube.com/shorts/' + ID;
  var host = document.getElementById('dvTuto');
  if (!host) return;
  var T = {
    ht: { k: 'TUTO VIDEYO', h: 'Gade kijan pou enskri', p: 'Yon videyo kout ki montre w etap pa etap kijan pou w kreye kont ou epi antre nan rezo a.', play: 'Jwe videyo a', open: 'Louvri sou YouTube', reg: 'Enskri kounye a' },
    fr: { k: 'TUTO VIDÉO', h: 'Voir comment s’inscrire', p: 'Une courte vidéo qui montre étape par étape comment créer votre compte et rejoindre le réseau.', play: 'Lire la vidéo', open: 'Ouvrir sur YouTube', reg: 'S’inscrire maintenant' },
    en: { k: 'VIDEO TUTORIAL', h: 'See how to sign up', p: 'A short video showing step by step how to create your account and join the network.', play: 'Play video', open: 'Open on YouTube', reg: 'Sign up now' }
  };
  function lang() { try { var l = localStorage.getItem('doberto_lang'); return T[l] ? l : 'ht'; } catch (_) { return 'ht'; } }
  var t = T[lang()];

  var css = document.createElement('style');
  css.textContent =
    '.tuto{display:grid;grid-template-columns:1fr auto;gap:28px;align-items:center;margin-top:16px;padding:26px!important}' +
    '.tuto .tk{color:#f2c66d;font-size:11px;font-weight:800;letter-spacing:.16em}' +
    '.tuto h3{font-size:clamp(20px,3vw,26px);letter-spacing:-.02em;margin:10px 0 8px}' +
    '.tuto p{color:var(--muted,#8aa196);font-size:15px;max-width:460px}' +
    '.tuto .ta{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}' +
    '.tuto .ta a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:14px;font-weight:800;font-size:14px;text-decoration:none}' +
    '.tuto .ta .p{background:linear-gradient(180deg,#f8dc9a,#f2c66d);color:#1a1403;box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 8px 24px -8px rgba(242,198,109,.55)}' +
    '.tuto .ta .g{border:1px solid rgba(255,255,255,.12);color:#dcebe3;background:rgba(255,255,255,.03)}' +
    '.tuto .tv{position:relative;width:min(100%,260px);aspect-ratio:9/16;border-radius:22px;overflow:hidden;background:#0b0e12;border:1px solid rgba(255,255,255,.1);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 24px 50px -24px #000;justify-self:center}' +
    '.tuto .tv button{all:unset;position:absolute;inset:0;cursor:pointer;display:grid;place-items:center}' +
    '.tuto .tv img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.85}' +
    '.tuto .tv .pl{position:relative;width:68px;height:68px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(180deg,#f8dc9a,#f2c66d);box-shadow:0 10px 30px -6px rgba(242,198,109,.7),inset 0 1px 0 rgba(255,255,255,.6)}' +
    '.tuto .tv .pl::after{content:"";margin-left:5px;border-style:solid;border-width:11px 0 11px 18px;border-color:transparent transparent transparent #1a1403}' +
    '.tuto .tv button:focus-visible{outline:2px solid #f2c66d;outline-offset:-4px}' +
    '.tuto .tv iframe{position:absolute;inset:0;width:100%;height:100%;border:0}' +
    '@media(max-width:760px){.tuto{grid-template-columns:1fr;padding:20px!important}.tuto .tv{order:-1;width:min(100%,240px)}}';
  document.head.appendChild(css);

  function el(tag, cls, text, attrs) {
    var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text;
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  var card = el('div', 'card tuto');
  var info = el('div');
  info.appendChild(el('span', 'tk', t.k)); info.appendChild(el('h3', '', t.h)); info.appendChild(el('p', '', t.p));
  var acts = el('div', 'ta');
  acts.appendChild(el('a', 'p', t.reg, { href: 'register.html' }));
  acts.appendChild(el('a', 'g', t.open, { href: URL_, target: '_blank', rel: 'noopener noreferrer' }));
  info.appendChild(acts);

  var tv = el('div', 'tv');
  var btn = el('button', '', '', { type: 'button', 'aria-label': t.play });
  var img = el('img', '', '', { src: 'https://i.ytimg.com/vi/' + ID + '/hqdefault.jpg', alt: '', loading: 'lazy', decoding: 'async' });
  img.addEventListener('error', function () { img.style.display = 'none'; });
  btn.appendChild(img); btn.appendChild(el('span', 'pl'));
  btn.addEventListener('click', function () {
    var f = el('iframe', '', '', {
      src: 'https://www.youtube-nocookie.com/embed/' + ID + '?autoplay=1&playsinline=1&rel=0',
      title: t.h, allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: '', referrerpolicy: 'strict-origin-when-cross-origin'
    });
    tv.textContent = ''; tv.appendChild(f);
  });
  tv.appendChild(btn);
  add(card, info, tv); host.appendChild(card);
  function add(p) { for (var i = 1; i < arguments.length; i++) p.appendChild(arguments[i]); }
})();
