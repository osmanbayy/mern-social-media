import { handleApiResponse } from "./handleApiResponse.js";

/**
 * Normalized API root for a route segment, e.g. "post" → "/api/post" or "{origin}/api/post".
 * @param {string} segment - URL segment after /api/ (e.g. auth, post, user, messages, notifications)
 */
export function getApiBaseForSegment(segment) {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return `/api/${segment}`;

  let normalized = base.replace(/\/+$/, "");
  if (!normalized.endsWith("/api")) {
    normalized = `${normalized}/api`;
  }
  return `${normalized}/${segment}`;
}

/**
 * Shared JSON API helpers for fetch + handleApiResponse.
 * @param {string} segment
 * @param {string} nonJsonFallback
 */
export function createJsonApiHandlers(segment, nonJsonFallback) {
  const API_BASE = getApiBaseForSegment(segment);
  const handleResponse = (response) =>
    handleApiResponse(response, { nonJsonFallback });
  return { API_BASE, handleResponse };
}
