import express from "express";
import authRoutes from "./routes/auth_routes.js";
import userRoutes from "./routes/user_routes.js";
import postRoutes from "./routes/post_routes.js"
import notificationRoutes from "./routes/notification_routes.js"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connect_mongodb from "./database/connect_mongodb.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json({limit: "10mb"})); // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes)
app.use("/api/notifications", notificationRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connect_mongodb();
});
