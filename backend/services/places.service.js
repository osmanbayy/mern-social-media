/**
 * Geniş idari konumlar (mahalle / ilçe / şehir) — Nominatim.
 * Dükkan–POI seviyesi listeleme yok; adres hiyerarşisi + isteğe bağlı arama.
 */

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

const NOMINATIM_HEADERS = {
  "User-Agent":
    process.env.NOMINATIM_USER_AGENT ||
    "OnSekizSocialApp/1.0 (https://github.com/; contact: nominatim-usage)",
  "Accept-Language": "tr,en",
};

/** Tekil dükkan / cadde seviyesini ele; mahalle–ilçe–şehir öncelikli sıra */
const ADDRESS_PRIORITY = [
  "neighbourhood",
  "quarter",
  "suburb",
  "city_district",
  "district",
  "town",
  "municipality",
  "city",
  "county",
  "state",
  "region",
];

const SKIP_KEYS = new Set([
  "house_number",
  "road",
  "pedestrian",
  "footway",
  "path",
  "residential",
  "postcode",
  "country",
  "country_code",
  "amenity",
  "shop",
  "building",
  "house",
]);

/**
 * @param {Record<string, unknown>} address
 * @returns {Array<{ key: string, name: string }>}
 */
function extractBroadAreaCandidates(address) {
  if (!address || typeof address !== "object") return [];
  const seen = new Set();
  const out = [];

  for (const key of ADDRESS_PRIORITY) {
    const v = address[key];
    if (typeof v !== "string" || !v.trim()) continue;
    const n = v.trim();
    const lk = n.toLowerCase();
    if (seen.has(lk)) continue;
    seen.add(lk);
    out.push({ key, name: n });
  }

  for (const [key, v] of Object.entries(address)) {
    if (SKIP_KEYS.has(key) || ADDRESS_PRIORITY.includes(key)) continue;
    if (typeof v !== "string" || !v.trim()) continue;
    const n = v.trim();
    const lk = n.toLowerCase();
    if (seen.has(lk)) continue;
    seen.add(lk);
    out.push({ key, name: n });
  }

  return out.slice(0, 10);
}

/**
 * İsmi Türkiye içinde, mümkünse kullanıcı civarında çözümler.
 */
async function nominatimSearchBounded(name, lat, lon) {
  const d = 0.55;
  const vb = `${lon - d},${lat + d},${lon + d},${lat - d}`;
  let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1&countrycodes=tr&addressdetails=0&viewbox=${vb}&bounded=1`;

  let res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) return null;
  let arr = await res.json();
  if (!arr?.[0]) {
    url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${name}, Türkiye`)}&format=json&limit=1&countrycodes=tr&addressdetails=0`;
    res = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!res.ok) return null;
    arr = await res.json();
  }
  if (!arr?.[0]) return null;
  return { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon) };
}

function shortLabelFromNominatimItem(item) {
  const a = item.address || {};
  const parts = [
    a.neighbourhood,
    a.quarter,
    a.suburb,
    a.city_district,
    a.district,
    a.town,
    a.city,
    a.municipality,
    a.state,
  ].filter((x) => typeof x === "string" && x.trim());
  const uniq = [...new Set(parts.map((p) => p.trim()))];
  if (uniq.length) return uniq.slice(0, 3).join(", ");
  const dn = item.display_name || "";
  return dn
    .split(",")
    .slice(0, 3)
    .map((s) => s.trim())
    .join(" · ");
}

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Array<{ id: string, name: string, lat: number, lon: number, distanceM: number }>>}
 */
export async function fetchNearbyPlaces(lat, lon) {
  const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json&addressdetails=1&zoom=11`;
  const res = await fetch(reverseUrl, { headers: NOMINATIM_HEADERS });
  if (!res.ok) {
    throw new Error(`Nominatim reverse ${res.status}`);
  }
  const data = await res.json();
  const addr = data.address;
  if (!addr) {
    const name =
      (data.display_name || "").split(",").slice(0, 2).join(" · ").trim() || "Konum";
    return [
      {
        id: "reverse-fallback",
        name,
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        distanceM: 0,
      },
    ];
  }

  const candidates = extractBroadAreaCandidates(addr);
  if (candidates.length === 0) {
    const name =
      (data.display_name || "").split(",").slice(0, 3).join(" · ").trim() || "Konum";
    return [
      {
        id: "reverse-only",
        name,
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        distanceM: 0,
      },
    ];
  }

  const settled = await Promise.all(
    candidates.slice(0, 8).map(async (c, i) => {
      const geo = await nominatimSearchBounded(c.name, lat, lon);
      const plat = geo?.lat ?? lat;
      const plon = geo?.lon ?? lon;
      const distanceM = Math.round(distanceMeters(lat, lon, plat, plon));
      return {
        id: `${c.key}|${c.name}|${i}`,
        name: c.name,
        lat: plat,
        lon: plon,
        distanceM,
      };
    })
  );

  settled.sort((a, b) => a.distanceM - b.distanceM);
  return settled;
}

/**
 * Serbest metin arama (Nominatim search).
 * @param {string} query
 * @param {number|undefined} lat
 * @param {number|undefined} lon
 */
export async function searchPlacesQuery(query, lat, lon) {
  const q = typeof query === "string" ? query.trim() : "";
  if (q.length < 2) return [];

  let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=14&addressdetails=1&countrycodes=tr`;
  if (
    lat != null &&
    lon != null &&
    !Number.isNaN(Number(lat)) &&
    !Number.isNaN(Number(lon))
  ) {
    const d = 0.65;
    const la = Number(lat);
    const lo = Number(lon);
    url += `&viewbox=${lo - d},${la + d},${lo + d},${la - d}&bounded=0`;
  }

  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) {
    throw new Error(`Nominatim search ${res.status}`);
  }
  const arr = await res.json();
  if (!Array.isArray(arr)) return [];

  const out = [];
  const seen = new Set();
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const label = shortLabelFromNominatimItem(item);
    if (!label) continue;
    const lk = label.toLowerCase();
    if (seen.has(lk)) continue;
    seen.add(lk);
    const plat = parseFloat(item.lat);
    const plon = parseFloat(item.lon);
    if (Number.isNaN(plat) || Number.isNaN(plon)) continue;

    let distanceM = 0;
    if (
      lat != null &&
      lon != null &&
      !Number.isNaN(Number(lat)) &&
      !Number.isNaN(Number(lon))
    ) {
      distanceM = Math.round(distanceMeters(Number(lat), Number(lon), plat, plon));
    }

    out.push({
      id: `search-${item.place_id ?? item.osm_id ?? i}-${plat.toFixed(4)}`,
      name: label,
      lat: plat,
      lon: plon,
      distanceM,
    });
    if (out.length >= 12) break;
  }

  return out;
}
