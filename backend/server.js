import path from "path";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth_routes.js";
import userRoutes from "./routes/user_routes.js";
import postRoutes from "./routes/post_routes.js";
import notificationRoutes from "./routes/notification_routes.js";
import uploadRoutes from "./routes/upload_routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connect_mongodb from "./database/connect_mongodb.js";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import job from "./lib/utils/cron.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
job.start();
const app = express();
const PORT = process.env.PORT || 8000;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" })); // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Expires, Cache-Control, Pragma');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  
  // Set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Expires, Cache-Control, Pragma');
  } else if (!origin) {
    // No origin (Postman, curl, etc.)
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    // Allow other origins for development
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Expires, Cache-Control, Pragma');
  }
  
  next();
});

// Health check endpoints (no MongoDB required)
app.get("/", (req, res) => {
  res.json({ 
    message: "OnSekiz API is running", 
    status: "ok",
    timestamp: new Date().toISOString()
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
      upload: "/api/upload"
    }
  });
});

// MongoDB connection middleware - ensures connection before handling API requests
app.use(async (req, res, next) => {
  try {
    await connect_mongodb();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    return res.status(503).json({
      message: "Database connection failed. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);

// Only start server if not in Vercel environment
if (!process.env.VERCEL) {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
