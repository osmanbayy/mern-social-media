import rateLimit from "express-rate-limit";

const msg = "Çok fazla istek. Lütfen bir süre sonra tekrar deneyin.";

/** Genel API (IP başına) — brute force öncesi tüm uçları sınırlar */
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_GLOBAL_MAX) || 400,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: msg },
});

/** Giriş denemeleri */
export const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin." },
});

/** Kayıt */
export const authSignupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_SIGNUP_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Bu IP üzerinden çok fazla kayıt denemesi yapıldı." },
});

/** Şifre sıfırlama / OTP e-postaları */
export const authOtpEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_OTP_EMAIL_MAX) || 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Çok fazla kod isteği. Bir süre sonra tekrar deneyin." },
});

/** Gönderi oluşturma / yorum (spam) */
export const postWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_POST_WRITE_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Çok hızlı gönderi veya yorum gönderiyorsunuz. Kısa bir süre bekleyin." },
});

/** Mesaj gönderme */
export const messageSendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MESSAGE_SEND_MAX) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Çok fazla mesaj gönderildi. Lütfen kısa bir süre bekleyin." },
});

/** Dosya yükleme */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_UPLOAD_MAX) || 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Çok fazla yükleme isteği. Lütfen bekleyin." },
});
