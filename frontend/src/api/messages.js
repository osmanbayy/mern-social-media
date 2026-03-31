const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return "/api/messages";

  let normalized = base.replace(/\/+$/, "");
  if (!normalized.endsWith("/api")) {
    normalized = `${normalized}/api`;
  }
  return `${normalized}/messages`;
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

export const sendMessage = async (toUserId, text) => {
  const id = toUserId != null ? String(toUserId).trim() : "";
  if (!id || id === "undefined") {
    throw new Error("Alıcı bulunamadı. Sayfayı yenileyip tekrar deneyin.");
  }
  const response = await fetch(`${API_BASE}/send/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ text }),
  });
  return handleResponse(response);
};

export const getConversations = async () => {
  const response = await fetch(`${API_BASE}/conversations`, {
    credentials: "include",
  });
  return handleResponse(response);
};

export const getMessages = async (conversationId, page = 1) => {
  const response = await fetch(
    `${API_BASE}/conversations/${conversationId}/messages?page=${page}`,
    { credentials: "include" }
  );
  return handleResponse(response);
};

export const getIncomingMessageRequests = async () => {
  const response = await fetch(`${API_BASE}/requests/incoming`, {
    credentials: "include",
  });
  return handleResponse(response);
};

export const acceptMessageRequest = async (requestId) => {
  const response = await fetch(`${API_BASE}/requests/${requestId}/accept`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};

export const declineMessageRequest = async (requestId) => {
  const response = await fetch(`${API_BASE}/requests/${requestId}/decline`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
};
