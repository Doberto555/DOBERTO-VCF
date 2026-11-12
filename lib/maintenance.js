'use strict';
// DOBERTO VCF — mòd maintenance.
// Eta a sove nan .runtime/maintenance.json (menm modèl ak site-ads.json).
// Pou dezaktive an ijans nan SSH:  rm /var/www/DOBERTO-VCF/.runtime/maintenance.json

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', '.runtime');
const FILE = path.join(DIR, 'maintenance.json');
const PAGE = path.join(__dirname, '..', 'public', 'maintenance.html');
const DEFAULTS = Object.freeze({ enabled: false, message: '', updatedAt: null });
const TTL_MS = 2000;

let cache = { at: 0, value: DEFAULTS };

function clean(input) {
  const src = input && typeof input === 'object' ? input : {};
  return {
    enabled: src.enabled === true,
    message: String(src.message || '').replace(/\s+/g, ' ').trim().slice(0, 300),
    updatedAt: src.updatedAt || null
  };
}

function read() {
  const now = Date.now();
  if (now - cache.at < TTL_MS) return cache.value;
  let value = DEFAULTS;
  try { value = clean(JSON.parse(fs.readFileSync(FILE, 'utf8'))); } catch (_) { /* fichye a pa la = maintenance OFF */ }
  cache = { at: now, value };
  return value;
}

function write(input) {
  const value = clean(Object.assign({}, input, { updatedAt: new Date().toISOString() }));
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, FILE);
  cache = { at: Date.now(), value };
  return value;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Sa ki pase kanmenm pandan maintenance: admin, login, health, ak tout asset (css/js/imaj).
function isExempt(p) {
  if (p === '/api/health') return true;
  if (p.startsWith('/api/admin')) return true;
  if (p === '/admin.html' || p === '/maintenance.html') return true;
  if (p.startsWith('/api/')) return false;
  const ext = path.extname(p).toLowerCase();
  const pageLike = p === '/' || ext === '' || ext === '.html';
  return !pageLike;
}

function gate(req, res, next) {
  const state = read();
  if (!state.enabled) return next();
  const p = req.path || '/';
  if (isExempt(p)) return next();

  res.setHeader('Retry-After', '300');
  res.setHeader('Cache-Control', 'no-store');

  if (p.startsWith('/api/')) {
    return res.status(503).json({ code: 'maintenance', error: state.message || 'Sit la nan maintenance. Tounen talè.' });
  }

  let html;
  try { html = fs.readFileSync(PAGE, 'utf8'); } catch (_) {
    return res.status(503).type('text/plain').send(state.message || 'Sit la nan maintenance.');
  }
  if (state.message) {
    const banner = '<div style="position:relative;z-index:5;max-width:720px;margin:24px auto 0;padding:14px 18px;border:1px solid rgba(54,231,167,.35);border-radius:14px;background:rgba(54,231,167,.08);color:#f5fbf8;font:500 15px/1.5 Inter,system-ui,sans-serif;text-align:center">' + escapeHtml(state.message) + '</div>';
    html = html.replace(/<body[^>]*>/i, (m) => m + banner);
  }
  return res.status(503).type('html').send(html);
}

module.exports = { read, write, gate, isExempt };
