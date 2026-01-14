import { OTP_LENGTH, NUMERIC_REGEX, NON_NUMERIC_REGEX } from "../constants/verification.js";

/**
 * Clears all OTP input fields
 * @param {Array} inputRefs - Array of input refs
 */
export const clearOtpInputs = (inputRefs) => {
  inputRefs.current.forEach((input) => {
    if (input) input.value = "";
  });
  inputRefs.current[0]?.focus();
};

/**
 * Extracts OTP value from input refs
 * @param {Array} inputRefs - Array of input refs
 * @returns {string} - The OTP string
 */
export const getOtpFromInputs = (inputRefs) => {
  return inputRefs.current.map((input) => input.value).join("");
};

/**
 * Validates if the input value is numeric
 * @param {string} value - Input value
 * @returns {boolean} - True if numeric
 */
export const isNumeric = (value) => {
  return NUMERIC_REGEX.test(value);
};

/**
 * Removes non-numeric characters from a string
 * @param {string} value - Input value
 * @returns {string} - Cleaned numeric string
 */
export const removeNonNumeric = (value) => {
  return value.replace(NON_NUMERIC_REGEX, "");
};

/**
 * Validates OTP length
 * @param {string} otp - OTP string
 * @returns {boolean} - True if valid length
 */
export const isValidOtpLength = (otp) => {
  return otp.length === OTP_LENGTH;
};
