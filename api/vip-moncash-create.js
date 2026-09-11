require('../lib/runtime-secrets');

// Normalize MonCash env values before loading the shared VIP API.
// Vercel environment values can accidentally contain leading/trailing spaces
// or a trailing newline when pasted, which breaks Basic auth even though the
// health check (which trims values) still succeeds.
process.env.MONCASH_CLIENT_ID = String(process.env.MONCASH_CLIENT_ID || '').trim();
process.env.MONCASH_CLIENT_SECRET = String(process.env.MONCASH_CLIENT_SECRET || '').trim();
process.env.MONCASH_MODE = String(process.env.MONCASH_MODE || 'sandbox').trim().toLowerCase();

const api=require('../lib/vip-api');
module.exports=(req,res)=>req.method==='POST'?api.moncashCreate(req,res):res.status(405).json({error:'Method not allowed'});
