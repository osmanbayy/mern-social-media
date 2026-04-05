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
