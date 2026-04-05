import { asyncHandler } from "../lib/asyncHandler.js";
import { sendServiceResult } from "../lib/controllerHttp.js";
import { ok, fail } from "../lib/httpResult.js";
import { fetchNearbyPlaces } from "../services/places.service.js";

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
