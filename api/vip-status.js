require('../lib/runtime-secrets');
const jwt=require('jsonwebtoken');
const {createClient}=require('@supabase/supabase-js');

process.env.MONCASH_CLIENT_ID=String(process.env.MONCASH_CLIENT_ID||'').trim();
process.env.MONCASH_CLIENT_SECRET=String(process.env.MONCASH_CLIENT_SECRET||'').trim();
process.env.MONCASH_MODE=String(process.env.MONCASH_MODE||'sandbox').trim().toLowerCase();

const api=require('../lib/vip-api');
const supabase=createClient(
  String(process.env.SUPABASE_URL||'').trim(),
  String(process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim()
);
const TTL_MS=20*60*1000;
let tokenCache={token:'',expiresAt:0};

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
function configured(){return Boolean(process.env.MONCASH_CLIENT_ID&&process.env.MONCASH_CLIENT_SECRET);}
function restBase(){return process.env.MONCASH_MODE==='live'?'https://moncashbutton.digicelgroup.com/Api':'https://sandbox.moncashbutton.digicelgroup.com/Api';}
async function providerToken(){
  if(!configured())return '';
  if(tokenCache.token&&Date.now()<tokenCache.expiresAt-5000)return tokenCache.token;
  const basic=Buffer.from(`${process.env.MONCASH_CLIENT_ID}:${process.env.MONCASH_CLIENT_SECRET}`).toString('base64');
  const r=await fetch(`${restBase()}/oauth/token`,{method:'POST',headers:{Authorization:`Basic ${basic}`,Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:'scope=read,write&grant_type=client_credentials'});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||!d.access_token)throw new Error('MONCASH_AUTH_FAILED');
  tokenCache={token:d.access_token,expiresAt:Date.now()+Math.max(30,Number(d.expires_in||59))*1000};
  return tokenCache.token;
}
async function expireStale(uid){
  const cutoff=new Date(Date.now()-TTL_MS).toISOString();
  const {error}=await supabase.from('vip_moncash_orders').update({status:'expired',updated_at:new Date().toISOString()}).eq('user_id',uid).in('status',['created','redirected']).lt('created_at',cutoff);
  if(error)throw error;
}
async function reconcile(uid){
  if(!uid)return;
  await expireStale(uid);
  if(!configured())return;
  const cutoff=new Date(Date.now()-TTL_MS).toISOString();
  const {data:order,error}=await supabase.from('vip_moncash_orders').select('order_id,amount').eq('user_id',uid).in('status',['created','redirected']).gte('created_at',cutoff).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(error)throw error;
  if(!order)return;
  try{
    const token=await providerToken();
    const r=await fetch(`${restBase()}/v1/RetrieveOrderPayment`,{method:'POST',headers:{Authorization:`Bearer ${token}`,Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({orderId:String(order.order_id)})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)return;
    const p=d?.payment||{};
    const ok=String(p.message||'').trim().toLowerCase()==='successful';
    const reference=String(p.reference||'').trim();
    const transactionId=String(p.transaction_id||'').trim();
    const cost=Number(p.cost);
    if(!ok||reference!==String(order.order_id)||!transactionId||!Number.isFinite(cost))return;
    if(Math.round(Number(order.amount)*100)!==Math.round(cost*100))return;
    const {error:activationError}=await supabase.rpc('activate_vip_moncash_once',{p_order_id:order.order_id,p_user_id:uid,p_transaction_id:transactionId});
    if(activationError)throw activationError;
  }catch(e){console.warn('[VIP MonCash reconcile]',e.message||e);}
}

module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const uid=userId(req);
  if(uid){try{await reconcile(uid);}catch(e){console.warn('[VIP stale payment cleanup]',e.message||e);}}
  return api.status(req,res);
};
