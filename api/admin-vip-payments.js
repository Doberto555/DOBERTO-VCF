require('../lib/runtime-secrets');
const jwt=require('jsonwebtoken');
const {createClient}=require('@supabase/supabase-js');
const api=require('../lib/vip-api');

const supabase=createClient(
  String(process.env.SUPABASE_URL||'').trim(),
  String(process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim()
);

function verifyAdmin(req,res){
  try{
    const auth=String(req.headers.authorization||'');
    const token=auth.startsWith('Bearer ')?auth.slice(7).trim():'';
    return jwt.verify(token,String(process.env.JWT_SECRET||'').trim(),{
      algorithms:['HS256'],issuer:'doberto-vcf',audience:'doberto-vcf-admin'
    });
  }catch(_){
    res.status(401).json({code:'admin_required',error:'Sesyon admin lan pa valid.'});
    return null;
  }
}

async function getPayments(req,res){
  if(!verifyAdmin(req,res))return;
  try{
    const [{data:manual,error:manualError},{data:moncash,error:moncashError}]=await Promise.all([
      supabase.from('vip_payment_requests')
        .select('id,user_id,method,amount,currency,duration_days,plan_code,transaction_ref,note,status,created_at,reviewed_at,review_note')
        .order('created_at',{ascending:false}).limit(150),
      supabase.from('vip_moncash_orders')
        .select('id,order_id,user_id,amount,currency,duration_days,plan_code,status,transaction_id,created_at,updated_at,paid_at')
        .order('created_at',{ascending:false}).limit(150)
    ]);
    if(manualError)throw manualError;
    if(moncashError)throw moncashError;

    const ids=[...new Set([...(manual||[]),...(moncash||[])].map(r=>r.user_id).filter(Boolean))];
    let users=[];
    if(ids.length){
      const {data,error}=await supabase.from('app_users').select('id,email,display_name').in('id',ids);
      if(error)throw error;
      users=data||[];
    }
    const userMap=new Map(users.map(u=>[u.id,u]));
    const userInfo=userId=>{
      const u=userMap.get(userId)||{};
      return {userId,userName:u.display_name||'',userEmail:u.email||''};
    };

    const rows=[
      ...(manual||[]).map(r=>({
        ...r,...userInfo(r.user_id),source:'manual',reference:r.transaction_ref||'',
        transactionId:null,orderId:null,paidAt:r.status==='approved'?r.reviewed_at:null
      })),
      ...(moncash||[]).map(r=>({
        ...r,...userInfo(r.user_id),source:'moncash',method:'moncash',reference:r.transaction_id||r.order_id||'',
        transactionRef:null,transactionId:r.transaction_id||null,orderId:r.order_id||null,
        note:null,reviewed_at:null,review_note:null,paidAt:r.paid_at||null
      }))
    ].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));

    const counts={
      review:rows.filter(r=>r.source==='manual'&&r.status==='pending').length,
      moncash:rows.filter(r=>r.source==='moncash').length,
      success:rows.filter(r=>(r.source==='manual'&&r.status==='approved')||(r.source==='moncash'&&r.status==='paid')).length,
      failed:rows.filter(r=>(r.source==='manual'&&r.status==='rejected')||(r.source==='moncash'&&['failed','expired'].includes(r.status))).length,
      total:rows.length
    };

    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({ok:true,requests:rows,counts});
  }catch(e){
    console.error('[VIP admin payments history]',e);
    return res.status(500).json({error:'Nou pa ka chaje istwa peman VIP yo.'});
  }
}

module.exports=(req,res)=>req.method==='GET'?getPayments(req,res):api.adminPayments(req,res);
