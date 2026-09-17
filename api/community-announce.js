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
function verifyUser(req){try{const p=jwt.verify(bearer(req),JWT_SECRET,{algorithms:['HS256'],issuer:'doberto-vcf',audience:'doberto-vcf-user'});return p?.purpose==='user_session'&&p?.userId?p:null;}catch(_){return null;}}
function validGroupUrl(value){try{const u=new URL(String(value||'').trim());return u.protocol==='https:'&&u.hostname==='chat.whatsapp.com'&&/^\/[A-Za-z0-9_-]{10,}/.test(u.pathname);}catch(_){return false;}}
function validBotUrl(value){try{const u=new URL(String(value||'').trim());return u.protocol==='https:'&&ALLOWED_BOT_HOSTS.has(u.hostname.toLowerCase())&&!u.username&&!u.password&&!u.hash;}catch(_){return false;}}

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Pragma','no-cache');
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const user=verifyUser(req);
  if(!user) return res.status(401).json({error:'Sesyon itilizatè a pa valid.'});
  if(!SUPABASE_URL||!SERVICE_KEY) return res.status(503).json({error:'Database lan poko configure.'});

  const supabase=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:registration,error:regError}=await supabase.from('registrations').select('id,name,dial_code,phone,full_number').eq('user_id',user.userId).maybeSingle();
  if(regError) return res.status(500).json({error:'Nou pa ka li enskripsyon an.'});
  if(!registration) return res.status(404).json({error:'Enskripsyon an pa jwenn.'});

  const {data:existingAnnouncement,error:announcementError}=await supabase
    .from('community_announcements')
    .select('status,announced_at,updated_at,attempts')
    .eq('registration_id',registration.id)
    .maybeSingle();
  if(announcementError) return res.status(500).json({error:'Nou pa ka verifye anons kominote a.'});
  if(existingAnnouncement?.status==='sent'&&existingAnnouncement?.announced_at){
    return res.status(200).json({ok:true,queued:false,sent:true,alreadySent:true});
  }

  const now=new Date().toISOString();
  const attempts=Math.min(10,Number(existingAnnouncement?.attempts||0)+1);
  await supabase.from('community_announcements').upsert({registration_id:registration.id,status:'pending',attempts,updated_at:now},{onConflict:'registration_id',ignoreDuplicates:false});

  const {data:settings}=await supabase.from('app_settings').select('key,value').in('key',['whatsapp_group_url','vcf_bot_api_url','vcf_bot_api_token']);
  const map=Object.fromEntries((settings||[]).map(row=>[row.key,String(row.value||'').trim()]));
  const groupUrl=validGroupUrl(map.whatsapp_group_url)?map.whatsapp_group_url:DEFAULT_GROUP;
  const botApiUrl=validBotUrl(map.vcf_bot_api_url)?map.vcf_bot_api_url.replace(/\/+$/,''):DEFAULT_BOT_API;
  const token=map.vcf_bot_api_token||'';

  if(token.length<24){
    await supabase.from('community_announcements').update({status:'pending',last_error:'bot_token_not_configured',updated_at:now}).eq('registration_id',registration.id);
    return res.status(202).json({ok:true,queued:true,sent:false,reason:'bot_not_configured'});
  }

  const fullNumber=String(registration.full_number||`${registration.dial_code||''}${registration.phone||''}`).replace(/\D/g,'');
  try{
    await supabase.from('community_announcements').update({status:'processing',attempts,last_error:null,updated_at:now}).eq('registration_id',registration.id);
    const response=await fetch(`${botApiUrl}/api/integrations/vcf/registration`,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`,'User-Agent':'DOBERTO-VCF/2.0'},
      body:JSON.stringify({name:registration.name,phone:fullNumber,groupUrl}),
      signal:AbortSignal.timeout(5000),
      redirect:'error'
    });
    const payload=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(payload.error||`bot_http_${response.status}`);
    await supabase.from('community_announcements').update({status:'sent',last_error:null,announced_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('registration_id',registration.id);
    return res.json({ok:true,queued:true,sent:true});
  }catch(error){
    await supabase.from('community_announcements').update({status:'failed',last_error:String(error?.message||'dispatch_failed').slice(0,160),updated_at:new Date().toISOString()}).eq('registration_id',registration.id);
    return res.status(202).json({ok:true,queued:true,sent:false,reason:'bot_unavailable'});
  }
};
