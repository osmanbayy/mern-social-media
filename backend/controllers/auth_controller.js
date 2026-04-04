import { generateTokenAndSetCookie } from "../lib/utils/generate_token.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { sendServiceResult } from "../lib/controllerHttp.js";
import * as authSession from "../services/auth/auth.session.service.js";
import * as authMe from "../services/auth/auth.me.service.js";
import * as authVerify from "../services/auth/auth.verify.service.js";
import * as authPassword from "../services/auth/auth.password.service.js";
import * as authEmailTest from "../services/auth/auth.email.test.service.js";

const isDev = process.env.NODE_ENV === "development";

export const signup = asyncHandler(
  "auth.signup",
  async (req, res) => {
    const result = await authSession.signup(req.body);
    if (result.ok && result.cookieUserId) {
      generateTokenAndSetCookie(result.cookieUserId, res);
    }
    return sendServiceResult(res, result);
  },
  {
    onError: (_error, res) => {
      res.status(500).json({ error: "Sunucu hatası!" });
    },
  }
);

export const login = asyncHandler(
  "auth.login",
  async (req, res) => {
    const result = await authSession.login(req.body);
    if (result.ok && result.cookieUserId) {
      generateTokenAndSetCookie(result.cookieUserId, res);
    }
    return sendServiceResult(res, result);
  },
  {
    onError: (error, res) => {
      res.status(500).json({
        message: "Sunucu hatası!",
        error: isDev ? error.message : undefined,
      });
    },
  }
);

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

export const get_me = asyncHandler(
  "auth.get_me",
  async (req, res) => {
    const result = await authMe.getMe(req.user._id);
    return sendServiceResult(res, result);
  },
  {
    onError: (_error, res) => {
      res.status(500).json({ error: "Sunucu hatası!" });
    },
  }
);

export const sendVerifyOtp = asyncHandler(
  "auth.sendVerifyOtp",
  async (req, res) => {
    const result = await authVerify.sendVerifyOtp(req.body);
    return sendServiceResult(res, result);
  },
  {
    onError: (error, res) => {
      res.status(500).json({ success: false, message: error.message });
    },
  }
);

export const verifyEmail = asyncHandler(
  "auth.verifyEmail",
  async (req, res) => {
    const result = await authVerify.verifyEmail(req.body);
    return sendServiceResult(res, result);
  },
  {
    onError: (error, res) => {
      res.status(500).json({
        success: false,
        message: "Sunucu hatası oluştu.",
        error: isDev ? error.message : undefined,
      });
    },
  }
);

export const sendPasswordResetOtp = asyncHandler(
  "auth.sendPasswordResetOtp",
  async (req, res) => {
    const result = await authPassword.sendPasswordResetOtp(req.body);
    return sendServiceResult(res, result);
  },
  {
    onError: (error, res) => {
      res.status(500).json({ success: false, message: error.message });
    },
  }
);

export const verifyResetOtp = asyncHandler(
  "auth.verifyResetOtp",
  async (req, res) => {
    const result = await authPassword.verifyResetOtp(req.body);
    return sendServiceResult(res, result);
  },
  {
    onError: (error, res) => {
      res.status(500).json({ success: false, message: error.message });
    },
  }
);

export const resetPassword = asyncHandler(
  "auth.resetPassword",
  async (req, res) => {
    const result = await authPassword.resetPassword(req.body);
    return sendServiceResult(res, result);
  },
  {
    onError: (error, res) => {
      res.status(500).json({ success: false, message: error.message });
    },
  }
);

export const testEmail = asyncHandler(
  "auth.testEmail",
  async (req, res) => {
    const result = await authEmailTest.sendTestEmail(req.body);
    return sendServiceResult(res, result);
  },
  {
    onError: (error, res) => {
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
        error: error.message,
      });
    },
  }
);
