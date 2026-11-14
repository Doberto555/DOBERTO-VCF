const VIP_PREFIX = String(process.env.VIP_PREFIX || 'V.I.P \u{1F451}').trim();

function isVip(row, now = Date.now()) {
  const t = row && row.vip_until ? Date.parse(row.vip_until) : 0;
  return Number.isFinite(t) && t > now;
}

function prefixFor(row, basePrefix = '') {
  return isVip(row) ? VIP_PREFIX : basePrefix;
}

// Anti-fwod: yon moun pa ka mete "V.I.P" oswa kouwon nan non li pou fè pase l pou VIP.
function stripVipMarks(name) {
  return String(name || '')
    .replace(/\u{1F451}\uFE0F?/gu, '')
    .replace(/^\s*v\s*\.?\s*i\s*\.?\s*p\b\.?[\s:|\-\u00b7]*/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function safeRow(row) {
  return { ...row, name: stripVipMarks(row && row.name) };
}

module.exports = { VIP_PREFIX, isVip, prefixFor, stripVipMarks, safeRow };
