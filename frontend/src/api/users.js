// Users API - All user-related API calls

// API base URL'i normalize et (çift slash'ları temizle)
const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return "/api/user";
  const normalized = base.replace(/\/+$/, ''); // Sonundaki slash'ları temizle
  return `${normalized}/user`;
};

const API_BASE = getApiBase();

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Bir hata oluştu.");
  }
  return data;
};

// Get user profile
export const getUserProfile = async (username) => {
  const response = await fetch(`${API_BASE}/profile/${username}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Update user profile
export const updateUserProfile = async (userData) => {
  const response = await fetch(`${API_BASE}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

// Follow user
export const followUser = async (userId) => {
  const response = await fetch(`${API_BASE}/follow/${userId}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Unfollow user
export const unfollowUser = async (userId) => {
  const response = await fetch(`${API_BASE}/unfollow/${userId}`, {
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
export const getSuggestedUsers = async () => {
  const response = await fetch(`${API_BASE}/suggested`, {
    credentials: "include",
  });
  return handleResponse(response);
};
