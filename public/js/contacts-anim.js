(function () {
  var list = document.getElementById('gcList');
  if (!list) return;
  var CONTACTS = [
    { n: 'Jean-Marc P.', c: 'CA', p: '+1'   },
    { n: 'Nadia R.',     c: 'HT', p: '+509' },
    { n: 'Élodie M.',    c: 'FR', p: '+33'  },
    { n: 'Kwame A.',     c: 'GH', p: '+233' },
    { n: 'Priya S.',     c: 'US', p: '+1'   },
    { n: 'Amara O.',     c: 'NG', p: '+234' },
    { n: 'Luis F.',      c: 'MX', p: '+52'  }
  ];
  var SLOTS = 5, INTERVAL = 2600;
  var next = 0, rows = [], timer = null;

  function makeRow(d) {
    var el = document.createElement('div');
    el.className = 'gc-row gc-enter';
    el.innerHTML =
      '<div class="gc-av">' + d.n.charAt(0) + '</div>' +
      '<div class="gc-info">' +
        '<div class="gc-name"><b>S.C</b>' + d.n + '</div>' +
        '<div class="gc-phone"><em>' + d.c + '</em>' + d.p + ' ••• •• ••</div>' +
      '</div>' +
      '<span class="gc-badge">NOUVEAU</span>';
    return el;
  }
  function place() { rows.forEach(function (r, i) { r.style.setProperty('--i', i); }); }
  function addContact() {
    var d = CONTACTS[next++ % CONTACTS.length];
    var el = makeRow(d);
    el.style.setProperty('--i', 0);
    list.appendChild(el);
    if (rows[0]) rows[0].classList.remove('gc-new');
    if (rows.length >= SLOTS) {
      var old = rows.pop();
      old.style.setProperty('--i', SLOTS);
      old.classList.add('gc-leave');
      setTimeout(function () { old.remove(); }, 600);
    }
    rows.unshift(el);
    place();
    void el.offsetWidth;
    el.classList.remove('gc-enter');
    el.classList.add('gc-new');
  }
  function start() { if (!timer) timer = setInterval(addContact, INTERVAL); }
  function stop()  { clearInterval(timer); timer = null; }

  for (var i = SLOTS - 1; i >= 0; i--) {
    var d = CONTACTS[i % CONTACTS.length];
    var el = makeRow(d);
    el.classList.remove('gc-enter');
    el.style.transition = 'none';
    list.appendChild(el);
    rows.unshift(el);
  }
  next = SLOTS;
  place();
  rows[0].classList.add('gc-new');
  requestAnimationFrame(function () { rows.forEach(function (r) { r.style.transition = ''; }); });

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }, { threshold: .15 })
        .observe(document.getElementById('gcDemo'));
    } else { start(); }
  }
})();
