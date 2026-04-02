import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

/** Kök dizindeki .env içinden PORT=... oku (backend ile aynı porta proxy) */
function readBackendPortFromRootEnv() {
  try {
    const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
    const raw = fs.readFileSync(envPath, "utf8");
    const m = raw.match(/^\s*PORT\s*=\s*(\d+)/m);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** /api ile biten hedef çift /api/api/messages üretir; proxy kırılır */
function normalizeProxyTarget(url) {
  if (!url) return null;
  let u = String(url).replace(/\/+$/, "");
  if (u.endsWith("/api")) u = u.slice(0, -4);
  return u;
}

// https://vite.dev/config/
export default defineConfig(() => {
  const portFromRoot = readBackendPortFromRootEnv();
  const rawTarget =
    process.env.VITE_API_BASE_URL ||
    `http://localhost:${portFromRoot || process.env.PORT || "8000"}`;
  const proxyTarget = normalizeProxyTarget(rawTarget) || rawTarget;

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon-dark.png"],
        manifest: {
          name: "OnSekiz",
          short_name: "OnSekiz",
          description: "Sosyal medya uygulaması",
          theme_color: "#FFFFFF",
          background_color: "#FFFFFF",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: "module",
        },
      }),
    ],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        "/socket.io": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
