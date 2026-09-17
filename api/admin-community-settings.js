require('../lib/runtime-secrets');
const jwt=require('jsonwebtoken');
const {createClient}=require('@supabase/supabase-js');

const SUPABASE_URL=String(process.env.SUPABASE_URL||'').trim();
const SERVICE_KEY=String(process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim();
const JWT_SECRET=String(process.env.JWT_SECRET||'').trim();
const DEFAULT_GROUP='https://chat.whatsapp.com/GySPeuvDlI14BnWWvdm7U4?s=sh&p=a&mlu=4&ilr=4';

function bearer(req){const v=String(req.headers.authorization||'');return v.startsWith('Bearer ')?v.slice(7).trim():'';}
function verifyAdmin(req){try{return jwt.verify(bearer(req),JWT_SECRET,{algorithms:['HS256'],issuer:'doberto-vcf',audience:'doberto-vcf-admin'});}catch(_){return null;}}
function validGroupUrl(value){try{const u=new URL(String(value||'').trim());return u.protocol==='https:'&&u.hostname==='chat.whatsapp.com'&&u.pathname.length>5;}catch(_){return false;}}

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(!verifyAdmin(req)) return res.status(401).json({error:'Sesyon admin lan pa valid.'});
  if(!SUPABASE_URL||!SERVICE_KEY) return res.status(503).json({error:'Database lan poko configure.'});
  const supabase=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  if(req.method==='GET'){
    const {data,error}=await supabase.from('app_settings').select('value,updated_at').eq('key','whatsapp_group_url').maybeSingle();
    if(error) return res.status(500).json({error:'Nou pa ka chaje group link la.'});
    return res.json({ok:true,whatsappGroupUrl:String(data?.value||DEFAULT_GROUP),updatedAt:data?.updated_at||null});
  }
  if(req.method==='PUT'||req.method==='POST'){
    const value=String(req.body?.whatsappGroupUrl||'').trim();
    if(!validGroupUrl(value)) return res.status(400).json({error:'Mete yon link group WhatsApp valid ki kòmanse ak https://chat.whatsapp.com/'});
    const {error}=await supabase.from('app_settings').upsert({key:'whatsapp_group_url',value,updated_at:new Date().toISOString()},{onConflict:'key'});
    if(error) return res.status(500).json({error:'Nou pa ka sove group link la.'});
    return res.json({ok:true,whatsappGroupUrl:value});
  }
  return res.status(405).json({error:'Method not allowed'});
};
