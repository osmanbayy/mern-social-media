import { body, param, query } from "express-validator";
import { LIMITS, USERNAME_REGEX } from "../lib/securityConstants.js";

export const profileUsernameParam = [
  param("username")
    .trim()
    .matches(/^[a-zA-Z0-9_.]+$/)
    .isLength({ min: 1, max: LIMITS.USERNAME_MAX })
    .withMessage("Geçersiz kullanıcı adı."),
];

export const userIdParam = [param("id").isMongoId().withMessage("Geçersiz kullanıcı ID.")];

export const updateProfileValidators = [
  body("fullname")
    .optional()
    .trim()
    .isLength({ max: LIMITS.FULLNAME_MAX })
    .withMessage(`İsim en fazla ${LIMITS.FULLNAME_MAX} karakter olabilir.`),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Geçerli bir e-posta girin.")
    .isLength({ max: LIMITS.EMAIL_MAX }),
  body("username")
    .optional()
    .trim()
    .matches(USERNAME_REGEX)
    .withMessage("Kullanıcı adı yalnızca harf, rakam ve alt çizgi içerebilir.")
    .isLength({ min: LIMITS.USERNAME_MIN, max: LIMITS.USERNAME_MAX }),
  body("bio")
    .optional()
    .isString()
    .isLength({ max: LIMITS.BIO_MAX })
    .withMessage(`Biyografi en fazla ${LIMITS.BIO_MAX} karakter olabilir.`),
  body("link")
    .optional()
    .isString()
    .trim()
    .isLength({ max: LIMITS.LINK_MAX })
    .withMessage(`Bağlantı en fazla ${LIMITS.LINK_MAX} karakter olabilir.`),
  body("currentPassword")
    .optional()
    .isString()
    .isLength({ max: LIMITS.PASSWORD_MAX }),
  body("newPassword")
    .optional()
    .isString()
    .isLength({ min: LIMITS.PASSWORD_MIN, max: LIMITS.PASSWORD_MAX })
    .withMessage(`Yeni şifre ${LIMITS.PASSWORD_MIN}-${LIMITS.PASSWORD_MAX} karakter olmalıdır.`),
  body("profileImage").optional().isString().isLength({ max: LIMITS.IMG_BASE64_MAX_CHARS }),
  body("coverImg").optional().isString().isLength({ max: LIMITS.IMG_BASE64_MAX_CHARS }),
];

export const searchUsersValidators = [
  query("query")
    .optional()
    .isString()
    .trim()
    .isLength({ max: LIMITS.SEARCH_QUERY_MAX }),
];

export const searchUsersPaginatedValidators = [
  query("query")
    .optional()
    .isString()
    .trim()
    .isLength({ max: LIMITS.SEARCH_QUERY_MAX }),
  query("page").optional().isInt({ min: 1, max: LIMITS.PAGE_MAX }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];
