export const OTP_LENGTH = 6;

export const STORAGE_KEYS = {
  OTP_SENT: "otpSent",
};

export const ROUTES = {
  HOME: "/",
};

export const ERROR_MESSAGES = {
  USER_NOT_FOUND: "Kullanıcı bilgisi bulunamadı.",
  INVALID_OTP_LENGTH: "Lütfen 6 haneli doğrulama kodunu girin.",
  VERIFICATION_FAILED: "Doğrulama başarısız.",
  OTP_SEND_FAILED: "Doğrulama kodu gönderilemedi.",
  GENERIC_ERROR: "Bir hata oluştu.",
};

export const NUMERIC_REGEX = /^\d*$/;
export const NON_NUMERIC_REGEX = /\D/g;
