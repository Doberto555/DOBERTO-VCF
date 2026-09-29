require('../lib/runtime-secrets');
const jwt=require('jsonwebtoken');
const {createClient}=require('@supabase/supabase-js');

const SUPABASE_URL=String(process.env.SUPABASE_URL||'').trim();
const SERVICE_KEY=String(process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim();
const JWT_SECRET=String(process.env.JWT_SECRET||'').trim();
const PREFIX='group_migration_';

function bearer(req){const v=String(req.headers.authorization||'');return v.startsWith('Bearer ')?v.slice(7).trim():'';}
function verifyUser(req){
  try{
    const p=jwt.verify(bearer(req),JWT_SECRET,{algorithms:['HS256'],issuer:'doberto-vcf',audience:'doberto-vcf-user'});
    return p?.purpose==='user_session'&&p?.userId?p:null;
  }catch(_){return null;}
}
function validGroupUrl(value){
  try{
    const u=new URL(String(value||'').trim());
    return u.protocol==='https:'&&u.hostname==='chat.whatsapp.com'&&/^\/[A-Za-z0-9_-]{10,}/.test(u.pathname);
  }catch(_){return false;}
}
function iso(){return new Date().toISOString();}

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Pragma','no-cache');
  if(!['GET','POST'].includes(req.method)) return res.status(405).json({error:'Method not allowed'});

  const user=verifyUser(req);
  if(!user) return res.status(401).json({code:'auth_required',error:'Konekte ak kont ou pou verifye migration gwoup la.'});
  if(!SUPABASE_URL||!SERVICE_KEY) return res.status(503).json({error:'Database lan poko configure.'});

  const supabase=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:registration,error:regError}=await supabase
    .from('registrations')
    .select('id')
    .eq('user_id',user.userId)
    .maybeSingle();

  if(regError) return res.status(500).json({error:'Nou pa ka verifye enskripsyon ou.'});
  if(!registration) return res.status(200).json({ok:true,eligible:false,reason:'not_registered'});

  const campaignKey=PREFIX+registration.id;
  const [{data:campaign,error:campaignError},{data:settings,error:settingsError}]=await Promise.all([
    supabase.from('notification_campaigns').select('campaign_key,status,attempts,updated_at,details').eq('campaign_key',campaignKey).maybeSingle(),
    supabase.from('app_settings').select('key,value').in('key',['group_migration_active','group_migration_group_url','group_migration_started_at'])
  ]);

  if(campaignError||settingsError) return res.status(500).json({error:'Nou pa ka verifye migration gwoup la.'});

  const map=Object.fromEntries((settings||[]).map(row=>[row.key,String(row.value||'').trim()]));
  const active=map.group_migration_active==='true';
  const details=campaign?.details&&typeof campaign.details==='object'?campaign.details:{};
  const groupUrl=validGroupUrl(details.groupUrl)?details.groupUrl:(validGroupUrl(map.group_migration_group_url)?map.group_migration_group_url:'');

  if(req.method==='GET'){
    return res.json({
      ok:true,
      eligible:Boolean(campaign),
      active,
      status:campaign?.status||'not_eligible',
      groupUrl:campaign&&active?groupUrl:'',
      startedAt:map.group_migration_started_at||details.startedAt||null,
      openedAt:details.openedAt||null,
      joinedAt:details.joinedAt||null
    });
  }

  if(!campaign) return res.status(404).json({error:'Kont sa a pa nan migration aktyèl la.'});
  if(!active) return res.status(409).json({error:'Migration gwoup la pa aktif kounye a.'});

  const action=String(req.body?.action||'').trim();
  if(!['opened','joined'].includes(action)) return res.status(400).json({error:'Aksyon migration lan pa valid.'});

  const now=iso();
  const nextDetails={...details};
  let nextStatus=campaign.status||'pending';
  let attempts=Number(campaign.attempts||0);

  if(action==='opened'){
    if(nextStatus!=='joined') nextStatus='opened';
    if(!nextDetails.openedAt) nextDetails.openedAt=now;
    attempts=Math.min(9999,attempts+1);
  }

  if(action==='joined'){
    nextStatus='joined';
    if(!nextDetails.openedAt) nextDetails.openedAt=now;
    nextDetails.joinedAt=now;
  }

  const {error:updateError}=await supabase.from('notification_campaigns').update({
    status:nextStatus,
    attempts,
    updated_at:now,
    details:nextDetails
  }).eq('campaign_key',campaignKey);

  if(updateError) return res.status(500).json({error:'Nou pa ka mete migration lan ajou.'});
  return res.json({ok:true,eligible:true,active:true,status:nextStatus,groupUrl,openedAt:nextDetails.openedAt||null,joinedAt:nextDetails.joinedAt||null});
};
