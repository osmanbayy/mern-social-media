import mongoose from "mongoose";
import User from "../../models/user_model.js";
import transporter from "../../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE } from "../../config/emailTemplates.js";
import { ok, fail } from "../../lib/httpResult.js";

export async function sendVerifyOtp({ userId }) {
  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return fail(400, "Invalid or missing userId", { success: false });
    }

    const user = await User.findById(userId);
    if (!user) {
      return fail(404, "User not found.", { success: false });
    }

    if (user.isAccountVerified) {
      return ok(200, { success: false, message: "This account already verified." });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    try {
      if (!process.env.SENDER_EMAIL) {
        console.error("SENDER_EMAIL environment variable is not set!");
      }
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: user.email,
        subject: "Hesabınızı Doğrulayın",
        html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
      });
      return ok(200, { success: true, message: "Doğrulama kodu gönderildi." });
    } catch (emailError) {
      return fail(500, "E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.", {
        success: false,
        error: process.env.NODE_ENV === "development" ? emailError.message : undefined,
      });
    }
  } catch (error) {
    console.error("Error in sendVerifyOtp:", error);
    return fail(500, error.message, { success: false });
  }
}

export async function verifyEmail({ userId, otp }) {
  try {
    if (!userId || !otp) {
      return fail(400, "Kullanıcı ID ve OTP gereklidir.", { success: false });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return fail(400, "Geçersiz kullanıcı ID.", { success: false });
    }

    const user = await User.findById(userId);
    if (!user) {
      return fail(404, "Kullanıcı bulunamadı.", { success: false });
    }

    if (user.isAccountVerified) {
      return ok(200, { success: false, message: "Bu hesap zaten doğrulanmış." });
    }

    if (!user.verifyOtp || user.verifyOtp === "" || user.verifyOtp !== otp) {
      return fail(400, "Geçersiz doğrulama kodu.", { success: false });
    }

    if (!user.verifyOtpExpiresAt || user.verifyOtpExpiresAt === 0) {
      return fail(400, "Doğrulama kodu süresi dolmuş. Lütfen yeni bir kod isteyin.", {
        success: false,
      });
    }

    if (user.verifyOtpExpiresAt < Date.now()) {
      return fail(400, "Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod isteyin.", {
        success: false,
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiresAt = 0;
    await user.save();

    return ok(200, { success: true, message: "Mail başarıyla doğrulandı." });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    return fail(500, "Sunucu hatası oluştu.", {
      success: false,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
