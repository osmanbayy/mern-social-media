/** Yakındaki isimli yerler — OpenStreetMap Overpass (kamuya açık örnek sunucu) */

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function coordsFromElement(el) {
  if (el.type === "node" && el.lat != null && el.lon != null) {
    return { lat: el.lat, lon: el.lon };
  }
  if (el.type === "way" && el.center?.lat != null && el.center?.lon != null) {
    return { lat: el.center.lat, lon: el.center.lon };
  }
  return null;
}

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Array<{ id: string, name: string, lat: number, lon: number, distanceM: number }>>}
 */
export async function fetchNearbyPlaces(lat, lon) {
  const radius = 550;
  const q = `
[out:json][timeout:15];
(
  node["name"]["amenity"](around:${radius},${lat},${lon});
  node["name"]["shop"](around:${radius},${lat},${lon});
  node["name"]["tourism"](around:${radius},${lat},${lon});
  node["name"]["leisure"](around:${radius},${lat},${lon});
  way["name"]["amenity"](around:${radius},${lat},${lon});
);
out center 35;
`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(q)}`,
  });

  if (!res.ok) {
    throw new Error(`Overpass HTTP ${res.status}`);
  }

  const data = await res.json();
  const elements = Array.isArray(data.elements) ? data.elements : [];
  const seen = new Map();
  const out = [];

  for (const el of elements) {
    const name = el.tags?.name?.trim();
    if (!name) continue;
    const c = coordsFromElement(el);
    if (!c) continue;
    const key = `${name}|${c.lat.toFixed(4)}|${c.lon.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.set(key, true);
    const distanceM = distanceMeters(lat, lon, c.lat, c.lon);
    out.push({
      id: key,
      name,
      lat: c.lat,
      lon: c.lon,
      distanceM: Math.round(distanceM),
    });
  }

  out.sort((a, b) => a.distanceM - b.distanceM);
  return out.slice(0, 20);
}
