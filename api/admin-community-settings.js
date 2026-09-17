require('../lib/runtime-secrets');
const jwt=require('jsonwebtoken');
const {createClient}=require('@supabase/supabase-js');

const SUPABASE_URL=String(process.env.SUPABASE_URL||'').trim();
const SERVICE_KEY=String(process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim();
const JWT_SECRET=String(process.env.JWT_SECRET||'').trim();
const DEFAULT_GROUP='https://chat.whatsapp.com/GySPeuvDlI14BnWWvdm7U4?s=sh&p=a&mlu=4&ilr=4';
const DEFAULT_BOT_API='https://doberto-minibot-v1.vercel.app/api/backend';
const ALLOWED_BOT_HOSTS=new Set(
  String(process.env.VCF_BOT_ALLOWED_HOSTS||'doberto-minibot-v1.vercel.app')
    .split(',').map(v=>v.trim().toLowerCase()).filter(Boolean)
);

function bearer(req){const v=String(req.headers.authorization||'');return v.startsWith('Bearer ')?v.slice(7).trim():'';}
function verifyAdmin(req){try{const p=jwt.verify(bearer(req),JWT_SECRET,{algorithms:['HS256'],issuer:'doberto-vcf',audience:'doberto-vcf-admin'});return p?.role==='admin'?p:null;}catch(_){return null;}}
function validGroupUrl(value){try{const u=new URL(String(value||'').trim());return u.protocol==='https:'&&u.hostname==='chat.whatsapp.com'&&/^\/[A-Za-z0-9_-]{10,}/.test(u.pathname);}catch(_){return false;}}
function validBotUrl(value){try{const u=new URL(String(value||'').trim());return u.protocol==='https:'&&ALLOWED_BOT_HOSTS.has(u.hostname.toLowerCase())&&!u.username&&!u.password&&!u.hash;}catch(_){return false;}}

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Pragma','no-cache');
  if(!verifyAdmin(req)) return res.status(401).json({error:'Sesyon admin lan pa valid.'});
  if(!SUPABASE_URL||!SERVICE_KEY) return res.status(503).json({error:'Database lan poko configure.'});
  const supabase=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});

  if(req.method==='GET'){
    const {data,error}=await supabase.from('app_settings').select('key,value,updated_at').in('key',['whatsapp_group_url','vcf_bot_api_url','vcf_bot_api_token']);
    if(error) return res.status(500).json({error:'Nou pa ka chaje paramèt kominote yo.'});
    const map=Object.fromEntries((data||[]).map(row=>[row.key,row]));
    const rawBotUrl=String(map.vcf_bot_api_url?.value||DEFAULT_BOT_API).trim();
    const botApiUrl=validBotUrl(rawBotUrl)?rawBotUrl:DEFAULT_BOT_API;
    const token=String(map.vcf_bot_api_token?.value||'').trim();
    return res.json({
      ok:true,
      whatsappGroupUrl:validGroupUrl(map.whatsapp_group_url?.value)?String(map.whatsapp_group_url.value):DEFAULT_GROUP,
      botApiUrl,
      botTokenConfigured:token.length>=24,
      botConfigured:validBotUrl(botApiUrl)&&token.length>=24,
      updatedAt:map.whatsapp_group_url?.updated_at||null
    });
  }

  if(req.method==='PUT'||req.method==='POST'){
    const now=new Date().toISOString();
    const rows=[];

    if(Object.prototype.hasOwnProperty.call(req.body||{},'whatsappGroupUrl')){
      const value=String(req.body?.whatsappGroupUrl||'').trim();
      if(!validGroupUrl(value)) return res.status(400).json({error:'Mete yon link group WhatsApp valid ki kòmanse ak https://chat.whatsapp.com/'});
      rows.push({key:'whatsapp_group_url',value,updated_at:now});
    }

    if(Object.prototype.hasOwnProperty.call(req.body||{},'botApiUrl')){
      const value=String(req.body?.botApiUrl||'').trim().replace(/\/+$/,'');
      if(!validBotUrl(value)) return res.status(400).json({error:'URL bot la pa nan lis host ki otorize yo.'});
      rows.push({key:'vcf_bot_api_url',value,updated_at:now});
    }

    if(Object.prototype.hasOwnProperty.call(req.body||{},'botApiToken')){
      const value=String(req.body?.botApiToken||'').trim();
      if(value && value.length<24) return res.status(400).json({error:'Token bot la dwe gen omwen 24 karaktè.'});
      if(value) rows.push({key:'vcf_bot_api_token',value,updated_at:now});
    }

    if(!rows.length) return res.status(400).json({error:'Pa gen okenn paramèt pou sove.'});
    const {error}=await supabase.from('app_settings').upsert(rows,{onConflict:'key'});
    if(error) return res.status(500).json({error:'Nou pa ka sove paramèt kominote yo.'});

    return res.json({ok:true,whatsappGroupUrl:rows.find(r=>r.key==='whatsapp_group_url')?.value});
  }

  return res.status(405).json({error:'Method not allowed'});
};
