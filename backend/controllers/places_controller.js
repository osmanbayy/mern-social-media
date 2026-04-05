import { asyncHandler } from "../lib/asyncHandler.js";
import { sendServiceResult } from "../lib/controllerHttp.js";
import { ok, fail } from "../lib/httpResult.js";
import { fetchNearbyPlaces, searchPlacesQuery } from "../services/places.service.js";

export const get_nearby_places = asyncHandler("places.get_nearby_places", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return sendServiceResult(res, fail(400, "Geçersiz konum."));
  }
  try {
    const places = await fetchNearbyPlaces(lat, lon);
    return sendServiceResult(res, ok(200, { places }));
  } catch (e) {
    console.error("places.nearby:", e.message);
    return sendServiceResult(res, fail(503, "Yakındaki yerler şu an alınamadı. Bir süre sonra tekrar deneyin."));
  }
});

export const search_places = asyncHandler("places.search_places", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const latRaw = req.query.lat;
  const lonRaw = req.query.lon;
  const lat = latRaw !== undefined && latRaw !== "" ? Number(latRaw) : undefined;
  const lon = lonRaw !== undefined && lonRaw !== "" ? Number(lonRaw) : undefined;
  if (q.length < 2) {
    return sendServiceResult(res, ok(200, { places: [] }));
  }
  try {
    const places = await searchPlacesQuery(q, lat, lon);
    return sendServiceResult(res, ok(200, { places }));
  } catch (e) {
    console.error("places.search:", e.message);
    return sendServiceResult(res, fail(503, "Arama şu an yapılamadı. Bir süre sonra tekrar deneyin."));
  }
});
