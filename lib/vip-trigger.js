const jwt=require('jsonwebtoken');
const {createClient}=require('@supabase/supabase-js');
const {createGoogleSync}=require('./google-sync');

const url=String(process.env.SUPABASE_URL||'').trim();
const serviceKey=String(process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim();
const jwtSecret=String(process.env.JWT_SECRET||'').trim();
const siteUrl=String(process.env.SITE_URL||'https://dobertovcf.online').replace(/\/$/,'');
const supabase=createClient(url||'https://example.supabase.co',serviceKey||'missing');
const googleSync=createGoogleSync({supabase,siteUrl,jwtSecret,serviceRoleKey:serviceKey,namePrefix:String(process.env.NAME_PREFIX||'D.M.L').trim()});

function bearer(req){const a=String(req.headers.authorization||'');return a.startsWith('Bearer ')?a.slice(7).trim():'';}
function user(req){const p=jwt.verify(bearer(req),jwtSecret,{algorithms:['HS256'],issuer:'doberto-vcf',audience:'doberto-vcf-user'});if(p.purpose!=='user_session'||!p.userId)throw new Error('AUTH');return p;}

module.exports=async function triggerVipSync(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  let u;try{u=user(req);}catch(_){return res.status(401).json({error:'Konekte ak Google anvan.'});}
  try{
    const {data:registration,error}=await supabase.from('registrations').select('id,created_at').eq('user_id',u.userId).maybeSingle();
    if(error)throw error;if(!registration)return res.status(409).json({error:'Fini enskripsyon an anvan.'});
    const claim=await supabase.from('vip_sync_events').insert({registration_id:registration.id,triggered_by:u.userId,details:{source:'registration'}});
    if(claim.error&&String(claim.error.code||'')==='23505')return res.json({ok:true,skipped:'already_triggered'});
    if(claim.error)throw claim.error;
    const results=await googleSync.syncActiveVipUsers(50);
    await supabase.from('vip_sync_events').update({processed_at:new Date().toISOString(),details:{source:'registration',vipAccountsProcessed:results.length}}).eq('registration_id',registration.id);
    return res.json({ok:true,vipAccountsProcessed:results.length});
  }catch(error){console.error('[VIP instant sync]',error);return res.status(500).json({error:'VIP instant sync pa t fini.'});}
};
