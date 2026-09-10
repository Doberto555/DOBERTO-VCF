require('../lib/runtime-secrets');
const api=require('../lib/vip-api');
module.exports=(req,res)=>api.adminMethods(req,res);
