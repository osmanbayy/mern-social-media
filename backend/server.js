import path from "path";
import express from "express";
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

// Cron job'ı sadece Vercel dışında çalıştır (Vercel'de serverless functions kullanılıyor)
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
  process.env.FRONTEND_URL
].filter(Boolean); // undefined değerleri filtrele

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);

// MongoDB bağlantısını başlat
connect_mongodb();

// Vercel serverless function için app'i export et
export default app;

// Eğer standalone server olarak çalışıyorsa (development)
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
