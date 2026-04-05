/**
 * Gönderi metninden etiket çıkarımı (DB’de küçük harf, tekil liste).
 * # ile başlar; gövde Unicode harf/rakam/alt çizgi.
 */

const HASHTAG_RE = /#([\p{L}\p{N}_]+)/gu;

const MAX_TAG_LEN = 80;

/**
 * @param {string} text
 * @returns {string[]}
 */
export function extractHashtagsFromText(text) {
  if (typeof text !== "string" || !text.trim()) return [];
  const seen = new Set();
  const out = [];
  for (const m of text.matchAll(HASHTAG_RE)) {
    const raw = m[1];
    if (!raw || raw.length > MAX_TAG_LEN) continue;
    const tag = raw.toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      out.push(tag);
    }
  }
  return out;
}

/**
 * URL parametresinden okunan etiketi sorgu için normalize eder.
 * @param {string} raw
 * @returns {string|null}
 */
export function normalizeHashtagParam(raw) {
  if (raw == null) return null;
  let s = String(raw).trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    return null;
  }
  if (s.startsWith("#")) s = s.slice(1);
  s = s.trim().toLowerCase();
  if (s.length < 1 || s.length > MAX_TAG_LEN) return null;
  if (!/^[\p{L}\p{N}_]+$/u.test(s)) return null;
  return s;
}
