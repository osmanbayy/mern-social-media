// Posts API - All post-related API calls

import { createJsonApiHandlers } from "./apiClient.js";

const { API_BASE, handleResponse } = createJsonApiHandlers(
  "post",
  "Bir hata oluştu."
);

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

/** @param {string} tag Küçük harf, # olmadan */
export const getPostsByHashtag = async (tag, page = 1, limit = 10) => {
  if (!tag || String(tag).trim().length === 0) {
    return {
      posts: [],
      hasMore: false,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total: 0,
    };
  }
  const encoded = encodeURIComponent(String(tag).trim());
  const t = Date.now();
  const response = await fetch(
    `${API_BASE}/hashtag/${encoded}?page=${page}&limit=${limit}&t=${t}`,
    {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
  return handleResponse(response);
};

/** @param {{ limit?: number, sinceDays?: number }} [options] */
export const getTrendingHashtags = async (options = {}) => {
  const limit = options.limit ?? 10;
  const sinceDays = options.sinceDays ?? 7;
  const t = Date.now();
  const response = await fetch(
    `${API_BASE}/trending/hashtags?limit=${limit}&sinceDays=${sinceDays}&t=${t}`,
    {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
  return handleResponse(response);
};

// Search posts
export const searchPosts = async (query, page = 1, limit = 5) => {
  if (!query || query.trim().length === 0) {
    return {
      posts: [],
      hasMore: false,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }
  const response = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Retweet post (direct retweet)
export const retweetPost = async (postId) => {
  const response = await fetch(`${API_BASE}/retweet/${postId}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

// Vote on post poll
export const votePoll = async (postId, optionIndex) => {
  const response = await fetch(`${API_BASE}/${postId}/poll/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ optionIndex }),
  });
  return handleResponse(response);
};

// Quote retweet
export const quoteRetweet = async (postId, postData) => {
  const response = await fetch(`${API_BASE}/quote/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(postData),
  });
  return handleResponse(response);
};