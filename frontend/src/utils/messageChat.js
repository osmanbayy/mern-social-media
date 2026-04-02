/** Mongoose / API mesaj nesnesinden tek bir id string üretir */
export function getMessageDocId(message) {
  if (message == null || typeof message !== "object") return null;
  const raw = message._id ?? message.id;
  if (raw == null || raw === "") return null;
  if (typeof raw === "object" && raw !== null && typeof raw.toString === "function") {
    const s = raw.toString();
    return s && s !== "[object Object]" ? s : null;
  }
  return String(raw);
}

/**
 * Gerçek bir alıntı var mı? Boş `replySnapshot: {}` truthy olduğu için tek başına kullanılmamalı.
 */
export function messageHasQuotedReply(m) {
  if (!m || typeof m !== "object") return false;
  const rt = m.replyTo;
  if (rt != null && rt !== "") {
    if (typeof rt === "object") {
      const keys = Object.keys(rt);
      if (keys.length === 0) return false;
      return !!(rt._id || rt.sender || rt.text != null || rt.share);
    }
    return String(rt).trim().length > 0;
  }
  const s = m.replySnapshot;
  if (!s || typeof s !== "object") return false;
  const hasPreview = String(s.preview ?? "").trim().length > 0;
  const hasSender = String(s.senderLabel ?? "").trim().length > 0;
  return hasPreview || hasSender;
}

/** @param {Record<string, unknown> | null | undefined} message */
export function getReplyPreviewText(message) {
  if (!message || typeof message !== "object") return "Mesaj";
  if (message.share?.kind === "post") return "Gönderi paylaşımı";
  if (message.share?.kind === "profile") return "Profil paylaşımı";
  const t = String(message.text ?? "")
    .replace(/\u2060/g, "")
    .trim();
  if (!t) return "Mesaj";
  return t.length > 100 ? `${t.slice(0, 100)}…` : t;
}

/** Metin veya paylaşımdan ilet için API gövdesi */
export function buildForwardPayload(message) {
  if (!message || typeof message !== "object") return null;
  if (message.share?.kind === "post") {
    const postId = message.share.post?._id ?? message.share.post;
    if (postId) return { share: { kind: "post", postId: String(postId) } };
  }
  if (message.share?.kind === "profile") {
    const uid = message.share.profileUser?._id ?? message.share.profileUser;
    if (uid) return { share: { kind: "profile", userId: String(uid) } };
  }
  const t = String(message.text ?? "")
    .replace(/\u2060/g, "")
    .trim();
  if (!t) return null;
  return { text: t };
}
