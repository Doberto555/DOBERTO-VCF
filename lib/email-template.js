'use strict';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function safeUrl(u) {
  try { const x = new URL(String(u || '').trim()); return x.protocol === 'https:' ? x.href : ''; } catch (e) { return ''; }
}
function buildEmail({ message, imageUrl, linkUrl, unsubUrl }) {
  const img = safeUrl(imageUrl), link = safeUrl(linkUrl), unsub = safeUrl(unsubUrl);
  let html = '<div style="font:15px/1.6 system-ui,Arial,sans-serif;color:#111;max-width:560px;margin:0 auto">';
  if (img) {
    const tag = '<img src="' + esc(img) + '" alt="" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;border-radius:8px;margin:0 0 16px">';
    html += link ? '<a href="' + esc(link) + '">' + tag + '</a>' : tag;
  }
  html += '<p>' + esc(message).replace(/\n/g, '<br>') + '</p>';
  if (link) html += '<p><a href="' + esc(link) + '" style="color:#0a7d5a">' + esc(link) + '</a></p>';
  if (unsub) html += '<p style="color:#888;font-size:12px;margin-top:24px">Ou resevwa imèl sa a paske w enskri sou DOBERTO VCF. <a href="' + esc(unsub) + '" style="color:#888">Dezabòne</a></p>';
  html += '</div>';
  let text = String(message || '');
  if (link) text += '\n\n' + link;
  if (unsub) text += '\n\nPou dezabòne: ' + unsub;
  return { html, text };
}
module.exports = { buildEmail, safeUrl };
