// Auth API - All authentication-related API calls

// API base URL'i normalize et (çift slash'ları temizle)
const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return "/api/auth";
  
  // URL'i normalize et
  let normalized = base.replace(/\/+$/, ''); // Sonundaki slash'ları temizle
  
  // Eğer /api yoksa ekle (Vercel'de backend URL'i sadece domain olabilir)
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`;
  }
  
  return `${normalized}/auth`;
};

const API_BASE = getApiBase();

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(text || "Beklenmeyen bir hata oluştu.");
  }
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Bir hata oluştu.");
  }
  return data;
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE}/me`, {
      credentials: "include",
    });
    
    // If unauthorized, return null instead of throwing
    if (response.status === 401 || response.status === 403) {
      return null;
    }
    
    return handleResponse(response);
  } catch (error) {
    // If any error occurs, return null
    return null;
  }
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
