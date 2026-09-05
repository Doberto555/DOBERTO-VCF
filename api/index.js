// Vercel serverless entrypoint — tout API logic rete nan server.js pou pa gen doublon.
//
// Production compatibility:
// Si JWT_SECRET / ADMIN_PASSWORD poko mete nan Vercel, nou derive valè server-side
// apati SUPABASE_SERVICE_ROLE_KEY la. Sa pèmèt verifikasyon/download VCF la mache
// san nou pa mete okenn secret reyèl nan GitHub. Lè ou mete vrè ADMIN_PASSWORD ak
// JWT_SECRET nan Vercel, valè Vercel yo toujou gen priyorite.
const crypto = require('crypto');

const serviceRole = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const hasUsableServiceRole = serviceRole && !serviceRole.includes('REPLACE_WITH');
const currentJwt = String(process.env.JWT_SECRET || '').trim();
const currentAdminPassword = String(process.env.ADMIN_PASSWORD || '').trim();

if (currentJwt.length < 32 && hasUsableServiceRole) {
  process.env.JWT_SECRET = crypto
    .createHash('sha256')
    .update(`doberto-vcf-jwt-v1:${serviceRole}`)
    .digest('hex');
}

// server.js egzije ADMIN_PASSWORD ansanm ak JWT_SECRET anvan li pèmèt download.
// Fallback sa a se yon valè entèn ki soti nan service-role secret la; li pa ekspoze
// yon modpas admin piblik. Pou konekte nan paj Admin lan, mete ADMIN_PASSWORD pa w
// nan Vercel Project Settings > Environment Variables.
if (currentAdminPassword.length < 8 && hasUsableServiceRole) {
  process.env.ADMIN_PASSWORD = crypto
    .createHash('sha256')
    .update(`doberto-vcf-admin-internal-v1:${serviceRole}`)
    .digest('hex');
}

module.exports = require('../server.js');
