import Message from "../../models/message_model.js";
import User from "../../models/user_model.js";
import Post from "../../models/post_model.js";
import { normalizeRequestBody } from "../../lib/normalizeRequestBody.js";
import {
  SHARE_PREVIEW,
  MAX_CHAT_ATTACHMENTS,
  MAX_CHAT_FILE_BYTES,
} from "./message.constants.js";

export const shapeOutgoingMessage = (m) => {
  if (!m) return null;
  return {
    ...m,
    read: m.readReceipt === true,
    delivered: m.deliveredAt != null,
  };
};

export const lastPreviewForMessage = (text, shareDoc, attachments) => {
  if (shareDoc?.kind === "post") return SHARE_PREVIEW.post;
  if (shareDoc?.kind === "profile") return SHARE_PREVIEW.profile;
  if (attachments?.length) {
    const imgs = attachments.filter((a) => a.kind === "image").length;
    const files = attachments.length - imgs;
    if (imgs && files) return `🖼️ ${imgs} fotoğraf, 📎 ${files} dosya`;
    if (imgs > 1) return `🖼️ ${imgs} fotoğraf`;
    if (imgs === 1) return "🖼️ Fotoğraf";
    if (files > 1) return `📎 ${files} dosya`;
    return "📎 Dosya";
  }
  return String(text || "").slice(0, 120);
};

const isAllowedAttachmentUrl = (url) => {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    return u.hostname.toLowerCase().includes("cloudinary.com");
  } catch {
    return false;
  }
};

export const validateAttachments = (raw) => {
  if (raw == null || raw === "") return { ok: true, attachments: [] };
  if (!Array.isArray(raw)) {
    return { ok: false, message: "Ekler geçersiz." };
  }
  if (raw.length > MAX_CHAT_ATTACHMENTS) {
    return { ok: false, message: "En fazla 5 ek eklenebilir." };
  }
  const out = [];
  for (const a of raw) {
    if (!a || typeof a !== "object") {
      return { ok: false, message: "Ekler geçersiz." };
    }
    const url = String(a.url || "").trim();
    if (!isAllowedAttachmentUrl(url)) {
      return { ok: false, message: "Geçersiz dosya adresi." };
    }
    const kind = a.kind === "file" ? "file" : "image";
    const mimeType = String(a.mimeType || "").slice(0, 128);
    const originalName = String(a.originalName || "dosya").slice(0, 200);
    const size = Number(a.size);
    if (Number.isFinite(size) && size > MAX_CHAT_FILE_BYTES) {
      return { ok: false, message: "Bir dosya en fazla 15 MB olabilir." };
    }
    out.push({
      url,
      kind,
      mimeType,
      originalName,
      size: Number.isFinite(size) && size >= 0 ? size : 0,
    });
  }
  return { ok: true, attachments: out };
};

export const pickAttachments = (body) => {
  const b = normalizeRequestBody(body);
  return b.attachments;
};

export const validateSharePayload = async (raw) => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: true, share: null };
  }
  let kind = raw.kind;
  if (kind == null || kind === "") {
    if (raw.postId != null && String(raw.postId).trim() !== "") {
      kind = "post";
    } else if (
      (raw.userId != null && String(raw.userId).trim() !== "") ||
      (raw.profileUser != null && String(raw.profileUser).trim() !== "")
    ) {
      kind = "profile";
    }
  }
  if (kind == null || kind === "") {
    return { ok: true, share: null };
  }
  kind = String(kind).toLowerCase().trim();
  if (kind === "post") {
    const postId = raw.postId ?? raw.post;
    if (postId == null || String(postId).trim() === "") {
      return { ok: false, status: 400, message: "Geçersiz gönderi." };
    }
    const post = await Post.findById(String(postId)).lean();
    if (!post) return { ok: false, status: 404, message: "Gönderi bulunamadı." };
    return { ok: true, share: { kind: "post", post: post._id } };
  }
  if (kind === "profile") {
    const profileUserId = raw.userId ?? raw.profileUser;
    if (profileUserId == null || String(profileUserId).trim() === "") {
      return { ok: false, status: 400, message: "Geçersiz profil." };
    }
    const u = await User.findById(String(profileUserId)).select("_id").lean();
    if (!u) return { ok: false, status: 404, message: "Kullanıcı bulunamadı." };
    return { ok: true, share: { kind: "profile", profileUser: u._id } };
  }
  return { ok: false, status: 400, message: "Geçersiz paylaşım." };
};

export const replyToPopulate = {
  path: "replyTo",
  select: "_id text sender share createdAt attachments",
  populate: [
    { path: "sender", select: "username profileImage fullname isAccountVerified" },
    {
      path: "share.post",
      select: "text img user createdAt",
      populate: { path: "user", select: "username profileImage fullname isAccountVerified" },
    },
    { path: "share.profileUser", select: "username profileImage fullname isAccountVerified bio" },
  ],
};

export const populateMessageOutgoing = async (msgId) => {
  const populated = await Message.findById(msgId)
    .populate("sender", "username profileImage fullname isAccountVerified")
    .populate({
      path: "share.post",
      select: "text img user createdAt",
      populate: { path: "user", select: "username profileImage fullname isAccountVerified" },
    })
    .populate("share.profileUser", "username profileImage fullname isAccountVerified bio")
    .populate({ path: "reactions.user", select: "username fullname" })
    .populate(replyToPopulate)
    .lean();
  if (!populated) return null;
  return shapeOutgoingMessage(populated);
};

export const messageQueryPopulate = [
  { path: "sender", select: "username profileImage fullname isAccountVerified" },
  {
    path: "share.post",
    select: "text img user createdAt",
    populate: { path: "user", select: "username profileImage fullname isAccountVerified" },
  },
  { path: "share.profileUser", select: "username profileImage fullname isAccountVerified bio" },
  { path: "reactions.user", select: "username fullname" },
  replyToPopulate,
];

export const sortParticipantIds = (a, b) => {
  const sa = a.toString();
  const sb = b.toString();
  return sa.localeCompare(sb);
};

export const participantKey = (a, b) => {
  const [x, y] = [a.toString(), b.toString()].sort();
  return `${x}_${y}`;
};

export const isMutualFollow = async (userIdA, userIdB) => {
  const [uA, uB] = await Promise.all([
    User.findById(userIdA).select("following"),
    User.findById(userIdB).select("following"),
  ]);
  if (!uA || !uB) return false;
  const followingA = uA.following || [];
  const followingB = uB.following || [];
  const aFollowsB = followingA.some((id) => id.toString() === userIdB.toString());
  const bFollowsA = followingB.some((id) => id.toString() === userIdA.toString());
  return aFollowsB && bFollowsA;
};

export const isEitherBlocked = (fromUser, toUser) => {
  const fromId = fromUser._id.toString();
  const toId = toUser._id.toString();
  const fromBlocked = fromUser.blockedUsers || [];
  const toBlocked = toUser.blockedUsers || [];
  if (fromBlocked.some((id) => id.toString() === toId)) return true;
  if (toBlocked.some((id) => id.toString() === fromId)) return true;
  return false;
};

export const pickShareInput = (body) => {
  const b = normalizeRequestBody(body);
  const nested = b.share ?? b.Share;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) return nested;
  if (b.postId != null && String(b.postId).trim() !== "") {
    return {
      kind:
        b.kind != null && String(b.kind).trim() !== ""
          ? String(b.kind).toLowerCase().trim()
          : "post",
      postId: b.postId,
    };
  }
  return undefined;
};

export const pickReplyToId = (body) => {
  const b = normalizeRequestBody(body);
  let raw = b.replyTo ?? b.replyToMessageId ?? b.quotedMessageId;
  if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
    raw = raw._id ?? raw.id ?? raw.$oid;
  }
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  return s || null;
};

export const validateReplyTo = async (replyToId, convId) => {
  if (!replyToId) return { ok: true, replyTo: null };
  const ref = await Message.findById(String(replyToId)).select("conversation").lean();
  if (!ref) {
    return { ok: false, status: 400, message: "Alıntılanan mesaj bulunamadı." };
  }
  if (ref.conversation.toString() !== convId.toString()) {
    return { ok: false, status: 400, message: "Alıntı bu sohbete ait olmalı." };
  }
  return { ok: true, replyTo: String(replyToId) };
};

export const buildReplySnapshot = async (replyToId) => {
  if (!replyToId) return null;
  const ref = await Message.findById(String(replyToId))
    .populate("sender", "username fullname")
    .lean();
  if (!ref) return null;
  const trimmed = String(ref.text || "")
    .replace(/\u2060/g, "")
    .trim();
  let preview = "";
  if (ref.attachments?.length) {
    const imgs = ref.attachments.filter((x) => x.kind === "image").length;
    const files = ref.attachments.length - imgs;
    if (imgs && files) preview = `🖼️ ${imgs} · 📎 ${files}`;
    else if (imgs > 1) preview = `🖼️ ${imgs} fotoğraf`;
    else if (imgs === 1) preview = "🖼️ Fotoğraf";
    else if (files > 1) preview = `📎 ${files} dosya`;
    else preview = "📎 Dosya";
  } else {
    preview = lastPreviewForMessage(trimmed, ref.share, ref.attachments);
  }
  if (!preview || !String(preview).trim()) {
    preview = "Mesaj";
  }
  const senderLabel = ref.sender?.fullname || ref.sender?.username || "…";
  return { senderLabel, preview };
};
