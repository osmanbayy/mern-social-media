/** API `read` + şema `readReceipt` (geriye uyum) */
export function chatMessageIsRead(m) {
  return m.read === true || m.readReceipt === true;
}

export function chatMessageIsDelivered(m) {
  return m.delivered === true || (m.deliveredAt != null && m.deliveredAt !== "");
}

/** Gönderilen → iletildi → okundu (sadece kendi mesajlarımız) */
export function chatMessageDeliveryPhase(m) {
  if (chatMessageIsRead(m)) return "read";
  if (chatMessageIsDelivered(m)) return "delivered";
  return "sent";
}

export function chatSenderId(m) {
  return (
    (typeof m.sender === "object" && m.sender?._id) || m.sender?.toString?.() || String(m.sender)
  );
}

/** Sunucunun paylaşım-only mesajlarda kullandığı görünmez işaret (Word Joiner) */
export function chatVisibleMessageText(t) {
  if (t == null) return "";
  return String(t).replace(/\u2060/g, "").trim();
}
