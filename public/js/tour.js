// DOBERTO VCF — guided tour, mobile-safe
const TOUR_STEPS = [
  { target: '[data-tour="hero"]',      titleKey: 'tour1_title', descKey: 'tour1_desc' },
  { target: '[data-tour="capacity"]',  titleKey: 'tour2_title', descKey: 'tour2_desc' },
  { target: '[data-tour="form"]',      titleKey: 'tour3_title', descKey: 'tour3_desc' },
  { target: '[data-tour="unlock"]',    titleKey: 'tour4_title', descKey: 'tour4_desc' },
  { target: '[data-tour="list-link"]', titleKey: 'tour5_title', descKey: 'tour5_desc' }
];

const TOUR_SEEN_KEY = 'doberto_tour_seen';
let tourEls = null;
let tourIndex = 0;
let tourSteps = [];

function ensureTourSafeStyles() {
  if (document.getElementById('dvTourSafeStyles')) return;
  const style = document.createElement('style');
  style.id = 'dvTourSafeStyles';
  style.textContent = `
    .tour-tooltip{
      max-height:calc(100dvh - 32px)!important;
      overflow-y:auto!important;
      overscroll-behavior:contain;
      scrollbar-width:thin;
      padding-bottom:calc(16px + env(safe-area-inset-bottom))!important;
    }
    .tour-footer{
      position:sticky;
      bottom:calc(-16px - env(safe-area-inset-bottom));
      z-index:2;
      padding:12px 0 calc(4px + env(safe-area-inset-bottom));
      background:linear-gradient(180deg,rgba(7,17,13,0),rgba(7,17,13,.98) 32%);
    }
    @media(max-width:520px){
      .tour-tooltip{left:12px!important;right:12px!important;width:auto!important;max-width:none!important;}
    }
  `;
  document.head.appendChild(style);
}

function buildTourDom() {
  if (tourEls) return tourEls;
  ensureTourSafeStyles();

  const scrim = document.createElement('div');
  scrim.className = 'tour-scrim';

  const spotlight = document.createElement('div');
  spotlight.className = 'tour-spotlight';

  const tooltip = document.createElement('div');
  tooltip.className = 'tour-tooltip';
  tooltip.innerHTML = `
    <span class="tour-step-badge" id="tourBadge"></span>
    <h4 id="tourTitle"></h4>
    <p id="tourDesc"></p>
    <div class="tour-footer">
      <div class="tour-dots" id="tourDots"></div>
      <div class="tour-actions">
        <button type="button" class="tour-skip" id="tourSkip"></button>
        <button type="button" class="tour-next" id="tourNext"></button>
      </div>
    </div>`;

  document.body.append(scrim, spotlight, tooltip);
  tourEls = { scrim, spotlight, tooltip };
  return tourEls;
}

function viewportMetrics() {
  const vv = window.visualViewport;
  return {
    top: vv ? vv.offsetTop : 0,
    height: vv ? vv.height : window.innerHeight,
    width: vv ? vv.width : window.innerWidth
  };
}

function positionOn(el, els) {
  const r = el.getBoundingClientRect();
  const pad = 8;
  const vp = viewportMetrics();
  const safe = 14;

  els.spotlight.style.top = (r.top - pad) + 'px';
  els.spotlight.style.left = (r.left - pad) + 'px';
  els.spotlight.style.width = (r.width + pad * 2) + 'px';
  els.spotlight.style.height = (r.height + pad * 2) + 'px';

  const tooltip = els.tooltip;
  tooltip.style.maxHeight = Math.max(180, vp.height - safe * 2) + 'px';

  const tipH = Math.min(tooltip.offsetHeight, vp.height - safe * 2);
  const minTop = vp.top + safe;
  const maxTop = vp.top + vp.height - tipH - safe;
  const below = r.bottom + 14;
  const above = r.top - tipH - 14;
  const spaceBelow = (vp.top + vp.height) - r.bottom;
  const spaceAbove = r.top - vp.top;

  let top = spaceBelow >= Math.min(tipH + 14, 220) ? below : above;
  if (spaceAbove < 160 && spaceBelow < 160) top = minTop;
  top = Math.max(minTop, Math.min(top, Math.max(minTop, maxTop)));

  let left = r.left;
  if (vp.width <= 520) {
    left = 12;
  } else {
    const maxLeft = vp.width - tooltip.offsetWidth - safe;
    left = Math.min(Math.max(safe, left), Math.max(safe, maxLeft));
  }

  tooltip.style.top = top + 'px';
  tooltip.style.left = left + 'px';
}

function renderTourStep() {
  const els = buildTourDom();
  const step = tourSteps[tourIndex];
  const el = step && document.querySelector(step.target);
  if (!el || el.offsetParent === null) {
    if (tourIndex < tourSteps.length - 1) {
      tourIndex++;
      renderTourStep();
    } else {
      endTour();
    }
    return;
  }

  el.scrollIntoView({ block: 'center', behavior: 'auto' });
  document.getElementById('tourBadge').textContent = t('tour_step_of', { n: tourIndex + 1, total: tourSteps.length });
  document.getElementById('tourTitle').textContent = t(step.titleKey);
  document.getElementById('tourDesc').textContent = t(step.descKey);
  document.getElementById('tourSkip').textContent = t('tour_skip');
  document.getElementById('tourNext').textContent = tourIndex === tourSteps.length - 1 ? t('tour_done') : t('tour_next');

  const dots = document.getElementById('tourDots');
  dots.innerHTML = '';
  tourSteps.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'tour-dot' + (i === tourIndex ? ' active' : '');
    dots.appendChild(dot);
  });

  requestAnimationFrame(() => requestAnimationFrame(() => positionOn(el, els)));
}

function startTour(force) {
  if (!force && localStorage.getItem(TOUR_SEEN_KEY)) return;
  tourSteps = TOUR_STEPS.filter((step) => document.querySelector(step.target));
  if (!tourSteps.length) return;

  tourIndex = 0;
  const els = buildTourDom();
  els.scrim.classList.add('show');
  els.spotlight.style.display = 'block';
  els.tooltip.style.display = 'block';
  document.body.style.overflow = 'hidden';
  renderTourStep();

  window.addEventListener('resize', onTourResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onTourResize);
    window.visualViewport.addEventListener('scroll', onTourResize);
  }
}

function onTourResize() {
  if (!tourEls || !tourEls.scrim.classList.contains('show')) return;
  const step = tourSteps[tourIndex];
  const el = step && document.querySelector(step.target);
  if (el) requestAnimationFrame(() => positionOn(el, tourEls));
}

function nextTourStep() {
  if (tourIndex < tourSteps.length - 1) {
    tourIndex++;
    renderTourStep();
  } else {
    endTour();
  }
}

function endTour() {
  localStorage.setItem(TOUR_SEEN_KEY, '1');
  if (!tourEls) return;
  tourEls.scrim.classList.remove('show');
  tourEls.spotlight.style.display = 'none';
  tourEls.tooltip.style.display = 'none';
  document.body.style.overflow = '';
  window.removeEventListener('resize', onTourResize);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', onTourResize);
    window.visualViewport.removeEventListener('scroll', onTourResize);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const replayBtn = document.getElementById('tourReplayBtn');
  if (replayBtn) replayBtn.addEventListener('click', () => startTour(true));
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'tourNext') nextTourStep();
    if (e.target && e.target.id === 'tourSkip') endTour();
  });
  setTimeout(() => startTour(false), 900);
});
