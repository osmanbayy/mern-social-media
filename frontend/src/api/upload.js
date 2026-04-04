import { createJsonApiHandlers } from "./apiClient.js";

/** Mesaj API kökü ile aynı — sohbet dosya yüklemesi /api/messages/upload/chat */
const { API_BASE, handleResponse } = createJsonApiHandlers(
  "messages",
  "Beklenmeyen bir hata oluştu."
);

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
