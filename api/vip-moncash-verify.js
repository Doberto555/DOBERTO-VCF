require('../lib/runtime-secrets');

// Keep the verification route on the exact same normalized MonCash credentials
// used by the create-payment route.
process.env.MONCASH_CLIENT_ID = String(process.env.MONCASH_CLIENT_ID || '').trim();
process.env.MONCASH_CLIENT_SECRET = String(process.env.MONCASH_CLIENT_SECRET || '').trim();
process.env.MONCASH_MODE = String(process.env.MONCASH_MODE || 'sandbox').trim().toLowerCase();

const api=require('../lib/vip-api');
module.exports=(req,res)=>req.method==='POST'?api.moncashVerify(req,res):res.status(405).json({error:'Method not allowed'});
