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

const normalizeShareForApi = (s) => {
  if (!s || typeof s !== "object" || Array.isArray(s)) return null;
  let kind = s.kind;
  if (kind == null || kind === "") {
    if (s.postId != null && String(s.postId).trim() !== "") {
      kind = "post";
    } else if (
      (s.userId != null && String(s.userId).trim() !== "") ||
      (s.profileUser != null && String(s.profileUser).trim() !== "")
    ) {
      kind = "profile";
    }
  }
  if (kind == null || kind === "") return null;
  kind = String(kind).toLowerCase().trim();
  if (kind === "post") {
    const postId =
      s.postId != null && s.postId !== ""
        ? String(s.postId)
        : s.post != null && s.post !== ""
          ? String(s.post)
          : "";
    if (!postId) return null;
    return { kind: "post", postId };
  }
  if (kind === "profile") {
    const userId =
      s.userId != null && s.userId !== ""
        ? String(s.userId)
        : s.profileUser != null && s.profileUser !== ""
          ? String(s.profileUser)
          : "";
    if (!userId) return null;
    return { kind: "profile", userId };
  }
  return null;
};

/**
 * @param {string} toUserId
 * @param {string | { text?: string; share?: { kind: 'post' | 'profile'; postId?: string; userId?: string; post?: string; profileUser?: string } }} payload
 */
export const sendMessage = async (toUserId, payload = {}) => {
  const id = toUserId != null ? String(toUserId).trim() : "";
  if (!id || id === "undefined") {
    throw new Error("Alıcı bulunamadı. Sayfayı yenileyip tekrar deneyin.");
  }

  const opts =
    typeof payload === "string"
      ? { text: payload }
      : payload && typeof payload === "object"
        ? payload
        : {};

  const text = opts.text != null ? String(opts.text) : "";
  let rawShare = opts.share;
  if (rawShare != null && typeof rawShare === "object") {
    try {
      rawShare = JSON.parse(JSON.stringify(rawShare));
    } catch {
      /* yut */
    }
  }
  const share = normalizeShareForApi(rawShare);

  const hasShareObject = rawShare != null && typeof rawShare === "object";
  if (hasShareObject && !share) {
    throw new Error("Paylaşım bilgisi eksik veya geçersiz.");
  }
  if (!share && !text.trim()) {
    throw new Error("Mesaj boş olamaz.");
  }

  const replyTo =
    opts.replyTo != null && String(opts.replyTo).trim() !== "" ? String(opts.replyTo).trim() : null;

  /** Sunucu paylaşımda boş metin için \u2060 kullanır; isteğe text göndermeyebiliriz. replyTo kökte açıkça gider. */
  const replyFields = replyTo ? { replyTo, replyToMessageId: replyTo } : {};

  const body = share
    ? text.trim()
      ? { share, text, ...replyFields }
      : { share, ...replyFields }
    : { text, ...replyFields };

  const response = await fetch(`${API_BASE}/send/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
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

/** Karşı tarafın mesajlarını okundu işaretle; gönderene socket ile bildirilir */
export const editMessage = async (conversationId, messageId, { text }) => {
  const cid = conversationId != null ? String(conversationId).trim() : "";
  const mid = messageId != null ? String(messageId).trim() : "";
  if (!cid || !mid) {
    throw new Error("Geçersiz mesaj.");
  }
  const response = await fetch(
    `${API_BASE}/conversations/${encodeURIComponent(cid)}/messages/${encodeURIComponent(mid)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text: text != null ? String(text) : "" }),
    }
  );
  return handleResponse(response);
};

export const markConversationRead = async (conversationId) => {
  const response = await fetch(
    `${API_BASE}/conversations/${encodeURIComponent(conversationId)}/read`,
    { method: "POST", credentials: "include" }
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
