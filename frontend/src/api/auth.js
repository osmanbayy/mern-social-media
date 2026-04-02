import { handleApiResponse } from "./handleApiResponse.js";

const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return "/api/auth";
  
  let normalized = base.replace(/\/+$/, '');
  
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`;
  }
  
  return `${normalized}/auth`;
};

const API_BASE = getApiBase();
const AUTH_ME_TIMEOUT_MS = 7000;
const AUTH_MUTATION_TIMEOUT_MS = 10000;

const handleResponse = (response) =>
  handleApiResponse(response, { nonJsonFallback: "Beklenmeyen bir hata oluştu." });

export const getCurrentUser = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_ME_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/me`, {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
    
    if (response.status === 401 || response.status === 403) {
      return null;
    }
    
    if (!response.ok) {
      return null;
    }
    
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const login = async (username, password) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_MUTATION_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });
    return handleResponse(response);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Giris istegi zaman asimina ugradi. Sunucuda su an bir sorun olabilir, lutfen biraz sonra tekrar dene."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const signup = async (userData) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_MUTATION_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
      signal: controller.signal,
    });
    return handleResponse(response);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Kayit istegi zaman asimina ugradi. Sunucuda su an bir sorun olabilir, lutfen biraz sonra tekrar dene."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const logout = async () => {
  const response = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

export const verifyAccount = async (userId, otp) => {
  const response = await fetch(`${API_BASE}/verify-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ userId, otp }),
  });
  return handleResponse(response);
};

export const sendVerifyOtp = async (userId) => {
  const response = await fetch(`${API_BASE}/send-verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ userId }),
  });
  return handleResponse(response);
};

export const resendVerificationCode = async () => {
  const response = await fetch(`${API_BASE}/resend-verification-code`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

export const requestPasswordReset = async (email) => {
  const response = await fetch(`${API_BASE}/send-reset-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const verifyResetOtp = async (email, otp) => {
  const response = await fetch(`${API_BASE}/verify-reset-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, otp }),
  });
  return handleResponse(response);
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await fetch(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, otp, newPassword }),
  });
  return handleResponse(response);
};
