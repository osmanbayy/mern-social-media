import { LIMITS } from "./securityConstants.js";

export function normalizePollInput(raw) {
  if (raw == null || typeof raw !== "object") return null;
  const opts = raw.options;
  if (!Array.isArray(opts)) return null;
  const cleaned = [];
  for (const o of opts) {
    if (cleaned.length >= LIMITS.POLL_OPTIONS_MAX) break;
    const t = typeof o?.text === "string" ? o.text.trim() : "";
    if (!t) continue;
    cleaned.push({
      text: t.slice(0, LIMITS.POLL_OPTION_TEXT_MAX),
      votes: [],
    });
  }
  if (cleaned.length < LIMITS.POLL_OPTIONS_MIN) return null;
  const q = typeof raw.question === "string" ? raw.question.trim() : "";
  const question = q ? q.slice(0, LIMITS.POLL_QUESTION_MAX) : undefined;
  return question ? { question, options: cleaned } : { options: cleaned };
}

export function normalizeLocationInput(raw) {
  if (raw == null || typeof raw !== "object") return null;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name) return null;
  const lat = Number(raw.lat);
  const lon = Number(raw.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }
  return {
    name: name.slice(0, LIMITS.LOCATION_NAME_MAX),
    lat,
    lon,
  };
}
