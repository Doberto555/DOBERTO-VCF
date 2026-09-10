require('../lib/runtime-secrets');
const api=require('../lib/vip-api');
module.exports=(req,res)=>req.method==='GET'?api.status(req,res):res.status(405).json({error:'Method not allowed'});
