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

    await newUser.save();
    generateTokenAndSetCookie(newUser._id, res);

    // Sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "OnSekiz'e Hoşgeldin!",
      text: `Seni aramızda görmekten mutluluk duyuyoruz. Hesabın ${email} adresiyle başarıyla oluşturuldu.`,
    };

    await transporter.sendMail(mailOptions);

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
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  res.cookie("jwt", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    expires: new Date(0),
    path: "/",
  });

  res.status(200).json({ message: "Çıkış yapıldı." });
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

    await transporter.sendMail(mailOption);

    res.json({
      success: true,
      message: "Doğrulama kodu gönderildi.",
    });
  } catch (error) {
    console.error("Error in sendVerifyOtp:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing details." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP." });
    }

    if (user.verifyOtpExpiredAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired." });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiredAt = 0;

    await user.save();
    return res.json({ success: true, message: "Mail başarıyla doğrulandı." });
  } catch (error) {
    res.json({ success: false, message: error.message });
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
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Şifrenizi Sıfırlayın!",
      // text: `Your One Time Password for resetting your password is ${otp}. Use this One Time Password to proceed with resetting your password.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    await transporter.sendMail(mailOption);

    return res.json({
      success: true,
      message: "Şifre sıfırlama için tek kullanımlık 6 haneli kod gönderildi.",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
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
