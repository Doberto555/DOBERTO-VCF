require('../lib/runtime-secrets');
const crypto=require('crypto');
const jwt=require('jsonwebtoken');

module.exports=(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const clientId=String(process.env.GOOGLE_CLIENT_ID||'').trim();
  const jwtSecret=String(process.env.JWT_SECRET||'').trim();
  const siteUrl=String(process.env.SITE_URL||'https://dobertovcf.online').replace(/\/$/,'');
  const redirectUri=String(process.env.GOOGLE_REDIRECT_URI||`${siteUrl}/register.html`).trim();
  if(!clientId||jwtSecret.length<32)return res.status(503).json({error:'Google Sign-In poko configure.'});
  const state=jwt.sign({purpose:'google_oauth',flow:'login',nonce:crypto.randomBytes(18).toString('base64url')},jwtSecret,{algorithm:'HS256',expiresIn:'10m',issuer:'doberto-vcf',audience:'doberto-vcf-google'});
  const params=new URLSearchParams({client_id:clientId,redirect_uri:redirectUri,response_type:'code',scope:'openid email profile',include_granted_scopes:'false',prompt:'select_account',state});
  return res.status(200).json({ok:true,url:`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`});
};
