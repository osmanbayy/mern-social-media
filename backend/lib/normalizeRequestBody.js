/** Vercel / proxy bazen body'yi string veya Buffer verir; share düz kökte de gelebilir */
export function normalizeRequestBody(raw) {
  if (raw == null) return {};
  if (Buffer.isBuffer(raw)) {
    try {
      const o = JSON.parse(raw.toString("utf8"));
      return o && typeof o === "object" && !Array.isArray(o) ? o : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === "string") {
    try {
      const o = JSON.parse(raw);
      return o && typeof o === "object" && !Array.isArray(o) ? o : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  return {};
}
