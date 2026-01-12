// Users API - All user-related API calls

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

// Get user profile
export const getUserProfile = async (username) => {
  const response = await fetch(`${API_BASE}/profile/${username}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await fetch(`${API_BASE}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to update profile";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    return handleResponse(response);
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
