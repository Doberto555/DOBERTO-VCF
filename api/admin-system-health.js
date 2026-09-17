require('../lib/runtime-secrets');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim();

function bearer(req){const value=String(req.headers.authorization||'');return value.startsWith('Bearer ')?value.slice(7).trim():'';}
function verifyAdmin(req){try{return jwt.verify(bearer(req),JWT_SECRET,{algorithms:['HS256'],issuer:'doberto-vcf',audience:'doberto-vcf-admin'});}catch(_){return null;}}
function validGroupUrl(value){try{const u=new URL(String(value||'').trim());return u.protocol==='https:'&&u.hostname==='chat.whatsapp.com'&&u.pathname.length>5;}catch(_){return false;}}
function validBotUrl(value){try{const u=new URL(String(value||'').trim());return u.protocol==='https:'&&u.hostname==='doberto-minibot-v1.vercel.app';}catch(_){return false;}}

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  if(!verifyAdmin(req))return res.status(401).json({error:'Sesyon admin lan pa valid.'});

  const checkedAt=new Date().toISOString();
  const services={
    database:{status:'checking'},
    google:{status:process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.GOOGLE_REDIRECT_URI?'configured':'missing'},
    push:{status:process.env.ONESIGNAL_APP_ID&&process.env.ONESIGNAL_REST_API_KEY?'configured':'missing'},
    email:{status:process.env.RESEND_API_KEY&&process.env.RESEND_FROM?'configured':'missing'},
    community:{status:'checking',groupConfigured:false,botConfigured:false}
  };

  if(!SUPABASE_URL||!SERVICE_KEY){
    services.database={status:'missing'};
    services.community={status:'missing',groupConfigured:false,botConfigured:false};
  }else{
    try{
      const supabase=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
      const [dbResult,settingsResult]=await Promise.all([
        supabase.from('registrations').select('id',{count:'exact',head:true}),
        supabase.from('app_settings').select('key,value').in('key',['whatsapp_group_url','vcf_bot_api_url','vcf_bot_api_token'])
      ]);
      services.database={status:dbResult.error?'error':'operational'};
      if(dbResult.error)services.database.code=String(dbResult.error.code||'database_error');
      if(settingsResult.error){
        services.community={status:'error',groupConfigured:false,botConfigured:false};
      }else{
        const map=Object.fromEntries((settingsResult.data||[]).map(row=>[row.key,String(row.value||'').trim()]));
        const groupConfigured=validGroupUrl(map.whatsapp_group_url);
        const botConfigured=validBotUrl(map.vcf_bot_api_url)&&String(map.vcf_bot_api_token||'').length>=16;
        services.community={status:groupConfigured?(botConfigured?'operational':'configured'):'missing',groupConfigured,botConfigured};
      }
    }catch(_){
      services.database={status:'error'};
      services.community={status:'error',groupConfigured:false,botConfigured:false};
    }
  }

  const criticalReady=services.database.status==='operational'&&services.google.status==='configured';
  return res.status(200).json({ok:true,status:criticalReady?'operational':'degraded',checkedAt,siteUrl:String(process.env.SITE_URL||'https://dobertovcf.online'),services});
};
