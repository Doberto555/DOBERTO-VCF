const crypto=require('crypto');
const serviceRole=String(process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim();
const usable=Boolean(serviceRole&&!serviceRole.includes('REPLACE_WITH'));
if(String(process.env.JWT_SECRET||'').trim().length<32&&usable){process.env.JWT_SECRET=crypto.createHash('sha256').update(`doberto-vcf-jwt-v1:${serviceRole}`).digest('hex');}
if(String(process.env.ADMIN_PASSWORD||'').trim().length<8&&usable){process.env.ADMIN_PASSWORD=crypto.createHash('sha256').update(`doberto-vcf-admin-internal-v1:${serviceRole}`).digest('hex');}
module.exports={ready:String(process.env.JWT_SECRET||'').trim().length>=32};
