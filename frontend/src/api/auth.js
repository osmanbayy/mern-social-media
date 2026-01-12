// Auth API - All authentication-related API calls

// API base URL'i normalize et (çift slash'ları temizle)
const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return "/api/auth";
  const normalized = base.replace(/\/+$/, ''); // Sonundaki slash'ları temizle
  return `${normalized}/auth`;
};

const API_BASE = getApiBase();

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Bir hata oluştu.");
  }
  return data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE}/me`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Login
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
};

// Signup
export const signup = async (userData) => {
  const response = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

// Logout
export const logout = async () => {
  const response = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Verify account
export const verifyAccount = async (verificationCode) => {
  const response = await fetch(`${API_BASE}/verify/${verificationCode}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Resend verification code
export const resendVerificationCode = async () => {
  const response = await fetch(`${API_BASE}/resend-verification-code`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Reset password request
export const requestPasswordReset = async (email) => {
  const response = await fetch(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE}/reset-password/${token}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ newPassword }),
  });
  return handleResponse(response);
};
