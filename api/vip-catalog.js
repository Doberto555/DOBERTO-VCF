require('../lib/runtime-secrets');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const supabase = createClient(SUPABASE_URL || 'https://example.supabase.co', SERVICE_KEY || 'missing');
const moncashConfigured = () => Boolean(
  String(process.env.MONCASH_CLIENT_ID || '').trim() &&
  String(process.env.MONCASH_CLIENT_SECRET || '').trim()
);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(503).json({ error: 'VIP catalog is temporarily unavailable.' });
  }

  try {
    const [{ data: plans, error: planError }, { data: prices, error: priceError }, { data: methods, error: methodError }] = await Promise.all([
      supabase.from('vip_plans').select('code,display_name,amount_htg,duration_months,is_lifetime,badge,description,sort_order').eq('enabled', true).order('sort_order'),
      supabase.from('vip_payment_plan_prices').select('method,plan_code,amount,currency').eq('enabled', true),
      supabase.from('vip_payment_methods').select('method,display_name,enabled,recipient_value,sort_order').order('sort_order')
    ]);
    if (planError) throw planError;
    if (priceError) throw priceError;
    if (methodError) throw methodError;

    return res.status(200).json({
      ok: true,
      public: true,
      plans: (plans || []).map((p) => ({
        code: p.code,
        displayName: p.display_name,
        amountHTG: Number(p.amount_htg || 0),
        durationMonths: p.duration_months == null ? null : Number(p.duration_months),
        isLifetime: Boolean(p.is_lifetime),
        badge: p.badge || '',
        description: p.description || ''
      })),
      prices: (prices || []).map((p) => ({
        method: p.method,
        planCode: p.plan_code,
        amount: Number(p.amount || 0),
        currency: p.currency || 'HTG'
      })),
      methods: (methods || []).map((m) => ({
        method: m.method,
        displayName: m.display_name || m.method,
        enabled: Boolean(m.enabled),
        configured: Boolean(m.enabled && (m.method === 'moncash' ? moncashConfigured() : String(m.recipient_value || '').trim()))
      }))
    });
  } catch (error) {
    console.error('[VIP catalog]', error);
    return res.status(500).json({ error: 'VIP catalog could not be loaded.' });
  }
};
