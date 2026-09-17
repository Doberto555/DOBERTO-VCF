module.exports = async function removedVipSync(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    code: 'feature_removed',
    error: 'Google Contacts ak Auto-Sync te retire. VIP kounye a endepandan de Google Contacts.'
  });
};
