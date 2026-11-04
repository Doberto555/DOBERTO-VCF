'use strict';
const API_URL = 'https://api.resend.com/emails';
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

async function sendMail({ to, subject, html, text, replyTo }) {
  const key = String(process.env.RESEND_API_KEY || '').trim();
  const from = String(process.env.MAIL_FROM || '').trim();
  if (!key || !from) throw new Error('Imèl pa konfigire (RESEND_API_KEY / MAIL_FROM).');
  const recipients = (Array.isArray(to) ? to : [to]).map((x) => String(x || '').trim());
  if (!recipients.length || recipients.some((x) => !EMAIL_RE.test(x))) throw new Error('Adrès imèl pa valid.');
  const body = { from, to: recipients, subject: String(subject || '').slice(0, 200), html, text };
  if (replyTo) body.reply_to = replyTo;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || ('Resend ' + res.status));
  return data;
}

module.exports = { sendMail };
