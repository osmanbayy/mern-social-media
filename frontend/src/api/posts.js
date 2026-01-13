// Posts API - All post-related API calls

// API base URL'i normalize et (çift slash'ları temizle)
const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return "/api/post";
  
  let normalized = base.replace(/\/+$/, '');
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`;
  }
  
  return `${normalized}/post`;
};

const API_BASE = getApiBase();

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error("Sunucu hatası: JSON beklenirken HTML döndü.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Bir hata oluştu.");
  }
  return data;
};

// Get all posts
export const getAllPosts = async (page = 1, limit = 10) => {
  const timestamp = new Date().getTime();
  const response = await fetch(`${API_BASE}/all?page=${page}&limit=${limit}&t=${timestamp}`, {
    credentials: "include",
    cache: "no-store", // Prevent browser cache
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
  const data = await handleResponse(response);
  // For backward compatibility, if response is array, return it
  // Otherwise return the paginated response
  if (Array.isArray(data)) {
    return data;
  }
  return data;
};

// Get following posts
export const getFollowingPosts = async () => {
  const response = await fetch(`${API_BASE}/following`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Get single post
export const getSinglePost = async (postId) => {
  const timestamp = new Date().getTime();
  const response = await fetch(`${API_BASE}/${postId}?t=${timestamp}`, {
    credentials: "include",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Accept": "application/json",
    },
  });

  if (response.status === 304) {
    const freshResponse = await fetch(`${API_BASE}/${postId}?t=${new Date().getTime()}`, {
      credentials: "include",
      cache: "reload",
      headers: {
        "Accept": "application/json",
      },
    });
    return handleResponse(freshResponse);
  }

  return handleResponse(response);
};

// Get user posts
export const getUserPosts = async (username) => {
  const response = await fetch(`${API_BASE}/user/${username}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Get liked posts
export const getLikedPosts = async (userId) => {
  const response = await fetch(`${API_BASE}/likes/${userId}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Get saved posts
export const getSavedPosts = async (userId) => {
  const response = await fetch(`${API_BASE}/saved/${userId}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Get hidden posts
export const getHiddenPosts = async (userId) => {
  const response = await fetch(`${API_BASE}/hidden/${userId}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Pin/Unpin post
export const pinPost = async (postId) => {
  const response = await fetch(`${API_BASE}/pin/${postId}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Create post
export const createPost = async (postData) => {
  const response = await fetch(`${API_BASE}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(postData),
  });
  return handleResponse(response);
};

// Delete post
export const deletePost = async (postId) => {
  const response = await fetch(`${API_BASE}/${postId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
};

// Edit post
export const editPost = async (postId, postData) => {
  const response = await fetch(`${API_BASE}/${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(postData),
  });
  return handleResponse(response);
};

// Like/Unlike post
export const likePost = async (postId) => {
  const response = await fetch(`${API_BASE}/like/${postId}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Comment on post
export const commentPost = async (postId, commentText) => {
  const response = await fetch(`${API_BASE}/comment/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ text: commentText }),
  });
  return handleResponse(response);
};

// Save/Unsave post
export const savePost = async (postId) => {
  const response = await fetch(`${API_BASE}/save/${postId}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Hide post
export const hidePost = async (postId) => {
  const response = await fetch(`${API_BASE}/hide/${postId}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Unhide post
export const unhidePost = async (postId) => {
  const response = await fetch(`${API_BASE}/hide/${postId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
};

// Like/Unlike comment
export const likeComment = async (postId, commentId) => {
  const response = await fetch(`${API_BASE}/comment/${postId}/${commentId}/like`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Reply to comment
export const replyToComment = async (postId, commentId, replyText) => {
  const response = await fetch(`${API_BASE}/comment/${postId}/${commentId}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ text: replyText }),
  });
  return handleResponse(response);
};

// Delete comment
export const deleteComment = async (postId, commentId) => {
  const response = await fetch(`${API_BASE}/comment/${postId}/${commentId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
};

// Edit comment
export const editComment = async (postId, commentId, commentText) => {
  const response = await fetch(`${API_BASE}/comment/${postId}/${commentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ text: commentText }),
  });
  return handleResponse(response);
};