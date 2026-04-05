/**
 * Gönderi metnini @bahsetme ve #etiket parçalarına ayırır (görüntüleme).
 * Backend lib/hashtags.js ile uyumlu etiket gövdesi: Unicode harf/rakam/_.
 */

/**
 * @param {string} text
 * @returns {Array<{ type: 'text', content: string } | { type: 'mention', username: string, fullMatch: string } | { type: 'hashtag', tag: string, fullMatch: string }> | null}
 */
export function parsePostTextSegments(text) {
  if (!text) return null;

  const re = /(@\w+)|(#([\p{L}\p{N}_]+))/gu;
  const parts = [];
  let last = 0;
  let m;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ type: "text", content: text.slice(last, m.index) });
    }
    if (m[1]) {
      parts.push({
        type: "mention",
        username: m[1].slice(1),
        fullMatch: m[1],
      });
    } else if (m[2] && m[3]) {
      parts.push({
        type: "hashtag",
        tag: m[3].toLowerCase(),
        fullMatch: m[2],
      });
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) {
    parts.push({ type: "text", content: text.slice(last) });
  }

  if (parts.length === 0) return null;
  if (parts.length === 1 && parts[0].type === "text") return null;
  return parts;
}
