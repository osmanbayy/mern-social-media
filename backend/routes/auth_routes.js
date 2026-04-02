import express from "express";
import {
  get_me,
  login,
  logout,
  signup,
  sendVerifyOtp,
  verifyEmail,
  sendPasswordResetOtp,
  verifyResetOtp,
  resetPassword,
  testEmail,
} from "../controllers/auth_controller.js";
import { protect_route } from "../middlewares/protect_route.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  authLoginLimiter,
  authSignupLimiter,
  authOtpEmailLimiter,
} from "../middlewares/rateLimit.js";
import * as v from "../validators/auth.validators.js";

const router = express.Router();

router.get("/me", protect_route, get_me);
router.post("/signup", authSignupLimiter, v.signupValidators, validateRequest, signup);
router.post("/login", authLoginLimiter, v.loginValidators, validateRequest, login);
router.post("/logout", logout);

router.post(
  "/send-verify-otp",
  protect_route,
  authOtpEmailLimiter,
  v.sendVerifyOtpValidators,
  validateRequest,
  sendVerifyOtp
);
router.post("/verify-account", protect_route, v.verifyEmailValidators, validateRequest, verifyEmail);
router.post(
  "/send-reset-otp",
  authOtpEmailLimiter,
  v.sendPasswordResetOtpValidators,
  validateRequest,
  sendPasswordResetOtp
);
router.post("/verify-reset-otp", v.verifyResetOtpValidators, validateRequest, verifyResetOtp);
router.post("/reset-password", v.resetPasswordValidators, validateRequest, resetPassword);

router.post("/test-email", authOtpEmailLimiter, v.testEmailValidators, validateRequest, testEmail);

export default router;
