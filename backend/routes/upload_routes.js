import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
import { upload_image } from "../controllers/upload_controller.js";

const router = express.Router();

router.post("/image", protect_route, upload_image);

export default router; 