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

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(text || "Unexpected error occurred.");
  }
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "An error occurred.");
  }
  return data;
};

export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE}/me`, {
      credentials: "include",
      cache: "no-store",
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
  }
};

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

export const logout = async () => {
  const response = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

export const verifyAccount = async (verificationCode) => {
  const response = await fetch(`${API_BASE}/verify/${verificationCode}`, {
    method: "POST",
    credentials: "include",
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
