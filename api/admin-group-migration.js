require('../lib/runtime-secrets');
const jwt=require('jsonwebtoken');
const {createClient}=require('@supabase/supabase-js');

const SUPABASE_URL=String(process.env.SUPABASE_URL||'').trim();
const SERVICE_KEY=String(process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim();
const JWT_SECRET=String(process.env.JWT_SECRET||'').trim();
const SITE_URL=String(process.env.SITE_URL||'https://dobertovcf.online').replace(/\/$/,'');
const ONESIGNAL_APP_ID=String(process.env.ONESIGNAL_APP_ID||'').trim();
const ONESIGNAL_REST_API_KEY=String(process.env.ONESIGNAL_REST_API_KEY||'').trim();
const PREFIX='group_migration_';

function bearer(req){const v=String(req.headers.authorization||'');return v.startsWith('Bearer ')?v.slice(7).trim():'';}
function verifyAdmin(req){
  try{
    const p=jwt.verify(bearer(req),JWT_SECRET,{algorithms:['HS256'],issuer:'doberto-vcf',audience:'doberto-vcf-admin'});
    return p?.role==='admin'?p:null;
  }catch(_){return null;}
}
function validGroupUrl(value){
  try{
    const u=new URL(String(value||'').trim());
    return u.protocol==='https:'&&u.hostname==='chat.whatsapp.com'&&/^\/[A-Za-z0-9_-]{10,}/.test(u.pathname);
  }catch(_){return false;}
}
function pushConfigured(){
  return Boolean(ONESIGNAL_APP_ID&&ONESIGNAL_REST_API_KEY&&!ONESIGNAL_APP_ID.includes('REPLACE_WITH')&&!ONESIGNAL_REST_API_KEY.includes('REPLACE_WITH'));
}
async function settingMap(supabase){
  const {data,error}=await supabase.from('app_settings').select('key,value,updated_at').in('key',[
    'whatsapp_group_url','group_migration_active','group_migration_group_url','group_migration_started_at','group_migration_last_push_at','group_migration_last_push_recipients','group_migration_last_push_id'
  ]);
  if(error) throw error;
  return Object.fromEntries((data||[]).map(row=>[row.key,row]));
}
async function counts(supabase){
  const statuses=['pending','opened','joined'];
  const result={total:0,pending:0,opened:0,joined:0};
  const all=await supabase.from('notification_campaigns').select('campaign_key',{count:'exact',head:true}).like('campaign_key',PREFIX+'%');
  if(all.error) throw all.error;
  result.total=all.count||0;
  for(const status of statuses){
    const q=await supabase.from('notification_campaigns').select('campaign_key',{count:'exact',head:true}).like('campaign_key',PREFIX+'%').eq('status',status);
    if(q.error) throw q.error;
    result[status]=q.count||0;
  }
  return result;
}
async function state(supabase){
  const [map,stats]=await Promise.all([settingMap(supabase),counts(supabase)]);
  return {
    ok:true,
    active:String(map.group_migration_active?.value||'')==='true',
    groupUrl:String(map.group_migration_group_url?.value||map.whatsapp_group_url?.value||''),
    currentGroupUrl:String(map.whatsapp_group_url?.value||''),
    startedAt:map.group_migration_started_at?.value||null,
    lastPushAt:map.group_migration_last_push_at?.value||null,
    lastPushRecipients:Number(map.group_migration_last_push_recipients?.value||0)||0,
    lastPushId:map.group_migration_last_push_id?.value||null,
    pushConfigured:pushConfigured(),
    stats
  };
}
async function listRegistrationIds(supabase){
  const ids=[];
  const pageSize=1000;
  for(let from=0;from<50000;from+=pageSize){
    const {data,error}=await supabase.from('registrations').select('id').order('created_at',{ascending:true}).range(from,from+pageSize-1);
    if(error) throw error;
    const batch=data||[];
    ids.push(...batch.map(row=>row.id).filter(Boolean));
    if(batch.length<pageSize) break;
  }
  return ids;
}
async function sendPush(){
  if(!pushConfigured()) throw new Error('OneSignal poko configure pou push notifications.');
  const response=await fetch('https://api.onesignal.com/notifications',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':'Key '+ONESIGNAL_REST_API_KEY
    },
    body:JSON.stringify({
      app_id:ONESIGNAL_APP_ID,
      target_channel:'push',
      included_segments:['Subscribed Users'],
      headings:{en:'DOBERTO VCF',fr:'DOBERTO VCF'},
      contents:{
        en:'The WhatsApp group has changed. Open DOBERTO VCF to join the new group.',
        fr:'Le groupe WhatsApp a changé. Ouvrez DOBERTO VCF pour rejoindre le nouveau groupe.'
      },
      url:SITE_URL+'/community.html?migration=1',
      name:'group-migration-'+Date.now()
    }),
    signal:AbortSignal.timeout(12000)
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data?.errors?.[0]||data?.error||('OneSignal '+response.status));
  return data;
}

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Pragma','no-cache');
  if(!verifyAdmin(req)) return res.status(401).json({error:'Sesyon admin lan pa valid.'});
  if(!SUPABASE_URL||!SERVICE_KEY) return res.status(503).json({error:'Database lan poko configure.'});
  if(!['GET','POST'].includes(req.method)) return res.status(405).json({error:'Method not allowed'});

  const supabase=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  if(req.method==='GET'){
    try{return res.json(await state(supabase));}
    catch(error){return res.status(500).json({error:'Nou pa ka chaje estatistik migration yo.'});}
  }

  const action=String(req.body?.action||'').trim();
  try{
    if(action==='start'){
      const current=await state(supabase);
      if(current.active) return res.status(409).json({error:'Yon migration deja aktif. Fèmen li anvan ou kòmanse yon lòt.'});
      if(!validGroupUrl(current.currentGroupUrl)) return res.status(400).json({error:'Sove nouvo link gwoup WhatsApp la anvan ou kòmanse migration lan.'});

      const ids=await listRegistrationIds(supabase);
      if(!ids.length) return res.status(400).json({error:'Pa gen ansyen manm pou migrate.'});

      // Reset only previous group-migration markers so a new migration is a clean snapshot.
      const clear=await supabase.from('notification_campaigns').delete().like('campaign_key',PREFIX+'%');
      if(clear.error) throw clear.error;

      const now=new Date().toISOString();
      for(let i=0;i<ids.length;i+=400){
        const rows=ids.slice(i,i+400).map(id=>({
          campaign_key:PREFIX+id,
          status:'pending',
          attempts:0,
          sent_at:null,
          updated_at:now,
          details:{registrationId:id,groupUrl:current.currentGroupUrl,startedAt:now}
        }));
        const {error}=await supabase.from('notification_campaigns').upsert(rows,{onConflict:'campaign_key',ignoreDuplicates:false});
        if(error) throw error;
      }

      const settings=[
        {key:'group_migration_active',value:'true',updated_at:now},
        {key:'group_migration_group_url',value:current.currentGroupUrl,updated_at:now},
        {key:'group_migration_started_at',value:now,updated_at:now},
        {key:'group_migration_last_push_at',value:'',updated_at:now},
        {key:'group_migration_last_push_recipients',value:'0',updated_at:now},
        {key:'group_migration_last_push_id',value:'',updated_at:now}
      ];
      const {error:settingError}=await supabase.from('app_settings').upsert(settings,{onConflict:'key'});
      if(settingError) throw settingError;
      return res.json(await state(supabase));
    }

    if(action==='stop'){
      const now=new Date().toISOString();
      const {error}=await supabase.from('app_settings').upsert([
        {key:'group_migration_active',value:'false',updated_at:now}
      ],{onConflict:'key'});
      if(error) throw error;
      return res.json(await state(supabase));
    }

    if(action==='push'){
      const current=await state(supabase);
      if(!current.active) return res.status(409).json({error:'Kòmanse migration lan anvan ou voye envitasyon.'});
      const push=await sendPush();
      const now=new Date().toISOString();
      const recipients=Number(push.recipients||0)||0;
      const pushId=String(push.id||'');
      const {error:pushSettingError}=await supabase.from('app_settings').upsert([
        {key:'group_migration_last_push_at',value:now,updated_at:now},
        {key:'group_migration_last_push_recipients',value:String(recipients),updated_at:now},
        {key:'group_migration_last_push_id',value:pushId,updated_at:now}
      ],{onConflict:'key'});
      if(pushSettingError) throw pushSettingError;
      return res.json({...(await state(supabase)),push:{id:pushId||null,recipients}});
    }

    return res.status(400).json({error:'Aksyon migration lan pa valid.'});
  }catch(error){
    console.error('[DOBERTO VCF migration]',error);
    return res.status(500).json({error:error?.message||'Migration lan pa t fini.'});
  }
};
