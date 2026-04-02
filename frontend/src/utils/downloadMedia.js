/** Dosya adından güvenli isim üretir */
export function sanitizeFilename(name) {
  if (!name || typeof name !== "string") return "";
  const s = name.replace(/[/\\?%*:|"<>]/g, "").trim().slice(0, 180);
  return s || "dosya";
}

/**
 * Tarayıcıda dosyayı indirir. CORS uygunsa blob ile dosya adı korunur.
 * @returns {Promise<boolean>} `true`: blob ile indirme tetiklendi, `false`: yeni sekme (veya engel)
 * @param {string} url
 * @param {string} [suggestedName]
 */
export async function downloadMediaFile(url, suggestedName) {
  const href = String(url || "").trim();
  if (!href) throw new Error("Geçersiz adres.");

  const name = sanitizeFilename(suggestedName) || "dosya";

  try {
    const res = await fetch(href, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    requestAnimationFrame(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    });
    return true;
  } catch {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    requestAnimationFrame(() => {
      try {
        document.body.removeChild(a);
      } catch {
        /* ignore */
      }
    });
    return false;
  }
}
