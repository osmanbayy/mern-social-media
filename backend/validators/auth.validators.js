import { body } from "express-validator";
import { LIMITS, USERNAME_REGEX } from "../lib/securityConstants.js";

export const signupValidators = [
  body("fullname")
    .trim()
    .notEmpty()
    .withMessage("İsim gerekli.")
    .isLength({ max: LIMITS.FULLNAME_MAX })
    .withMessage(`İsim en fazla ${LIMITS.FULLNAME_MAX} karakter olabilir.`),
  body("username")
    .trim()
    .matches(USERNAME_REGEX)
    .withMessage("Kullanıcı adı yalnızca harf, rakam ve alt çizgi içerebilir.")
    .isLength({ min: LIMITS.USERNAME_MIN, max: LIMITS.USERNAME_MAX })
    .withMessage(`Kullanıcı adı ${LIMITS.USERNAME_MIN}-${LIMITS.USERNAME_MAX} karakter olmalıdır.`),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Geçerli bir e-posta girin.")
    .isLength({ max: LIMITS.EMAIL_MAX }),
  body("password")
    .isLength({ min: LIMITS.PASSWORD_MIN, max: LIMITS.PASSWORD_MAX })
    .withMessage(`Şifre ${LIMITS.PASSWORD_MIN}-${LIMITS.PASSWORD_MAX} karakter arasında olmalıdır.`),
];

export const loginValidators = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Kullanıcı adı gerekli.")
    .isLength({ max: LIMITS.USERNAME_MAX }),
  body("password")
    .notEmpty()
    .withMessage("Şifre gerekli.")
    .isLength({ max: LIMITS.PASSWORD_MAX }),
];

export const sendVerifyOtpValidators = [
  body("userId").trim().notEmpty().isMongoId().withMessage("Geçersiz kullanıcı ID."),
];

export const verifyEmailValidators = [
  body("userId").trim().notEmpty().isMongoId().withMessage("Geçersiz kullanıcı ID."),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("Doğrulama kodu gerekli.")
    .isLength({ min: 4, max: 12 })
    .withMessage("Geçersiz kod."),
];

export const sendPasswordResetOtpValidators = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Geçerli bir e-posta girin.")
    .isLength({ max: LIMITS.EMAIL_MAX }),
];

export const verifyResetOtpValidators = [
  body("email").trim().isEmail().withMessage("Geçerli bir e-posta girin."),
  body("otp")
    .trim()
    .notEmpty()
    .isLength({ min: 4, max: 12 })
    .withMessage("Geçersiz kod."),
];

export const resetPasswordValidators = [
  body("email").trim().isEmail().withMessage("Geçerli bir e-posta girin."),
  body("otp").trim().notEmpty().isLength({ min: 4, max: 12 }).withMessage("Geçersiz kod."),
  body("newPassword")
    .isLength({ min: LIMITS.PASSWORD_MIN, max: LIMITS.PASSWORD_MAX })
    .withMessage(`Yeni şifre ${LIMITS.PASSWORD_MIN}-${LIMITS.PASSWORD_MAX} karakter olmalıdır.`),
];

export const testEmailValidators = [
  body("email").trim().isEmail().withMessage("Geçerli bir e-posta girin."),
];
