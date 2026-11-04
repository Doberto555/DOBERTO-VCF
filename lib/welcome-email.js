'use strict';
const { sendMail } = require('./mailer');
const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SITE = 'https://dobertovcf.online';

async function sendWelcome(email, name) {
  const first = String(name || '').trim().split(/\s+/)[0] || '';
  const hello = first ? 'Bonjou ' + first + ',' : 'Bonjou,';
  const text = hello + '\n\nMèsi paske w enskri sou DOBERTO VCF. Enskripsyon ou a anrejistre.\n\nOu ka retounen sou sit la nenpòt lè: ' + SITE + '\n\nOu resevwa imèl sa a paske w sot enskri sou dobertovcf.online.';
  const html = '<div style="font:15px/1.6 system-ui,sans-serif;color:#111;max-width:520px">'
    + '<p>' + esc(hello) + '</p>'
    + '<p>Mèsi paske w enskri sou <b>DOBERTO VCF</b>. Enskripsyon ou a anrejistre.</p>'
    + '<p><a href="' + SITE + '" style="color:#0a7d5a">Retounen sou sit la</a></p>'
    + '<p style="color:#666;font-size:12px">Ou resevwa imèl sa a paske w sot enskri sou dobertovcf.online.</p>'
    + '</div>';
  return sendMail({ to: email, subject: 'Byenvini sou DOBERTO VCF', html, text });
}

module.exports = { sendWelcome };
