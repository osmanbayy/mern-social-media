import transporter from "../config/nodemailer.js";
import { generateTokenAndSetCookie } from "../lib/utils/generate_token.js";
import User from "../models/user_model.js";
import bcrypt from "bcryptjs";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";
import mongoose from "mongoose";

export const signup = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;
    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ message: "Lütfen tüm alanları doldurun." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Geçersiz e-posta adresi." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Şifre en az 6 karakter olmalıdır." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Bu kullanıcı adı zaten kullanılıyor." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "Bu e-posta adresi zaten kullanılıyor." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
    });

    // Generate verification OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    newUser.verifyOtp = otp;
    newUser.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await newUser.save();
    generateTokenAndSetCookie(newUser._id, res);

    // Sending verification OTP email
    try {
      if (!process.env.SENDER_EMAIL) {
        console.error("SENDER_EMAIL environment variable is not set!");
      }

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: "Hesabınızı Doğrulayın",
        html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
          "{{email}}",
          email
        ),
      };

      const info = await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
    }

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      fullname: newUser.fullname,
      followers: newUser.followers,
      following: newUser.following,
      profileImage: newUser.profileImage,
      coverImg: newUser.coverImg,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Sunucu hatası!" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Lütfen tüm alanları doldurun." });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Kullanıcı adı veya şifre hatalı." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password || ""
    );

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ message: "Kullanıcı adı veya şifre hatalı." });
    }

    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      followers: user.followers,
      following: user.following,
      profileImage: user.profileImage,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Sunucu hatası!",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
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
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getme controller", error.message);
    res.status(500).json({ error: "Sunucu hatası!" });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log("userId from body:", userId);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "This account already verified.",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Hesabınızı Doğrulayın",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    try {
      if (!process.env.SENDER_EMAIL) {
        console.error("SENDER_EMAIL environment variable is not set!");
      }

      const mailOption = {
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: user.email,
        subject: "Hesabınızı Doğrulayın",
        html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
          "{{email}}",
          user.email
        ),
      };

      const info = await transporter.sendMail(mailOption);

      res.json({
        success: true,
        message: "Doğrulama kodu gönderildi.",
      });
    } catch (emailError) {
      res.status(500).json({
        success: false,
        message: "E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        error: process.env.NODE_ENV === "development" ? emailError.message : undefined
      });
    }
  } catch (error) {
    console.error("Error in sendVerifyOtp:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Kullanıcı ID ve OTP gereklidir."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz kullanıcı ID."
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı."
      });
    }

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Bu hesap zaten doğrulanmış."
      });
    }

    // OTP kontrolü
    if (!user.verifyOtp || user.verifyOtp === "" || user.verifyOtp !== otp) {
      console.log("OTP mismatch:", {
        provided: otp,
        stored: user.verifyOtp,
        userId: userId
      });
      return res.status(400).json({
        success: false,
        message: "Geçersiz doğrulama kodu."
      });
    }

    // OTP süresi kontrolü
    if (!user.verifyOtpExpiresAt || user.verifyOtpExpiresAt === 0) {
      console.log("OTP expiration not set for user:", userId);
      return res.status(400).json({
        success: false,
        message: "Doğrulama kodu süresi dolmuş. Lütfen yeni bir kod isteyin."
      });
    }

    if (user.verifyOtpExpiresAt < Date.now()) {
      console.log("OTP expired:", {
        expiresAt: new Date(user.verifyOtpExpiresAt),
        now: new Date(),
        userId: userId
      });
      return res.status(400).json({
        success: false,
        message: "Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod isteyin."
      });
    }

    // verify account
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiresAt = 0;

    await user.save();

    console.log("Email verified successfully for user:", userId);

    return res.json({
      success: true,
      message: "Mail başarıyla doğrulandı."
    });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası oluştu.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Mail girilmelidir." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Bu mail hesabıyla kayıtlu kullanıcı yok.",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000; // expires in 15 minutes

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to: user.email,
      subject: "Şifrenizi Sıfırlayın!",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    try {
      return res.json({
        success: true,
        message: "Şifre sıfırlama için tek kullanımlık 6 haneli kod gönderildi.",
      });
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      return res.json({
        success: false,
        message: "E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
      });
    }
  } catch (error) {
    console.error("Error in sendPasswordResetOtp:", error);
    res.json({ success: false, message: error.message });
  }
};

export const testEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const testMailOptions = {
      from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Test Email - OnSekiz",
      html: `
        <h1>Test Email</h1>
        <p>Bu bir test e-postasıdır.</p>
        <p>Eğer bu e-postayı alıyorsanız, email yapılandırması doğru çalışıyor demektir.</p>
        <p>Zaman: ${new Date().toISOString()}</p>
      `,
    };

    const info = await transporter.sendMail(testMailOptions);

    res.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: info.messageId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: {
        message: error.message,
        code: error.code,
        response: error.response,
      },
    });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Lütfen tüm alanları doldurun.",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Bu mail ile eşleşen bir hesap bulamadık.",
      });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({
        success: false,
        message: "Hatalı doğrulama kodu!",
      });
    }

    if (user.resetOtpExpiredAt < Date.now()) {
      return res.json({
        success: false,
        message: "Tek kullanımlık şifrenizin süresi dolmuş.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiredAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
