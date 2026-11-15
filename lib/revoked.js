const revoked = new Map();

function set(userId, sec) { revoked.set(String(userId), sec); }

function isRevoked(payload) {
  const cut = revoked.get(String(payload && payload.userId));
  return Boolean(cut && Number(payload.iat || 0) < cut);
}

async function load(supabase) {
  if (!supabase) return;
  try {
    const { data } = await supabase.from('app_users')
      .select('id, sessions_valid_after').not('sessions_valid_after', 'is', null);
    (data || []).forEach((u) => set(u.id, Math.floor(new Date(u.sessions_valid_after).getTime() / 1000)));
  } catch (_) {}
}

module.exports = { set, isRevoked, load };
