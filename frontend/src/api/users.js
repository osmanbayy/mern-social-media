// Users API - All user-related API calls

import { handleApiResponse } from "./handleApiResponse.js";

// API base URL'i normalize et (çift slash'ları temizle)
const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return "/api/user";
  
  let normalized = base.replace(/\/+$/, '');
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`;
  }
  
  return `${normalized}/user`;
};

const API_BASE = getApiBase();

const handleResponse = (response) =>
  handleApiResponse(response, { nonJsonFallback: "Beklenmeyen bir hata oluştu." });

// Get user profile
export const getUserProfile = async (username) => {
  const response = await fetch(`${API_BASE}/profile/${username}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

/** Mesaj ekranı başlığı için id ile özet (engelli kullanıcılar 403) */
export const getUserByIdSummary = async (id) => {
  const response = await fetch(`${API_BASE}/by-id/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

export const updateUserProfile = async (userData) => {
  try {
    // express-validator optional()+isString: null alanları göndermek "Invalid value" üretir
    const payload = Object.fromEntries(
      Object.entries(userData).filter(([, v]) => v !== null && v !== undefined)
    );

    const response = await fetch(`${API_BASE}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return handleApiResponse(response, { nonJsonFallback: "Profil güncellenemedi." });
  } catch (error) {
    throw error;
  }
};

// Follow user
export const followUser = async (userId) => {
  const response = await fetch(`${API_BASE}/follow/${userId}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Unfollow user (uses same endpoint as follow - backend handles toggle)
export const unfollowUser = async (userId) => {
  const response = await fetch(`${API_BASE}/follow/${userId}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Get followers
export const getFollowers = async (username) => {
  const response = await fetch(`${API_BASE}/followers/${username}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Get following
export const getFollowing = async (username) => {
  const response = await fetch(`${API_BASE}/following/${username}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Get suggested users
export const getSuggestedUsers = async (page = 1, limit = 5) => {
  const response = await fetch(`${API_BASE}/suggested?page=${page}&limit=${limit}`, {
    credentials: "include",
  });
  const data = await handleResponse(response);
  // For backward compatibility, if response is array, return it
  // Otherwise return the paginated response
  if (Array.isArray(data)) {
    return data;
  }
  return data;
};

// Search users for mentions
export const searchUsers = async (query) => {
  if (!query || query.trim().length === 0) {
    return [];
  }
  const response = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Search users with pagination
export const searchUsersPaginated = async (query, page = 1, limit = 5) => {
  if (!query || query.trim().length === 0) {
    return {
      users: [],
      hasMore: false,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }
  const response = await fetch(`${API_BASE}/search/paginated?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Block user
export const blockUser = async (userId) => {
  const response = await fetch(`${API_BASE}/block/${userId}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Unblock user
export const unblockUser = async (userId) => {
  const response = await fetch(`${API_BASE}/unblock/${userId}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Get blocked users
export const getBlockedUsers = async () => {
  const response = await fetch(`${API_BASE}/blocked`, {
    credentials: "include",
  });
  return handleResponse(response);
};