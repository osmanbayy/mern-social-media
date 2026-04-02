/** Mesaj API kökü ile aynı — sohbet dosya yüklemesi /api/messages/upload/chat */
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
    const t = text.trim();
    if (t.startsWith("<!DOCTYPE") || t.startsWith("<html") || t.includes("<pre>")) {
      throw new Error(
        "API'ye ulaşılamadı (HTML yanıtı). Backend'i yeniden başlatın; geliştirmede proxy'yi kontrol edin."
      );
    }
    throw new Error(t.slice(0, 200) || "Beklenmeyen bir hata oluştu.");
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Bir hata oluştu.");
  }
  return data;
};

/**
 * Sohbet dosyası (resim, video, PDF, zip, metin) — Cloudinary
 * @returns {{ url: string, mimeType: string, originalName: string, size: number, kind: 'image'|'file' }}
 */
export const uploadChatFile = async (file) => {
  if (!file || !(file instanceof Blob)) {
    throw new Error("Dosya gerekli.");
  }
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_BASE}/upload/chat`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  return handleResponse(response);
};
