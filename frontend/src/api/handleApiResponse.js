/** Sunucu gövde limiti (ör. 10 MB JSON) — backend ile uyumlu kullanıcı mesajı */
export const PAYLOAD_TOO_LARGE_MESSAGE =
  "Gönderdiğiniz veri veya dosya boyutu çok büyük. Daha küçük bir görsel veya dosya kullanın (sunucu limiti aşıldı).";

/**
 * fetch yanıtını işler; JSON bekler; 413 ve diğer hatalarda anlaşılır Error fırlatır.
 * @param {Response} response
 * @param {{ nonJsonFallback?: string }} [options]
 */
export async function handleApiResponse(response, options = {}) {
  const { nonJsonFallback = "Beklenmeyen bir hata oluştu." } = options;

  if (response.status === 413) {
    const contentType = response.headers.get("content-type") || "";
    let msg = PAYLOAD_TOO_LARGE_MESSAGE;
    if (contentType.includes("application/json")) {
      try {
        const data = await response.json();
        if (typeof data?.message === "string" && data.message.trim()) {
          msg = data.message;
        }
      } catch {
        /* sunucu HTML veya bozuk JSON döndürdüyse varsayılan mesaj */
      }
    }
    throw new Error(msg);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    const t = text.trim();
    if (t.startsWith("<!DOCTYPE") || t.startsWith("<html") || t.includes("<pre>")) {
      throw new Error(
        "API'ye ulaşılamadı (HTML yanıtı). Geliştirmede proxy ve VITE_API_BASE_URL'i kontrol edin."
      );
    }
    throw new Error(t.slice(0, 200) || nonJsonFallback);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || nonJsonFallback);
  }
  return data;
}
