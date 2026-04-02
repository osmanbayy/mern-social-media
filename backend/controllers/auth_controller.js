import { generateTokenAndSetCookie } from "../lib/utils/generate_token.js";
import { sendServiceResult } from "../lib/controllerHttp.js";
import * as authSession from "../services/auth/auth.session.service.js";
import * as authMe from "../services/auth/auth.me.service.js";
import * as authVerify from "../services/auth/auth.verify.service.js";
import * as authPassword from "../services/auth/auth.password.service.js";
import * as authEmailTest from "../services/auth/auth.email.test.service.js";

export const signup = async (req, res) => {
  try {
    const result = await authSession.signup(req.body);
    if (result.ok && result.cookieUserId) {
      generateTokenAndSetCookie(result.cookieUserId, res);
    }
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Sunucu hatası!" });
  }
};

export const login = async (req, res) => {
  try {
    const result = await authSession.login(req.body);
    if (result.ok && result.cookieUserId) {
      generateTokenAndSetCookie(result.cookieUserId, res);
    }
    return sendServiceResult(res, result);
  } catch (error) {
    console.error("Error in login controller:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Sunucu hatası!",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", null, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    expires: new Date(0),
    path: "/",
  });

  return res.status(200).json({ message: "Çıkış yapıldı." });
};

export const get_me = async (req, res) => {
  try {
    const result = await authMe.getMe(req.user._id);
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in getme controller", error.message);
    res.status(500).json({ error: "Sunucu hatası!" });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const result = await authVerify.sendVerifyOtp(req.body);
    return sendServiceResult(res, result);
  } catch (error) {
    console.error("Error in sendVerifyOtp:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const result = await authVerify.verifyEmail(req.body);
    return sendServiceResult(res, result);
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası oluştu.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const sendPasswordResetOtp = async (req, res) => {
  try {
    const result = await authPassword.sendPasswordResetOtp(req.body);
    return sendServiceResult(res, result);
  } catch (error) {
    console.error("Error in sendPasswordResetOtp:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const result = await authPassword.verifyResetOtp(req.body);
    return sendServiceResult(res, result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await authPassword.resetPassword(req.body);
    return sendServiceResult(res, result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const testEmail = async (req, res) => {
  try {
    const result = await authEmailTest.sendTestEmail(req.body);
    return sendServiceResult(res, result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
};
