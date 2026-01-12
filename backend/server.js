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
if (process.env.VERCEL !== "1") {
  job.start();
}
const app = express();
const PORT = process.env.PORT || 8000;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" })); // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "https://onsekiz-frontend.vercel.app",
  "https://onsekiz-frontend.vercel.app/",
  process.env.FRONTEND_URL
].filter(Boolean); // undefined değerleri filtrele

// CORS middleware - Vercel için optimize edilmiş
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Tüm Vercel frontend URL'lerine izin ver
  if (origin && (origin.includes('onsekiz-frontend') && origin.includes('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // Preflight request için hemen response döndür
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  } else if (allowedOrigins.includes(origin) || !origin) {
    // Allowed origins veya origin yoksa (Postman gibi)
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  } else {
    // Diğer origin'ler için de izin ver (geçici)
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  }
  
  next();
});

// Health check endpoint
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

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);

const ensureMongoConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    await connect_mongodb();
    
    if (mongoose.connection.readyState === 1) {
      return true;
    } else {
      throw new Error("MongoDB connection not ready");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Her request'te MongoDB bağlantısını kontrol et
app.use(async (req, res, next) => {
  try {
    await ensureMongoConnection();
    next();
  } catch (error) {
    console.error("MongoDB connection middleware error:", error);
    return res.status(503).json({ 
      message: "Veritabanı bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});


export default app;

if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  if (process.env.NODE_ENV == "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
