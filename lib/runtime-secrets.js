const jwtSecret = String(process.env.JWT_SECRET || '').trim();
const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim();

const status = Object.freeze({
  jwtReady: jwtSecret.length >= 32 && !jwtSecret.includes('REPLACE_WITH'),
  adminReady: adminPassword.length >= 8 && !adminPassword.includes('REPLACE_WITH')
});

// Important: do not derive authentication secrets from SUPABASE_SERVICE_ROLE_KEY.
// Missing production secrets must fail closed instead of creating predictable
// credentials tied to another high-privilege secret.
module.exports = {
  ready: status.jwtReady,
  adminReady: status.adminReady,
  ...status
};
