const api=require('../lib/vip-api');
module.exports=(req,res)=>req.method==='GET'?api.methods(req,res):res.status(405).json({error:'Method not allowed'});
