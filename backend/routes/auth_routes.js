import express from "express";
import { get_me, login, logout, signup, sendVerifyOtp, verifyEmail, sendPasswordResetOtp, resetPassword } from "../controllers/auth_controller.js";
import { protect_route } from "../middlewares/protect_route.js";

const router = express.Router();

router.get("/me", protect_route, get_me);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/send-verify-otp", protect_route, sendVerifyOtp);
router.post("/verify-account", protect_route, verifyEmail);
router.post("/send-reset-otp", sendPasswordResetOtp);
router.post("/reset-password", resetPassword);

export default router;
