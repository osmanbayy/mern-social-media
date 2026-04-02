import bcrypt from "bcryptjs";
import User from "../../models/user_model.js";
import transporter from "../../config/nodemailer.js";
import { PASSWORD_RESET_TEMPLATE } from "../../config/emailTemplates.js";
import { ok, fail } from "../../lib/httpResult.js";

export async function sendPasswordResetOtp({ email }) {
  if (!email) {
    return ok(200, { success: false, message: "Mail girilmelidir." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return ok(200, {
        success: false,
        message: "Bu mail hesabıyla kayıtlu kullanıcı yok.",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: user.email,
        subject: "Şifrenizi Sıfırlayın!",
        html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
          "{{email}}",
          user.email
        ),
      });
      return ok(200, {
        success: true,
        message: "Şifre sıfırlama için tek kullanımlık 6 haneli kod gönderildi.",
      });
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      return ok(200, {
        success: false,
        message: "E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    }
  } catch (error) {
    return ok(200, { success: false, message: error.message });
  }
}

export async function verifyResetOtp({ email, otp }) {
  if (!email || !otp) {
    return ok(200, { success: false, message: "E-posta ve OTP gereklidir." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return ok(200, {
        success: false,
        message: "Bu mail ile eşleşen bir hesap bulamadık.",
      });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return ok(200, { success: false, message: "Hatalı doğrulama kodu!" });
    }

    if (user.resetOtpExpiredAt < Date.now()) {
      return ok(200, {
        success: false,
        message: "Tek kullanımlık şifrenizin süresi dolmuş.",
      });
    }

    return ok(200, { success: true, message: "Doğrulama kodu geçerli." });
  } catch (error) {
    return ok(200, { success: false, message: error.message });
  }
}

export async function resetPassword({ email, otp, newPassword }) {
  if (!email || !otp || !newPassword) {
    return ok(200, { success: false, message: "Lütfen tüm alanları doldurun." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return ok(200, {
        success: false,
        message: "Bu mail ile eşleşen bir hesap bulamadık.",
      });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return ok(200, { success: false, message: "Hatalı doğrulama kodu!" });
    }

    if (user.resetOtpExpiredAt < Date.now()) {
      return ok(200, {
        success: false,
        message: "Tek kullanımlık şifrenizin süresi dolmuş.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = "";
    user.resetOtpExpiredAt = 0;
    await user.save();

    return ok(200, {
      success: true,
      message: "Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.",
    });
  } catch (error) {
    return ok(200, { success: false, message: error.message });
  }
}
