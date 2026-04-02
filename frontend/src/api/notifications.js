// Notifications API - All notification-related API calls

import { handleApiResponse } from "./handleApiResponse.js";

// API base URL'i normalize et (çift slash'ları temizle)
const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return "/api/notifications";
  
  let normalized = base.replace(/\/+$/, '');
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`;
  }
  
  return `${normalized}/notifications`;
};

const API_BASE = getApiBase();

const handleResponse = (response) =>
  handleApiResponse(response, { nonJsonFallback: "Bir hata oluştu." });

// Get notifications
export const getNotifications = async () => {
  const response = await fetch(`${API_BASE}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  const response = await fetch(`${API_BASE}/${notificationId}/read`, {
    method: "PUT",
    credentials: "include",
  });
  return handleResponse(response);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${API_BASE}/read-all`, {
    method: "PUT",
    credentials: "include",
  });
  return handleResponse(response);
};

// Delete all notifications
export const deleteAllNotifications = async () => {
  const response = await fetch(`${API_BASE}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
};

// Delete single notification
export const deleteNotification = async (notificationId) => {
  const response = await fetch(`${API_BASE}/${notificationId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
};