/**
 * Calculates password strength based on various criteria
 * @param {string} password - The password to check
 * @returns {Object} - Object containing strength level, checks, and strength count
 */
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return { strength: 0, level: "", checks: {} };
  }

  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const strengthCount = Object.values(checks).filter(Boolean).length;
  let level = "";
  let strength = 0;

  if (strengthCount <= 2) {
    level = "Zayıf";
    strength = 1;
  } else if (strengthCount === 3) {
    level = "Orta";
    strength = 2;
  } else if (strengthCount === 4) {
    level = "Güçlü";
    strength = 3;
  } else {
    level = "Çok Güçlü";
    strength = 4;
  }

  return { strength, level, checks };
};
