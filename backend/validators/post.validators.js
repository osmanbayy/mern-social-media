import { body, param, query } from "express-validator";
import { LIMITS } from "../lib/securityConstants.js";
import { normalizeHashtagParam } from "../lib/hashtags.js";

/** Metin, görsel, anket veya konum etiketinden en az biri dolu olmalı */
export function requirePostContent(req, res, next) {
  const t = req.body?.text;
  const img = req.body?.img;
  const poll = req.body?.poll;
  const loc = req.body?.location;
  const hasT = typeof t === "string" && t.trim().length > 0;
  const hasI = typeof img === "string" && img.trim().length > 0;
  const hasPoll =
    poll &&
    typeof poll === "object" &&
    Array.isArray(poll.options) &&
    poll.options.length >= 2 &&
    poll.options.some((o) => typeof o?.text === "string" && o.text.trim().length > 0);
  const hasLoc =
    loc &&
    typeof loc === "object" &&
    typeof loc.name === "string" &&
    loc.name.trim().length > 0;
  if (!hasT && !hasI && !hasPoll && !hasLoc) {
    return res.status(400).json({ message: "Gönderi metni, görsel, anket veya konum gerekli." });
  }
  next();
}

export const createPostValidators = [
  body("text")
    .optional()
    .isString()
    .trim()
    .isLength({ max: LIMITS.POST_TEXT_MAX })
    .withMessage(`Gönderi en fazla ${LIMITS.POST_TEXT_MAX} karakter olabilir.`),
  body("img")
    .optional()
    .isString()
    .isLength({ max: LIMITS.IMG_BASE64_MAX_CHARS })
    .withMessage("Görsel verisi çok büyük."),
  body("poll").optional().isObject().withMessage("Geçersiz anket."),
  body("location").optional().isObject().withMessage("Geçersiz konum."),
];

export const editPostValidators = [
  param("id").isMongoId().withMessage("Geçersiz gönderi ID."),
  body("text")
    .optional()
    .isString()
    .trim()
    .isLength({ max: LIMITS.POST_TEXT_MAX })
    .withMessage(`Metin en fazla ${LIMITS.POST_TEXT_MAX} karakter olabilir.`),
  body("img")
    .optional()
    .isString()
    .isLength({ max: LIMITS.IMG_BASE64_MAX_CHARS })
    .withMessage("Görsel verisi çok büyük."),
  body("location")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      return typeof value === "object" && !Array.isArray(value);
    })
    .withMessage("Geçersiz konum."),
];

export const postIdParam = [param("id").isMongoId().withMessage("Geçersiz gönderi ID.")];

/** Kayıtlı/gizli listeleri — URL'deki :id kullanıcı ID */
export const userProfileIdParam = [
  param("id").isMongoId().withMessage("Geçersiz kullanıcı ID."),
];

export const commentValidators = [
  param("id").isMongoId().withMessage("Geçersiz gönderi ID."),
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Yorum metni gerekli.")
    .isLength({ max: LIMITS.COMMENT_TEXT_MAX })
    .withMessage(`Yorum en fazla ${LIMITS.COMMENT_TEXT_MAX} karakter olabilir.`),
];

export const commentNestedValidators = [
  param("postId").isMongoId().withMessage("Geçersiz gönderi ID."),
  param("commentId").isMongoId().withMessage("Geçersiz yorum ID."),
];

export const replyValidators = [
  ...commentNestedValidators,
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Yanıt metni gerekli.")
    .isLength({ max: LIMITS.REPLY_TEXT_MAX })
    .withMessage(`Yanıt en fazla ${LIMITS.REPLY_TEXT_MAX} karakter olabilir.`),
];

export const editCommentValidators = [
  ...commentNestedValidators,
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Yorum metni gerekli.")
    .isLength({ max: LIMITS.COMMENT_TEXT_MAX })
    .withMessage(`Yorum en fazla ${LIMITS.COMMENT_TEXT_MAX} karakter olabilir.`),
];

export const quoteRetweetValidators = [
  param("id").isMongoId().withMessage("Geçersiz gönderi ID."),
  body("text")
    .optional()
    .isString()
    .trim()
    .isLength({ max: LIMITS.POST_TEXT_MAX }),
  body("img")
    .optional()
    .isString()
    .isLength({ max: LIMITS.IMG_BASE64_MAX_CHARS }),
  body("poll").optional().isObject().withMessage("Geçersiz anket."),
  body("location").optional().isObject().withMessage("Geçersiz konum."),
];

export const votePollValidators = [
  param("id").isMongoId().withMessage("Geçersiz gönderi ID."),
  body("optionIndex")
    .isInt({ min: 0, max: LIMITS.POLL_OPTIONS_MAX - 1 })
    .toInt()
    .withMessage("Geçersiz seçenek."),
];

export const searchPostsValidators = [
  query("query")
    .optional()
    .isString()
    .trim()
    .isLength({ max: LIMITS.SEARCH_QUERY_MAX })
    .withMessage("Arama çok uzun."),
  query("page")
    .optional()
    .isInt({ min: 1, max: LIMITS.PAGE_MAX })
    .toInt()
    .withMessage("Geçersiz sayfa."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage("Geçersiz limit."),
];

export const hashtagParamValidators = [
  param("tag")
    .customSanitizer((value) => normalizeHashtagParam(value) ?? "")
    .notEmpty()
    .withMessage("Geçersiz etiket."),
];

export const paginationQueryValidators = [
  query("page").optional().isInt({ min: 1, max: LIMITS.PAGE_MAX }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const usernameParam = [
  param("username")
    .trim()
    .matches(/^[a-zA-Z0-9_.]+$/)
    .isLength({ min: 1, max: LIMITS.USERNAME_MAX })
    .withMessage("Geçersiz kullanıcı adı."),
];
