import express from "express";
import authRoutes from "./routes/auth_routes.js";
import connect_mongodb from "./database/connect_mongodb.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connect_mongodb();
});
