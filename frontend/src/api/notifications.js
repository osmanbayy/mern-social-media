// Notifications API - All notification-related API calls

const API_BASE = "/api/notifications";

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Bir hata oluştu.");
  }
  return data;
};

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
