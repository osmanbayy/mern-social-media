import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
import { uploadLimiter } from "../middlewares/rateLimit.js";
import { upload_image, upload_chat_file } from "../controllers/upload_controller.js";

const router = express.Router();

router.post("/image", protect_route, uploadLimiter, upload_image);
router.post("/chat", protect_route, uploadLimiter, upload_chat_file);

export default router;
