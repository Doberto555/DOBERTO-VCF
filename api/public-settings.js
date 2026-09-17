const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const DEFAULT_GROUP = 'https://chat.whatsapp.com/GySPeuvDlI14BnWWvdm7U4?s=sh&p=a&mlu=4&ilr=4';

function client(){
  if(!SUPABASE_URL || !SERVICE_KEY) return null;
  return createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
}

module.exports = async (req,res) => {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const supabase=client();
  if(!supabase) return res.status(200).json({ok:true,whatsappGroupUrl:DEFAULT_GROUP});
  try{
    const {data,error}=await supabase.from('app_settings').select('value').eq('key','whatsapp_group_url').maybeSingle();
    if(error) throw error;
    const value=String(data?.value||'').trim();
    return res.status(200).json({ok:true,whatsappGroupUrl:value||DEFAULT_GROUP});
  }catch(_){
    return res.status(200).json({ok:true,whatsappGroupUrl:DEFAULT_GROUP});
  }
};
