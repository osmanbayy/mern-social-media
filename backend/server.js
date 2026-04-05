import "dotenv/config";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import authRoutes from "./routes/auth_routes.js";
import userRoutes from "./routes/user_routes.js";
import postRoutes from "./routes/post_routes.js";
import notificationRoutes from "./routes/notification_routes.js";
import uploadRoutes from "./routes/upload_routes.js";
import messageRoutes from "./routes/message_routes.js";
import placesRoutes from "./routes/places_routes.js";
import cookieParser from "cookie-parser";
import connect_mongodb from "./database/connect_mongodb.js";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import { globalApiLimiter, maybeUpgradeGlobalLimiterFromRedis } from "./middlewares/rateLimit.js";
import { getAllowedOrigins } from "./lib/corsConfig.js";
import { payloadErrorHandler } from "./middlewares/payloadErrorHandler.js";

import "./models/message_request_model.js";
import "./models/conversation_model.js";
import "./models/message_model.js";

await maybeUpgradeGlobalLimiterFromRedis();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 8000;

// cwd değil, bu dosyanın bulunduğu klasör (../frontend/dist yolu doğru çözülsün)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** X-Forwarded-For (Vercel/proxy) — rate limit ve güvenlik için */
app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      if (buf?.length) req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

/** Bazı proxy’ler (ör. Vite dev) gövdeyi express.json’a ulaştırmaz; ham buffer’dan tekrar dene */
app.use((req, res, next) => {
  const b = req.body;
  const emptyObject = b && typeof b === "object" && !Array.isArray(b) && Object.keys(b).length === 0;
  const missing = b === undefined || b === null;
  if (
    req.method !== "GET" &&
    req.method !== "HEAD" &&
    (missing || emptyObject) &&
    req.rawBody &&
    Buffer.byteLength(req.rawBody) > 0
  ) {
    const ct = (req.headers["content-type"] || "").toLowerCase();
    if (ct.includes("application/json")) {
      try {
        const parsed = JSON.parse(req.rawBody.toString("utf8"));
        if (parsed && typeof parsed === "object") {
          req.body = parsed;
        }
      } catch {
        /* bırak */
      }
    }
  }
  next();
});

app.use(mongoSanitize());

app.use(cookieParser());

const allowedOrigins = getAllowedOrigins();
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  })
);

app.use("/api", globalApiLimiter);

app.get("/", (req, res) => {
  res.json({
    message: "OnSekiz API is running",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "OnSekiz API",
    status: "ok",
    endpoints: {
      auth: "/api/auth",
      user: "/api/user",
      post: "/api/post",
      notifications: "/api/notifications",
      upload: "/api/upload",
      messages: "/api/messages",
      places: "/api/places",
    },
  });
});

app.use(async (req, res, next) => {
  try {
    await connect_mongodb();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    return res.status(503).json({
      message: "Database connection failed. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/places", placesRoutes);
// Vercel serverless bazen isteği /api öneki olmadan iletir; aynı router'ı kök path ile de bağla
app.use("/messages", messageRoutes);

app.use(payloadErrorHandler);

/** Vercel serverless bu dosyayı import eder; socket.io statik import deploy/bundle sorunlarına yol açabiliyor — sadece yerelde dinamik import */
if (!process.env.VERCEL) {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
    });
  }

  (async () => {
    const { initSocketServer } = await import("./socket/socketServer.js");
    const server = http.createServer(app);
    initSocketServer(server);
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })().catch((err) => {
    console.error("Server bootstrap failed:", err);
    process.exit(1);
  });
}

export default app;
