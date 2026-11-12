'use strict';

// Kliyan sèvè-sèlman pou Shizzy Connect Partner API (https://shizzy-connect.online/docs).
// Kle API a (X-API-Key) PA DWE JANM ale nan navigatè a. Li rete nan .env sèlman.

const DEFAULT_BASE_URL = 'https://shizzy-connect.online/api/v1/partner';
const CONTACT_NAME_MAX = 80;
const EXTERNAL_ID_MAX = 128;

class ShizzyError extends Error {
  constructor(message, { status = 502, code = 'shizzy_error', body = null } = {}) {
    super(message);
    this.name = 'ShizzyError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

function cleanBaseUrl(value) {
  const raw = String(value || '').trim().replace(/\/+$/, '');
  try {
    const url = new URL(raw || DEFAULT_BASE_URL);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') return DEFAULT_BASE_URL;
    return url.toString().replace(/\/+$/, '');
  } catch (_) {
    return DEFAULT_BASE_URL;
  }
}

function seg(value) {
  return encodeURIComponent(String(value));
}

// Transfòme yon liy `registrations` an kontak Shizzy. Retounen null si done yo pa valid.
function toPartnerContact(row, namePrefix = '') {
  const dial = String(row && row.dial_code || '').replace(/\D/g, '');
  const phone = String(row && row.phone || '').replace(/\D/g, '');
  const externalId = String(row && row.id || '').slice(0, EXTERNAL_ID_MAX);
  if (!externalId || !dial || dial.length > 5 || phone.length < 5 || phone.length > 15) return null;
  const baseName = String(row.name || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  const full = (namePrefix ? `${namePrefix} ${baseName}` : baseName).trim().slice(0, CONTACT_NAME_MAX);
  if (!full) return null;
  return { externalId, name: full, countryCode: `+${dial}`, phoneNumber: phone };
}

// Jwenn lyen konsantman Google an nan repons POST /connections, kèlkeswa non chan an
// oswa nivo kote li ye (ex: {url}, {data:{consentUrl}}, {connect:{link}}). Absoli (https) oswa relatif (/...).
function pickConsentUrl(data, baseUrl = DEFAULT_BASE_URL) {
  const origin = (() => { try { return new URL(baseUrl).origin; } catch (_) { return 'https://shizzy-connect.online'; } })();
  const found = [];
  const walk = (node, key, depth) => {
    if (depth > 4 || node == null) return;
    if (typeof node === 'string') {
      let value = node.trim();
      if (value.startsWith('/') && !value.startsWith('//')) value = origin + value;
      if (/^https:\/\//i.test(value) && value.length < 4096) found.push({ key: String(key || ''), value });
      return;
    }
    if (Array.isArray(node)) { node.forEach((item) => walk(item, key, depth + 1)); return; }
    if (typeof node === 'object') Object.keys(node).forEach((k) => walk(node[k], k, depth + 1));
  };
  walk(data, '', 0);
  if (!found.length) return '';
  const score = (item) => {
    let s = 0;
    if (/consent|auth|connect|oauth|google/i.test(item.key)) s += 3;
    if (/url|link|href|redirect/i.test(item.key)) s += 2;
    if (/accounts\.google\.com/i.test(item.value)) s += 4;
    if (/callback|webhook|docs|health/i.test(item.key) || /\/api\/v1\/partner\/connections\//i.test(item.value)) s -= 5;
    return s;
  };
  found.sort((a, b) => score(b) - score(a));
  return found[0].value;
}

// Fòm yon repons san valè (sèlman chemen chan yo + tip) — san danje pou log sèvè a.
function describeShape(data, prefix = '', depth = 0) {
  if (data == null || depth > 3) return [];
  if (typeof data !== 'object') return [`${prefix}:${typeof data}`];
  if (Array.isArray(data)) return data.length ? describeShape(data[0], `${prefix}[]`, depth + 1) : [`${prefix}[]`];
  return Object.keys(data).flatMap((k) => {
    const v = data[k];
    return v && typeof v === 'object' ? describeShape(v, prefix ? `${prefix}.${k}` : k, depth + 1) : [`${prefix ? `${prefix}.` : ''}${k}:${typeof v}`];
  });
}

function createShizzyConnect(options = {}) {
  const apiKey = String(options.apiKey ?? process.env.SHIZZY_PARTNER_KEY ?? '').trim();
  const baseUrl = cleanBaseUrl(options.baseUrl ?? process.env.SHIZZY_BASE_URL);
  const timeoutMs = Math.max(2000, Number(options.timeoutMs ?? process.env.SHIZZY_TIMEOUT_MS ?? 20000) || 20000);
  const configured = Boolean(apiKey && !apiKey.includes('REPLACE_WITH'));

  async function request(method, path, body) {
    if (!configured) {
      throw new ShizzyError('Shizzy Connect poko configure sou sèvè a.', { status: 503, code: 'shizzy_not_configured' });
    }
    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'X-API-Key': apiKey,
          Accept: 'application/json',
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(timeoutMs)
      });
    } catch (err) {
      const timedOut = err && (err.name === 'TimeoutError' || err.name === 'AbortError');
      throw new ShizzyError(timedOut ? 'Shizzy Connect pa reponn a tan.' : 'Nou pa rive jwenn Shizzy Connect.', {
        status: 504,
        code: timedOut ? 'shizzy_timeout' : 'shizzy_unreachable'
      });
    }

    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = null; }

    if (!response.ok) {
      const upstream = data && (data.error || data.message || data.code);
      // 401/403 = pwoblèm kle API nou: pa montre sa bay itilizatè a, sèlman nan log sèvè a.
      if (response.status === 401 || response.status === 403) {
        console.error('[DOBERTO VCF] Shizzy API key rejected:', response.status, upstream || '');
        throw new ShizzyError('Koneksyon ak Shizzy Connect pa otorize.', { status: 502, code: 'shizzy_auth_failed', body: data });
      }
      throw new ShizzyError(typeof upstream === 'string' ? upstream : `Shizzy Connect erè ${response.status}`, {
        status: response.status >= 400 && response.status < 500 ? response.status : 502,
        code: response.status === 409 ? 'shizzy_reauth_required' : 'shizzy_error',
        body: data
      });
    }
    return data;
  }

  return {
    configured,
    baseUrl,
    health: () => request('GET', '/health'),
    createConnection: (externalUserId, extra = {}) =>
      request('POST', '/connections', { ...extra, externalUserId: String(externalUserId) }),
    getConnection: (externalUserId) => request('GET', `/connections/${seg(externalUserId)}`),
    putContacts: (externalUserId, contacts, mode = 'replace') =>
      request('PUT', `/connections/${seg(externalUserId)}/contacts`, { mode, contacts }),
    resync: (externalUserId) => request('POST', `/connections/${seg(externalUserId)}/sync`, {}),
    deleteContact: (externalUserId, externalContactId) =>
      request('DELETE', `/connections/${seg(externalUserId)}/contacts/${seg(externalContactId)}`),
    deleteConnection: (externalUserId) => request('DELETE', `/connections/${seg(externalUserId)}`),
    getJob: (jobId) => request('GET', `/jobs/${seg(jobId)}`)
  };
}

function toPartnerContacts(row, namePrefix = '') {
  const list = [toPartnerContact(row, namePrefix)];
  if (row && row.phone2 && row.dial_code2) {
    list.push(toPartnerContact({ id: String(row.id) + '-2', name: row.name, dial_code: row.dial_code2, phone: row.phone2 }, namePrefix));
  }
  return list.filter(Boolean);
}

module.exports = { createShizzyConnect, toPartnerContact, toPartnerContacts, ShizzyError, pickConsentUrl, describeShape };
