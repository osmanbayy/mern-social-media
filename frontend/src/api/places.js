import { createJsonApiHandlers } from "./apiClient.js";

const { API_BASE, handleResponse } = createJsonApiHandlers(
  "places",
  "Yerler yüklenemedi."
);

/**
 * @param {number} lat
 * @param {number} lon
 * @param {AbortSignal} [signal]
 */
export const getNearbyPlaces = async (lat, lon, signal) => {
  const response = await fetch(
    `${API_BASE}/nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
    { credentials: "include", signal }
  );
  return handleResponse(response);
};

/**
 * @param {string} q
 * @param {number|undefined} lat
 * @param {number|undefined} lon
 * @param {AbortSignal} [signal]
 */
export const searchPlaces = async (q, lat, lon, signal) => {
  const params = new URLSearchParams({ q: q.trim() });
  if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) {
    params.set("lat", String(lat));
    params.set("lon", String(lon));
  }
  const response = await fetch(`${API_BASE}/search?${params}`, {
    credentials: "include",
    signal,
  });
  return handleResponse(response);
};
