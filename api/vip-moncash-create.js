require('../lib/runtime-secrets');
const jwt=require('jsonwebtoken');
const {createClient}=require('@supabase/supabase-js');

// Normalize MonCash env values before loading the shared VIP API.
process.env.MONCASH_CLIENT_ID=String(process.env.MONCASH_CLIENT_ID||'').trim();
process.env.MONCASH_CLIENT_SECRET=String(process.env.MONCASH_CLIENT_SECRET||'').trim();
process.env.MONCASH_MODE=String(process.env.MONCASH_MODE||'sandbox').trim().toLowerCase();

const api=require('../lib/vip-api');
const supabase=createClient(
  String(process.env.SUPABASE_URL||'').trim(),
  String(process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim()
);

function userId(req){
  try{
    const auth=String(req.headers.authorization||'');
    const token=auth.startsWith('Bearer ')?auth.slice(7).trim():'';
    const payload=jwt.verify(token,String(process.env.JWT_SECRET||'').trim(),{
      algorithms:['HS256'],issuer:'doberto-vcf',audience:'doberto-vcf-user'
    });
    return payload.purpose==='user_session'&&payload.userId?String(payload.userId):'';
  }catch(_){return '';}
}

async function cleanup(uid){
  if(!uid)return;
  const cutoff=new Date(Date.now()-20*60*1000).toISOString();
  const {error}=await supabase.from('vip_moncash_orders')
    .update({status:'expired',updated_at:new Date().toISOString()})
    .eq('user_id',uid)
    .in('status',['created','redirected'])
    .lt('created_at',cutoff);
  if(error)throw error;
}

module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const uid=userId(req);
  if(uid){try{await cleanup(uid);}catch(e){console.warn('[MonCash create cleanup]',e.message||e);}}
  return api.moncashCreate(req,res);
};
