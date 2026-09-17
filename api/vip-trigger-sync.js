require('../lib/runtime-secrets');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    code: 'feature_removed',
    error: 'Google Contacts ak Auto-Sync te retire. VIP pa itilize Google Contacts ankò.'
  });
};
