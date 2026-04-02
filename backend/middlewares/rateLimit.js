import rateLimit from "express-rate-limit";

const msg = "Çok fazla istek. Lütfen bir süre sonra tekrar deneyin.";

const globalApiLimiterOptions = {
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_GLOBAL_MAX) || 400,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: msg },
};

/** Genel API (IP başına) — tek instance’da bellek; REDIS_URL ile çoklu instance için Redis */
export let globalApiLimiter = rateLimit(globalApiLimiterOptions);

/**
 * REDIS_URL tanımlıysa global limiteri Redis store ile değiştirir (çoklu pod/replica).
 * Bağlantı hatasında bellek tabanlı limiter kalır.
 */
export async function maybeUpgradeGlobalLimiterFromRedis() {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return;

  try {
    const { createClient } = await import("redis");
    const { RedisStore } = await import("rate-limit-redis");

    const client = createClient({ url });
    client.on("error", (err) => console.error("Redis (rate limit):", err.message));
    await client.connect();

    const store = new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
    });

    globalApiLimiter = rateLimit({
      ...globalApiLimiterOptions,
      store,
    });
    console.log("Rate limit: Redis store aktif (global API).");
  } catch (e) {
    console.warn("Rate limit: Redis kullanılamadı, bellek tabanlı limiter kullanılıyor.", e.message);
  }
}

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
