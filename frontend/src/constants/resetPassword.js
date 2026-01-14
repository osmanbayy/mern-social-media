export const RESET_PASSWORD_STEPS = {
  EMAIL: "email",
  OTP: "otp",
  NEW_PASSWORD: "newPassword",
};

export const OTP_LENGTH = 6;
export const MIN_PASSWORD_LENGTH = 6;

export const ERROR_MESSAGES = {
  EMAIL_REQUIRED: "Lütfen e-posta adresinizi girin.",
  INVALID_OTP_LENGTH: "Lütfen 6 haneli doğrulama kodunu girin.",
  PASSWORD_TOO_SHORT: "Şifre en az 6 karakter olmalıdır.",
  EMAIL_SEND_FAILED: "E-posta gönderilemedi.",
  RESET_FAILED: "Şifre sıfırlama başarısız.",
  GENERIC_ERROR: "Bir hata oluştu.",
};

export const HELP_TEXTS = {
  CHECK_SPAM: "Kodunuzu bulamıyorsanız spam klasörünüzü kontrol edin",
  SAVE_PASSWORD: "Şifrenizi güvenli bir yerde saklayın",
};
