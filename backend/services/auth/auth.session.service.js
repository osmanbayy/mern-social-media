import bcrypt from "bcryptjs";
import User from "../../models/user_model.js";
import transporter from "../../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE } from "../../config/emailTemplates.js";
import { ok, fail } from "../../lib/httpResult.js";

function publicUserFields(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    fullname: user.fullname,
    followers: user.followers,
    following: user.following,
    profileImage: user.profileImage,
    coverImg: user.coverImg,
  };
}

export async function signup({ fullname, username, email, password }) {
  if (!fullname || !username || !email || !password) {
    return fail(400, "Lütfen tüm alanları doldurun.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return fail(400, "Geçersiz e-posta adresi.");
  }

  if (password.length < 6) {
    return fail(400, "Şifre en az 6 karakter olmalıdır.");
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return fail(400, "Bu kullanıcı adı zaten kullanılıyor.");
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return fail(400, "Bu e-posta adresi zaten kullanılıyor.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    fullname,
    username,
    email,
    password: hashedPassword,
  });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  newUser.verifyOtp = otp;
  newUser.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

  await newUser.save();

  try {
    if (!process.env.SENDER_EMAIL) {
      console.error("SENDER_EMAIL environment variable is not set!");
    }
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Hesabınızı Doğrulayın",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", email),
    });
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
  }

  return {
    ok: true,
    status: 201,
    data: publicUserFields(newUser),
    cookieUserId: newUser._id,
  };
}

export async function login({ username, password }) {
  if (!username || !password) {
    return fail(400, "Lütfen tüm alanları doldurun.");
  }

  const user = await User.findOne({ username });
  if (!user) {
    return fail(400, "Kullanıcı adı veya şifre hatalı.");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password || "");
  if (!isPasswordCorrect) {
    return fail(400, "Kullanıcı adı veya şifre hatalı.");
  }

  return {
    ok: true,
    status: 200,
    data: publicUserFields(user),
    cookieUserId: user._id,
  };
}
