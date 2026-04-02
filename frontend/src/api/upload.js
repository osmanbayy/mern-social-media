import { handleApiResponse } from "./handleApiResponse.js";

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

const handleResponse = (response) =>
  handleApiResponse(response, { nonJsonFallback: "Beklenmeyen bir hata oluştu." });

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
