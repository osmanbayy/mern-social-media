/**
 * İzin verilen CORS origin listesi (FRONTEND_URL + isteğe bağlı CORS_ORIGINS).
 */
export function getAllowedOrigins() {
  const set = new Set([
    "http://localhost:3000",
    "http://localhost:5173",
    "https://onsekiz.vercel.app",
  ]);
  const front = process.env.FRONTEND_URL?.trim();
  if (front) set.add(front);
  const extra = process.env.CORS_ORIGINS;
  if (extra) {
    for (const o of extra.split(",")) {
      const t = o.trim();
      if (t) set.add(t);
    }
  }
  return [...set];
}
