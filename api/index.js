// Pwen antre Vercel la: ajoute kèk routes PRO devan Express app prensipal la.
const express = require('express');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const baseApp = require('../server.js');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'chanje-sekre-sa-a';
const MIN_TO_UNLOCK = parseInt(process.env.MIN_TO_UNLOCK || '500', 10);
const NAME_PREFIX = (process.env.NAME_PREFIX || 'D.M.L').trim();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function withPrefix(name) {
  return NAME_PREFIX ? `${NAME_PREFIX} ${name}` : name;
}

function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const headerToken = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const token = headerToken || req.query.token || null;
  if (!token) return res.status(401).json({ error: 'Ou dwe konekte kòm admin.' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sesyon admin ekspire, konekte ankò.' });
  }
}

// Lis piblik PRO: rechèch + filtre peyi sou tout baz done a.
app.get('/api/public-list', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = String(req.query.search || '').trim().slice(0, 80);
  const country = String(req.query.country || '').trim().slice(0, 120);

  let q = supabase
    .from('registrations')
    .select('name, country_name, icon, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) q = q.ilike('name', `%${search}%`);
  if (country) q = q.eq('country_name', country);

  const { data, error, count } = await q.range(from, to);
  if (error) return res.status(500).json({ error: 'Erè sèvè.' });

  const list = (data || []).map((r) => ({ ...r, display_name: withPrefix(r.name) }));
  res.json({
    page,
    pageSize,
    total: count || 0,
    list,
    namePrefix: NAME_PREFIX,
    filters: { search, country }
  });
});

// KPI Admin PRO.
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    const [allResult, todayResult] = await Promise.all([
      supabase.from('registrations').select('*', { count: 'exact', head: true }),
      supabase.from('registrations').select('*', { count: 'exact', head: true }).gte('created_at', start.toISOString())
    ]);

    if (allResult.error || todayResult.error) {
      return res.status(500).json({ error: 'Erè sèvè.' });
    }

    const total = allResult.count || 0;
    const today = todayResult.count || 0;
    res.json({
      total,
      today,
      remaining: Math.max(0, MIN_TO_UNLOCK - total),
      unlocked: total >= MIN_TO_UNLOCK,
      minRequired: MIN_TO_UNLOCK,
      progress: MIN_TO_UNLOCK > 0 ? Math.min(100, Math.round((total / MIN_TO_UNLOCK) * 100)) : 100
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erè sèvè.' });
  }
});

// Tout lòt routes yo kontinye pase nan app orijinal la.
app.use(baseApp);

module.exports = app;
