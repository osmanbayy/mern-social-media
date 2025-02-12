import express from "express";
import authRoutes from "./routes/auth_routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connect_mongodb from "./database/connect_mongodb.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());  // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connect_mongodb();
});
