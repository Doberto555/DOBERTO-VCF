module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  return res.status(410).json({
    code: 'feature_removed',
    error: 'Fonksyon sa a pa disponib ankò sou DOBERTO VCF.'
  });
};
