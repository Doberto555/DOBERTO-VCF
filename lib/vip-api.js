const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim();
const SITE_URL = String(process.env.SITE_URL || 'https://dobertovcf.online').replace(/\/$/, '');
const supabase = createClient(SUPABASE_URL || 'https://example.supabase.co', SERVICE_KEY || 'missing');

function json(res,status,data){res.status(status).setHeader('Cache-Control','no-store');return res.json(data);}
function bearer(req){const a=String(req.headers.authorization||'');return a.startsWith('Bearer ')?a.slice(7).trim():'';}
function verifyUser(req,res){
  try{
    const p=jwt.verify(bearer(req),JWT_SECRET,{algorithms:['HS256'],issuer:'doberto-vcf',audience:'doberto-vcf-user'});
    if(p.purpose!=='user_session'||!p.userId)throw new Error('bad');return p;
  }catch(_){json(res,401,{code:'auth_required',error:'Konekte ak Google anvan.'});return null;}
}
function verifyAdmin(req,res){
  try{return jwt.verify(bearer(req),JWT_SECRET,{algorithms:['HS256'],issuer:'doberto-vcf',audience:'doberto-vcf-admin'});}
  catch(_){json(res,401,{code:'admin_required',error:'Sesyon admin lan pa valid.'});return null;}
}
function methodConfigured(row){return Boolean(row&&row.enabled&&Number(row.amount)>0&&Number(row.duration_days)>0&&String(row.recipient_value||'').trim());}
function publicMethod(row){return {method:row.method,displayName:row.display_name,enabled:Boolean(row.enabled),configured:methodConfigured(row),amount:Number(row.amount||0),currency:row.currency,durationDays:Number(row.duration_days||0),recipientLabel:row.recipient_label||'',recipientValue:row.method==='moncash'?'MonCash':row.recipient_value||'',instructions:row.instructions||''};}
async function getMethod(method){const {data,error}=await supabase.from('vip_payment_methods').select('*').eq('method',method).maybeSingle();if(error)throw error;return data;}

async function currentVip(userId){
  const {data,error}=await supabase.from('app_users').select('plan,vip_started_at,vip_expires_at').eq('id',userId).maybeSingle();
  if(error)throw error;if(!data)return {active:false,plan:'free'};
  const expiry=data.vip_expires_at?new Date(data.vip_expires_at).getTime():0;
  if(data.plan==='vip'&&expiry&&expiry<=Date.now()){
    await supabase.from('app_users').update({plan:'free',vip_started_at:null,vip_expires_at:null}).eq('id',userId);
    return {active:false,plan:'free',expiresAt:null};
  }
  return {active:data.plan==='vip',plan:data.plan==='vip'?'vip':'free',startedAt:data.vip_started_at||null,expiresAt:data.vip_expires_at||null};
}
async function pendingPayment(userId){
  const [{data:manual,error:manualError},{data:moncash,error:moncashError}]=await Promise.all([
    supabase.from('vip_payment_requests').select('method,status,created_at').eq('user_id',userId).eq('status','pending').order('created_at',{ascending:false}).limit(1).maybeSingle(),
    supabase.from('vip_moncash_orders').select('status,created_at').eq('user_id',userId).in('status',['created','redirected']).gte('created_at',new Date(Date.now()-20*60000).toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle()
  ]);
  if(manualError)throw manualError;if(moncashError)throw moncashError;
  if(manual)return {method:manual.method,status:'pending',createdAt:manual.created_at};
  if(moncash)return {method:'moncash',status:'pending',createdAt:moncash.created_at};
  return null;
}
async function activateVip(userId,durationDays){
  const days=Math.max(1,Math.min(3650,Number(durationDays)||0));if(!days)throw new Error('VIP_DURATION_INVALID');
  const state=await currentVip(userId);const now=Date.now();const existing=state.active&&state.expiresAt?new Date(state.expiresAt).getTime():0;const base=Math.max(now,existing);const expiresAt=new Date(base+days*86400000).toISOString();
  const {error}=await supabase.from('app_users').update({plan:'vip',vip_started_at:state.startedAt||new Date(now).toISOString(),vip_expires_at:expiresAt}).eq('id',userId);if(error)throw error;
  await supabase.from('google_connections').update({next_sync_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('user_id',userId);
  return {active:true,plan:'vip',expiresAt};
}

const getMonCashMode=()=>String(process.env.MONCASH_MODE||'sandbox').toLowerCase()==='live'?'live':'sandbox';
const restBase=()=>getMonCashMode()==='live'?'https://moncashbutton.digicelgroup.com/Api':'https://sandbox.moncashbutton.digicelgroup.com/Api';
const gatewayBase=()=>getMonCashMode()==='live'?'https://moncashbutton.digicelgroup.com/Moncash-middleware':'https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware';
const moncashConfigured=()=>Boolean(process.env.MONCASH_CLIENT_ID&&process.env.MONCASH_CLIENT_SECRET);
let tokenCache={token:'',expiresAt:0};
async function moncashToken(){
  if(!moncashConfigured())throw new Error('MONCASH_NOT_CONFIGURED');
  if(tokenCache.token&&Date.now()<tokenCache.expiresAt-5000)return tokenCache.token;
  const basic=Buffer.from(`${process.env.MONCASH_CLIENT_ID}:${process.env.MONCASH_CLIENT_SECRET}`).toString('base64');
  const r=await fetch(`${restBase()}/oauth/token`,{method:'POST',headers:{Authorization:`Basic ${basic}`,Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:'scope=read,write&grant_type=client_credentials'});
  const d=await r.json().catch(()=>({}));if(!r.ok||!d.access_token)throw new Error('MONCASH_AUTH_FAILED');tokenCache={token:d.access_token,expiresAt:Date.now()+Math.max(30,Number(d.expires_in||59))*1000};return d.access_token;
}
async function moncashApi(path,body){const token=await moncashToken();const r=await fetch(`${restBase()}${path}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(body||{})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`MONCASH_API_${r.status}`);return d;}

async function status(req,res){const user=verifyUser(req,res);if(!user)return;try{const vip=await currentVip(user.userId);const paymentPending=vip.active?null:await pendingPayment(user.userId);return json(res,200,{ok:true,...vip,paymentPending});}catch(e){return json(res,500,{error:'Nou pa ka chaje VIP kounye a.'});}}
async function methods(req,res){const user=verifyUser(req,res);if(!user)return;try{const {data,error}=await supabase.from('vip_payment_methods').select('*').order('sort_order');if(error)throw error;return json(res,200,{ok:true,methods:(data||[]).map(publicMethod)});}catch(e){return json(res,500,{error:'Nou pa ka chaje metòd peman yo.'});}}
async function submitManual(req,res){const user=verifyUser(req,res);if(!user)return;try{
  const method=String(req.body?.method||'').toLowerCase();if(!['natcash','binance'].includes(method))return json(res,400,{error:'Metòd peman sa a pa valid.'});
  const ref=String(req.body?.transactionRef||'').trim().slice(0,120);const note=String(req.body?.note||'').trim().slice(0,500);if(ref.length<4)return json(res,400,{error:'Mete yon referans tranzaksyon valid.'});
  const m=await getMethod(method);if(!methodConfigured(m))return json(res,409,{error:'Metòd sa a poko configure.'});
  const {data:pending}=await supabase.from('vip_payment_requests').select('id').eq('user_id',user.userId).eq('status','pending').maybeSingle();if(pending)return json(res,409,{error:'Ou deja gen yon peman VIP an atant.'});
  const {data,error}=await supabase.from('vip_payment_requests').insert({user_id:user.userId,method,amount:m.amount,currency:m.currency,duration_days:m.duration_days,recipient_snapshot:m.recipient_value,transaction_ref:ref,note:note||null}).select('id,status').single();if(error){if(String(error.code)==='23505')return json(res,409,{error:'Referans tranzaksyon sa a deja itilize.'});throw error;}
  return json(res,201,{ok:true,request:data});
}catch(e){return json(res,500,{error:'Nou pa ka voye demann peman an.'});}}

async function moncashCreate(req,res){const user=verifyUser(req,res);if(!user)return;try{
  if(!moncashConfigured())return json(res,503,{error:'MonCash poko configure sou sèvè a.'});const m=await getMethod('moncash');if(!methodConfigured(m))return json(res,409,{error:'MonCash VIP poko aktive.'});
  const {data:pending}=await supabase.from('vip_moncash_orders').select('id').eq('user_id',user.userId).in('status',['created','redirected']).gte('created_at',new Date(Date.now()-20*60000).toISOString()).maybeSingle();if(pending)return json(res,409,{error:'Gen yon peman MonCash deja an atant.'});
  const orderId=`${Date.now()}${Math.floor(100000+Math.random()*900000)}`;const payload=await moncashApi('/v1/CreatePayment',{amount:Number(m.amount),orderId});const paymentToken=String(payload?.payment_token?.token||'');if(!paymentToken)throw new Error('MONCASH_TOKEN_MISSING');
  const {error}=await supabase.from('vip_moncash_orders').insert({order_id:orderId,user_id:user.userId,amount:m.amount,currency:m.currency,duration_days:m.duration_days,payment_token:paymentToken,status:'redirected'});if(error)throw error;
  return json(res,201,{ok:true,orderId,amount:Number(m.amount),currency:m.currency,redirectUrl:`${gatewayBase()}/Payment/Redirect?token=${encodeURIComponent(paymentToken)}`});
}catch(e){console.error('[VIP MonCash create]',e);return json(res,502,{error:'Nou pa ka kòmanse peman MonCash la.'});}}

async function moncashVerify(req,res){const user=verifyUser(req,res);if(!user)return;try{
  if(!moncashConfigured())return json(res,503,{error:'MonCash poko configure.'});const transactionId=String(req.body?.transactionId||'').trim();const orderId=String(req.body?.orderId||'').trim();if(!transactionId&&!orderId)return json(res,400,{error:'Referans MonCash manke.'});
  const payload=transactionId?await moncashApi('/v1/RetrieveTransactionPayment',{transactionId}):await moncashApi('/v1/RetrieveOrderPayment',{orderId});const p=payload?.payment||{};const reference=String(p.reference||'').trim();const tx=String(p.transaction_id||transactionId||'').trim();const cost=Number(p.cost);if(String(p.message||'').toLowerCase()!=='successful'||!reference||!tx||!Number.isFinite(cost))return json(res,409,{error:'MonCash poko konfime peman an.'});
  const {data:order,error}=await supabase.from('vip_moncash_orders').select('*').eq('order_id',reference).eq('user_id',user.userId).maybeSingle();if(error||!order)return json(res,403,{error:'Peman sa a pa koresponn ak kont ou.'});if(Math.round(Number(order.amount)*100)!==Math.round(cost*100))return json(res,409,{error:'Montan peman an pa koresponn.'});
  if(order.status!=='paid'){const {error:updateError}=await supabase.from('vip_moncash_orders').update({status:'paid',transaction_id:tx,paid_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',order.id);if(updateError)throw updateError;}
  const vip=await activateVip(user.userId,order.duration_days);return json(res,200,{ok:true,verified:true,...vip});
}catch(e){console.error('[VIP MonCash verify]',e);return json(res,502,{error:'Nou pa ka verifye peman MonCash la kounye a.'});}}

async function adminMethods(req,res){if(!verifyAdmin(req,res))return;try{
  if(req.method==='GET'){const {data,error}=await supabase.from('vip_payment_methods').select('*').order('sort_order');if(error)throw error;return json(res,200,{ok:true,methods:data||[]});}
  if(req.method!=='PUT')return json(res,405,{error:'Method not allowed'});const method=String(req.body?.method||'').toLowerCase();if(!['natcash','moncash','binance'].includes(method))return json(res,400,{error:'Metòd invalid.'});
  const amount=Number(req.body?.amount);const durationDays=Number(req.body?.durationDays);const currency=String(req.body?.currency||'HTG').trim().toUpperCase().slice(0,10);const recipient=String(req.body?.recipientValue||'').trim().slice(0,200);const enabled=req.body?.enabled===true;const instructions=String(req.body?.instructions||'').trim().slice(0,500);
  if(enabled&&(!Number.isFinite(amount)||amount<=0||!Number.isInteger(durationDays)||durationDays<=0||!recipient))return json(res,400,{error:'Ranpli montan, dire VIP ak destinasyon peman an anvan ou aktive metòd la.'});
  const {data,error}=await supabase.from('vip_payment_methods').update({enabled,amount:Number.isFinite(amount)&&amount>0?amount:null,currency,duration_days:Number.isInteger(durationDays)&&durationDays>0?durationDays:null,recipient_value:recipient||null,instructions:instructions||null,updated_at:new Date().toISOString()}).eq('method',method).select('*').single();if(error)throw error;return json(res,200,{ok:true,method:data});
}catch(e){return json(res,500,{error:'Nou pa ka sove konfigirasyon peman an.'});}}

async function adminPayments(req,res){if(!verifyAdmin(req,res))return;try{
  if(req.method==='GET'){const {data,error}=await supabase.from('vip_payment_requests').select('id,user_id,method,amount,currency,duration_days,transaction_ref,note,status,created_at,reviewed_at,review_note').order('created_at',{ascending:false}).limit(100);if(error)throw error;return json(res,200,{ok:true,requests:data||[]});}
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});const id=String(req.body?.id||'');const action=String(req.body?.action||'');if(!['approve','reject'].includes(action))return json(res,400,{error:'Aksyon invalid.'});const {data:reqRow,error:readError}=await supabase.from('vip_payment_requests').select('*').eq('id',id).eq('status','pending').maybeSingle();if(readError||!reqRow)return json(res,404,{error:'Demann lan pa disponib ankò.'});
  let vip=null;if(action==='approve')vip=await activateVip(reqRow.user_id,reqRow.duration_days);const {error}=await supabase.from('vip_payment_requests').update({status:action==='approve'?'approved':'rejected',reviewed_at:new Date().toISOString(),reviewed_by:'owner',review_note:String(req.body?.note||'').trim().slice(0,300)||null}).eq('id',id);if(error)throw error;return json(res,200,{ok:true,status:action==='approve'?'approved':'rejected',vip});
}catch(e){return json(res,500,{error:'Nou pa ka revize peman sa a.'});}}

function moncashReturn(req,res){const transactionId=String(req.body?.transactionId||req.query?.transactionId||req.body?.transaction_id||req.query?.transaction_id||'').trim();const orderId=String(req.body?.orderId||req.query?.orderId||req.body?.order_id||req.query?.order_id||'').trim();const q=new URLSearchParams({moncash:'return'});if(transactionId)q.set('transactionId',transactionId);if(orderId)q.set('orderId',orderId);return res.redirect(303,`${SITE_URL}/vip.html?${q.toString()}`);}

module.exports={status,methods,submitManual,moncashCreate,moncashVerify,moncashReturn,adminMethods,adminPayments};
