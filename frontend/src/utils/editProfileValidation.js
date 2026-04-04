const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEditProfileForm(formData) {
  const newErrors = {};

  if (!formData.fullname?.trim()) {
    newErrors.fullname = "Ad Soyad gereklidir";
  }

  if (!formData.username?.trim()) {
    newErrors.username = "Kullanıcı adı gereklidir";
  } else if (formData.username.length < 3) {
    newErrors.username = "Kullanıcı adı en az 3 karakter olmalıdır";
  }

  if (!formData.email?.trim()) {
    newErrors.email = "E-posta gereklidir";
  } else if (!EMAIL_REGEX.test(formData.email)) {
    newErrors.email = "Geçerli bir e-posta adresi girin";
  }

  const wantsPasswordChange =
    Boolean(formData.newPassword) ||
    Boolean(formData.currentPassword) ||
    Boolean(formData.confirmNewPassword);

  if (wantsPasswordChange) {
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Yeni şifre için mevcut şifrenizi girin";
    }
    if (!formData.newPassword) {
      newErrors.newPassword = "Yeni şifre girin";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Şifre en az 6 karakter olmalıdır";
    }
    if (formData.newPassword && !formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Yeni şifrenizi tekrar girin";
    } else if (
      formData.newPassword &&
      formData.confirmNewPassword &&
      formData.newPassword !== formData.confirmNewPassword
    ) {
      newErrors.confirmNewPassword = "Şifreler eşleşmiyor";
    }
  }

  return newErrors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
