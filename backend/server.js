import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import express from "express";
import authRoutes from "./routes/auth_routes.js";
import userRoutes from "./routes/user_routes.js";
import postRoutes from "./routes/post_routes.js";
import notificationRoutes from "./routes/notification_routes.js";
import uploadRoutes from "./routes/upload_routes.js";
import messageRoutes from "./routes/message_routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connect_mongodb from "./database/connect_mongodb.js";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import { initSocketServer } from "./socket/socketServer.js";

import "./models/message_request_model.js";
import "./models/conversation_model.js";
import "./models/message_model.js";

dotenv.config();

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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://onsekiz.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

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
// Vercel serverless bazen isteği /api öneki olmadan iletir; aynı router'ı kök path ile de bağla
app.use("/messages", messageRoutes);

if (!process.env.VERCEL) {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
    });
  }

  const server = http.createServer(app);
  initSocketServer(server);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
