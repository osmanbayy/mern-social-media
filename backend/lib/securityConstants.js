/** İstemci + veritabanı için üst sınırlar (spam / aşırı yük önleme) */
export const LIMITS = {
  POST_TEXT_MAX: 5000,
  COMMENT_TEXT_MAX: 2000,
  REPLY_TEXT_MAX: 2000,
  USERNAME_MAX: 50,
  USERNAME_MIN: 3,
  FULLNAME_MAX: 100,
  BIO_MAX: 500,
  LINK_MAX: 500,
  EMAIL_MAX: 254,
  PASSWORD_MAX: 128,
  PASSWORD_MIN: 6,
  SEARCH_QUERY_MAX: 200,
  PAGE_MAX: 500,
  /** Base64 görsel üst sınırı (yaklaşık ~10MB metin) */
  IMG_BASE64_MAX_CHARS: 12 * 1024 * 1024,
  POLL_QUESTION_MAX: 300,
  POLL_OPTION_TEXT_MAX: 100,
  POLL_OPTIONS_MIN: 2,
  POLL_OPTIONS_MAX: 4,
  LOCATION_NAME_MAX: 200,
};

export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
