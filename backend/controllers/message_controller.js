import Conversation from "../models/conversation_model.js";
import Message from "../models/message_model.js";
import MessageRequest from "../models/message_request_model.js";
import User from "../models/user_model.js";
import Notification from "../models/notification_model.js";
import Post from "../models/post_model.js";
import { emitToUser } from "../lib/socket_emit.js";
import { isUserOnline } from "../lib/presence.js";

const ALLOWED_REACTION_EMOJI = new Set(["👍", "❤️", "😂", "😮", "😢", "🙏"]);

const shapeOutgoingMessage = (m) => {
  if (!m) return null;
  return {
    ...m,
    read: m.readReceipt === true,
    delivered: m.deliveredAt != null,
  };
};

const SHARE_PREVIEW = {
  post: "Bir gönderi paylaştı",
  profile: "Bir profil paylaştı",
};

const lastPreviewForMessage = (text, shareDoc) => {
  if (shareDoc?.kind === "post") return SHARE_PREVIEW.post;
  if (shareDoc?.kind === "profile") return SHARE_PREVIEW.profile;
  return String(text || "").slice(0, 120);
};

/** İstemciden gelen share gövdesini doğrula; yoksa share: null */
const validateSharePayload = async (raw) => {
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

const replyToPopulate = {
  path: "replyTo",
  select: "_id text sender share createdAt",
  populate: [
    { path: "sender", select: "username profileImage fullname" },
    {
      path: "share.post",
      select: "text img user createdAt",
      populate: { path: "user", select: "username profileImage fullname" },
    },
    { path: "share.profileUser", select: "username profileImage fullname bio" },
  ],
};

const populateMessageOutgoing = async (msgId) => {
  const populated = await Message.findById(msgId)
    .populate("sender", "username profileImage fullname")
    .populate({
      path: "share.post",
      select: "text img user createdAt",
      populate: { path: "user", select: "username profileImage fullname" },
    })
    .populate("share.profileUser", "username profileImage fullname bio")
    .populate({ path: "reactions.user", select: "username fullname" })
    .populate(replyToPopulate)
    .lean();
  if (!populated) return null;
  return shapeOutgoingMessage(populated);
};

const messageQueryPopulate = [
  { path: "sender", select: "username profileImage fullname" },
  {
    path: "share.post",
    select: "text img user createdAt",
    populate: { path: "user", select: "username profileImage fullname" },
  },
  { path: "share.profileUser", select: "username profileImage fullname bio" },
  { path: "reactions.user", select: "username fullname" },
  replyToPopulate,
];

const sortParticipantIds = (a, b) => {
  const sa = a.toString();
  const sb = b.toString();
  return sa.localeCompare(sb);
};

const participantKey = (a, b) => {
  const [x, y] = [a.toString(), b.toString()].sort();
  return `${x}_${y}`;
};

const isMutualFollow = async (userIdA, userIdB) => {
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

const isEitherBlocked = (fromUser, toUser) => {
  const fromId = fromUser._id.toString();
  const toId = toUser._id.toString();
  const fromBlocked = fromUser.blockedUsers || [];
  const toBlocked = toUser.blockedUsers || [];
  if (fromBlocked.some((id) => id.toString() === toId)) return true;
  if (toBlocked.some((id) => id.toString() === fromId)) return true;
  return false;
};

/** Vercel / proxy bazen body'yi string veya Buffer verir; share düz kökte de gelebilir */
const normalizeRequestBody = (raw) => {
  if (raw == null) return {};
  if (Buffer.isBuffer(raw)) {
    try {
      const o = JSON.parse(raw.toString("utf8"));
      return o && typeof o === "object" && !Array.isArray(o) ? o : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === "string") {
    try {
      const o = JSON.parse(raw);
      return o && typeof o === "object" && !Array.isArray(o) ? o : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  return {};
};

const pickShareInput = (body) => {
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

const pickReplyToId = (body) => {
  const b = normalizeRequestBody(body);
  let raw = b.replyTo ?? b.replyToMessageId ?? b.quotedMessageId;
  if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
    raw = raw._id ?? raw.id ?? raw.$oid;
  }
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  return s || null;
};

/** Alıntı: referans mesaj aynı sohbette olmalı */
const validateReplyTo = async (replyToId, convId) => {
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

/** Alıntı balonunda gösterilecek metin + gönderen (DB’de saklanır) */
const buildReplySnapshot = async (replyToId) => {
  if (!replyToId) return null;
  const ref = await Message.findById(String(replyToId))
    .populate("sender", "username fullname")
    .lean();
  if (!ref) return null;
  const trimmed = String(ref.text || "")
    .replace(/\u2060/g, "")
    .trim();
  let preview = lastPreviewForMessage(trimmed, ref.share);
  if (!preview || !String(preview).trim()) {
    preview = "Mesaj";
  }
  const senderLabel = ref.sender?.fullname || ref.sender?.username || "…";
  return { senderLabel, preview };
};

export const send_message = async (req, res) => {
  try {
    let incoming = normalizeRequestBody(req.body);
    if (
      Object.keys(incoming).length === 0 &&
      req.rawBody &&
      Buffer.byteLength(req.rawBody) > 0
    ) {
      incoming = normalizeRequestBody(req.rawBody);
    }
    const replyToMessageId = pickReplyToId(incoming);
    const shareInput = pickShareInput(incoming);
    const text = incoming.text;
    const toUserId = req.params.toUserId;
    const fromUserId = req.user._id;

    if (!toUserId || toUserId === "undefined") {
      return res.status(400).json({ message: "Geçersiz alıcı." });
    }
    if (toUserId === fromUserId.toString()) {
      return res.status(400).json({ message: "Kendinize mesaj gönderemezsiniz." });
    }

    const shareResult = await validateSharePayload(shareInput);
    if (!shareResult.ok) {
      return res.status(shareResult.status).json({ message: shareResult.message });
    }
    const shareDoc = shareResult.share;

    const trimmed = text != null ? String(text).trim() : "";
    const hadShareIntent =
      (shareInput &&
        typeof shareInput === "object" &&
        !Array.isArray(shareInput) &&
        (shareInput.kind != null ||
          shareInput.postId != null ||
          shareInput.post != null ||
          shareInput.userId != null ||
          shareInput.profileUser != null)) ||
      (incoming.postId != null && String(incoming.postId).trim() !== "");

    if (!trimmed && !shareDoc) {
      if (hadShareIntent) {
        return res.status(400).json({ message: "Paylaşım doğrulanamadı." });
      }
      const emptyPayload = Object.keys(incoming).length === 0;
      return res.status(400).json({
        message: "Mesaj boş olamaz.",
        ...(emptyPayload && {
          hint:
            "Sunucu gövdeyi alamadı. POST ile Content-Type: application/json kullanın; örnek: {\"share\":{\"kind\":\"post\",\"postId\":\"...\"}}",
        }),
      });
    }

    /** Paylaşım + boş metin: şema/önizleme için görünmez işaret (UI'da gösterilmez) */
    const SHARE_TEXT_PLACEHOLDER = "\u2060";
    const messageText =
      shareDoc && !trimmed ? SHARE_TEXT_PLACEHOLDER : trimmed.slice(0, 4000);

    const [toUser, fromUser] = await Promise.all([
      User.findById(toUserId),
      User.findById(fromUserId),
    ]);

    if (!toUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    if (isEitherBlocked(fromUser, toUser)) {
      return res.status(403).json({ message: "Bu kullanıcıya mesaj gönderemezsiniz." });
    }

    const preview = lastPreviewForMessage(trimmed, shareDoc);

    const key = participantKey(fromUserId, toUserId);
    let conv = await Conversation.findOne({ participantKey: key });

    const createMessageDoc = async (convId, replyToRef, replySnapshotDoc) =>
      Message.create({
        conversation: convId,
        sender: fromUserId,
        text: messageText,
        ...(shareDoc ? { share: shareDoc } : {}),
        ...(replyToRef ? { replyTo: replyToRef } : {}),
        ...(replySnapshotDoc ? { replySnapshot: replySnapshotDoc } : {}),
      });

    const respondWithMessage = async (convLocal, msgDoc) => {
      const msgOut = await populateMessageOutgoing(msgDoc._id);
      if (!msgOut) {
        return res.status(500).json({ message: "Mesaj oluşturulamadı." });
      }
      const payload = {
        conversationId: convLocal._id.toString(),
        message: msgOut,
      };
      emitToUser(toUserId, "message:new", payload);
      emitToUser(fromUserId.toString(), "message:new", payload);
      emitToUser(toUserId, "conversations:updated", { conversationId: convLocal._id.toString() });
      emitToUser(fromUserId.toString(), "conversations:updated", {
        conversationId: convLocal._id.toString(),
      });
      return res.status(201).json({ ...msgOut, conversationId: convLocal._id });
    };

    // 1) Zaten açık sohbet varsa (ör. istek kabul edildikten sonra) karşılıklı takip olmasa da mesaj buraya gider
    if (conv) {
      const replyRes = await validateReplyTo(replyToMessageId, conv._id);
      if (!replyRes.ok) {
        return res.status(replyRes.status).json({ message: replyRes.message });
      }
      const replySnap = replyRes.replyTo ? await buildReplySnapshot(replyRes.replyTo) : null;
      conv.lastMessageAt = new Date();
      conv.lastMessagePreview = preview;
      await conv.save();

      const msg = await createMessageDoc(conv._id, replyRes.replyTo, replySnap);
      return respondWithMessage(conv, msg);
    }

    // 2) Henüz sohbet yok; karşılıklı takipte yeni sohbet açılır
    if (await isMutualFollow(fromUserId, toUserId)) {
      const ids = [fromUserId, toUserId].sort(sortParticipantIds);

      conv = await Conversation.create({
        participantKey: key,
        participants: ids,
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
      });

      const replyRes = await validateReplyTo(replyToMessageId, conv._id);
      if (!replyRes.ok) {
        await Conversation.deleteOne({ _id: conv._id });
        return res.status(replyRes.status).json({ message: replyRes.message });
      }
      const replySnapNew = replyRes.replyTo ? await buildReplySnapshot(replyRes.replyTo) : null;

      const msg = await createMessageDoc(conv._id, replyRes.replyTo, replySnapNew);
      return respondWithMessage(conv, msg);
    }

    // 3) Sohbet yok ve karşılıklı takip yok → mesaj isteği
    if (replyToMessageId) {
      return res.status(400).json({ message: "Mesaj isteği gönderilirken alıntı kullanılamaz." });
    }

    const existingPending = await MessageRequest.findOne({
      from: fromUserId,
      to: toUserId,
      status: "pending",
    });
    if (existingPending) {
      return res.status(400).json({
        message: "Bu kullanıcıya zaten bekleyen bir mesaj isteğiniz var.",
      });
    }

    const reqDoc = await MessageRequest.create({
      from: fromUserId,
      to: toUserId,
      text: messageText,
      ...(shareDoc ? { share: shareDoc } : {}),
    });

    await Notification.create({
      from: fromUserId,
      to: toUserId,
      type: "message_request",
      messageRequest: reqDoc._id,
    });

    const populatedReq = await MessageRequest.findById(reqDoc._id)
      .populate("from", "username profileImage fullname")
      .populate({
        path: "share.post",
        select: "text img user createdAt",
        populate: { path: "user", select: "username profileImage fullname" },
      })
      .populate("share.profileUser", "username profileImage fullname bio")
      .lean();

    emitToUser(toUserId, "message_request:new", { request: populatedReq });

    return res.status(201).json({ request: populatedReq, pending: true });
  } catch (error) {
    console.log("Error in send_message", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_conversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    const populated = await Promise.all(
      conversations.map(async (c) => {
        const otherId = c.participants.find((p) => p.toString() !== userId.toString());
        const other = await User.findById(otherId)
          .select("_id username profileImage fullname lastSeen")
          .lean();
        return {
          ...c,
          otherUser: other
            ? {
                ...other,
                online: isUserOnline(other._id),
              }
            : null,
        };
      })
    );

    res.status(200).json(populated);
  } catch (error) {
    console.log("Error in get_conversations", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_messages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 50);
    const skip = (page - 1) * limit;

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
      return res.status(404).json({ message: "Sohbet bulunamadı." });
    }

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(messageQueryPopulate)
        .lean(),
      Message.countDocuments({ conversation: conversationId }),
    ]);

    const ordered = messages.reverse().map((m) => shapeOutgoingMessage(m));

    res.status(200).json({
      messages: ordered,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (error) {
    console.log("Error in get_messages", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

/** Karşı tarafın gönderdiği okunmamış mesajları okundu işaretle; gönderene socket ile bildir */
export const mark_conversation_read = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
      return res.status(404).json({ message: "Sohbet bulunamadı." });
    }

    const peerId = conv.participants.find((p) => p.toString() !== userId.toString());
    if (!peerId) {
      return res.status(400).json({ message: "Geçersiz sohbet." });
    }

    /** Okunmamış = readReceipt doğru değil (şema: readReceipt) */
    const unread = await Message.find({
      conversation: conversationId,
      sender: peerId,
      readReceipt: { $ne: true },
    })
      .select("_id")
      .lean();

    if (unread.length === 0) {
      return res.status(200).json({ ok: true, count: 0, messageIds: [] });
    }

    await Message.updateMany(
      { _id: { $in: unread.map((m) => m._id) } },
      { $set: { readReceipt: true } }
    );

    const messageIds = unread.map((m) => m._id.toString());
    emitToUser(peerId.toString(), "message:read", {
      conversationId: String(conversationId),
      messageIds,
    });

    res.status(200).json({ ok: true, count: unread.length, messageIds });
  } catch (error) {
    console.log("Error in mark_conversation_read", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

/** Okuyucu, karşı tarafın mesajlarını cihazına aldı (iletildi); gönderene bildirilir */
export const ack_messages_delivered = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const b = normalizeRequestBody(req.body);
    const rawIds = b.messageIds;
    if (!Array.isArray(rawIds) || rawIds.length === 0) {
      return res.status(400).json({ message: "messageIds gerekli." });
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
      return res.status(404).json({ message: "Sohbet bulunamadı." });
    }
    const peerId = conv.participants.find((p) => p.toString() !== userId.toString());
    if (!peerId) {
      return res.status(400).json({ message: "Geçersiz sohbet." });
    }

    const ids = rawIds.map((x) => String(x).trim()).filter(Boolean);
    const now = new Date();
    await Message.updateMany(
      {
        _id: { $in: ids },
        conversation: conversationId,
        sender: peerId,
        deliveredAt: null,
      },
      { $set: { deliveredAt: now } }
    );

    const updated = await Message.find({
      _id: { $in: ids },
      conversation: conversationId,
      sender: peerId,
      deliveredAt: { $ne: null },
    })
      .select("_id")
      .lean();
    const messageIds = updated.map((m) => m._id.toString());

    if (messageIds.length > 0) {
      emitToUser(peerId.toString(), "message:delivered", {
        conversationId: String(conversationId),
        messageIds,
      });
    }

    res.status(200).json({ ok: true, messageIds });
  } catch (error) {
    console.log("Error in ack_messages_delivered", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const toggle_message_reaction = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.user._id;
    const b = normalizeRequestBody(req.body);
    const emoji = b.emoji != null ? String(b.emoji).trim() : "";
    if (!ALLOWED_REACTION_EMOJI.has(emoji)) {
      return res.status(400).json({ message: "Geçersiz emoji." });
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
      return res.status(404).json({ message: "Sohbet bulunamadı." });
    }

    const msg = await Message.findOne({
      _id: messageId,
      conversation: conversationId,
    });
    if (!msg) {
      return res.status(404).json({ message: "Mesaj bulunamadı." });
    }

    const list = msg.reactions || [];
    const idx = list.findIndex((r) => r.user.toString() === userId.toString());
    if (idx >= 0 && list[idx].emoji === emoji) {
      list.splice(idx, 1);
    } else {
      if (idx >= 0) list.splice(idx, 1);
      list.push({ user: userId, emoji });
    }
    msg.reactions = list;
    await msg.save();

    const msgOut = await populateMessageOutgoing(msg._id);
    if (!msgOut) {
      return res.status(500).json({ message: "Mesaj güncellenemedi." });
    }

    const peerId = conv.participants.find((p) => p.toString() !== userId.toString());
    if (peerId) {
      emitToUser(peerId.toString(), "message:reaction", {
        conversationId: String(conversationId),
        message: msgOut,
      });
    }
    emitToUser(userId.toString(), "message:reaction", {
      conversationId: String(conversationId),
      message: msgOut,
    });

    res.status(200).json(msgOut);
  } catch (error) {
    console.log("Error in toggle_message_reaction", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_incoming_requests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await MessageRequest.find({
      to: userId,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .populate("from", "username profileImage fullname")
      .populate({
        path: "share.post",
        select: "text img user createdAt",
        populate: { path: "user", select: "username profileImage fullname" },
      })
      .populate("share.profileUser", "username profileImage fullname bio")
      .lean();

    res.status(200).json(requests);
  } catch (error) {
    console.log("Error in get_incoming_requests", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const accept_request = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const reqDoc = await MessageRequest.findById(requestId);
    if (!reqDoc || reqDoc.to.toString() !== userId.toString()) {
      return res.status(404).json({ message: "İstek bulunamadı." });
    }
    if (reqDoc.status !== "pending") {
      return res.status(400).json({ message: "Bu istek artık geçerli değil." });
    }

    const key = participantKey(reqDoc.from, reqDoc.to);
    let conv = await Conversation.findOne({ participantKey: key });
    const ids = [reqDoc.from, reqDoc.to].sort(sortParticipantIds);

    const preview = lastPreviewForMessage(reqDoc.text, reqDoc.share);

    if (!conv) {
      conv = await Conversation.create({
        participantKey: key,
        participants: ids,
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
      });
    } else {
      conv.lastMessageAt = new Date();
      conv.lastMessagePreview = preview;
      await conv.save();
    }

    const msg = await Message.create({
      conversation: conv._id,
      sender: reqDoc.from,
      text: reqDoc.text,
      ...(reqDoc.share && reqDoc.share.kind
        ? {
            share: {
              kind: reqDoc.share.kind,
              post: reqDoc.share.post || undefined,
              profileUser: reqDoc.share.profileUser || undefined,
            },
          }
        : {}),
    });

    reqDoc.status = "accepted";
    await reqDoc.save();

    await Notification.deleteMany({
      type: "message_request",
      messageRequest: reqDoc._id,
    });

    const msgOut = await populateMessageOutgoing(msg._id);
    if (!msgOut) {
      return res.status(500).json({ message: "Mesaj oluşturulamadı." });
    }

    const payload = {
      conversationId: conv._id.toString(),
      message: msgOut,
    };

    emitToUser(reqDoc.from.toString(), "message_request:accepted", {
      conversationId: conv._id.toString(),
    });
    emitToUser(reqDoc.from.toString(), "message:new", payload);
    emitToUser(userId.toString(), "message:new", payload);
    emitToUser(reqDoc.from.toString(), "conversations:updated", {
      conversationId: conv._id.toString(),
    });
    emitToUser(userId.toString(), "conversations:updated", {
      conversationId: conv._id.toString(),
    });

    res.status(200).json({ conversation: conv, message: msgOut });
  } catch (error) {
    console.log("Error in accept_request", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const edit_message = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.user._id;
    const body = normalizeRequestBody(req.body);
    const text = body.text != null ? String(body.text).trim() : "";

    if (!text) {
      return res.status(400).json({ message: "Mesaj boş olamaz." });
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
      return res.status(404).json({ message: "Sohbet bulunamadı." });
    }

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Mesaj bulunamadı." });
    if (msg.conversation.toString() !== conversationId) {
      return res.status(400).json({ message: "Mesaj bu sohbete ait değil." });
    }
    if (msg.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bu mesajı düzenleyemezsiniz." });
    }
    if (msg.share && msg.share.kind) {
      return res.status(400).json({ message: "Paylaşım mesajları düzenlenemez." });
    }

    msg.text = text.slice(0, 4000);
    msg.editedAt = new Date();
    await msg.save();

    const msgOut = await populateMessageOutgoing(msg._id);
    if (!msgOut) {
      return res.status(500).json({ message: "Mesaj kaydedilemedi." });
    }

    const peerId = conv.participants.find((p) => p.toString() !== userId.toString());
    if (peerId) {
      emitToUser(peerId.toString(), "message:edited", {
        conversationId: String(conversationId),
        message: msgOut,
      });
    }
    emitToUser(userId.toString(), "message:edited", {
      conversationId: String(conversationId),
      message: msgOut,
    });

    res.status(200).json(msgOut);
  } catch (error) {
    console.log("Error in edit_message", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const decline_request = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const reqDoc = await MessageRequest.findById(requestId);
    if (!reqDoc || reqDoc.to.toString() !== userId.toString()) {
      return res.status(404).json({ message: "İstek bulunamadı." });
    }
    if (reqDoc.status !== "pending") {
      return res.status(400).json({ message: "Bu istek artık geçerli değil." });
    }

    reqDoc.status = "declined";
    await reqDoc.save();

    await Notification.deleteMany({
      type: "message_request",
      messageRequest: reqDoc._id,
    });

    emitToUser(reqDoc.from.toString(), "message_request:declined", {
      requestId: reqDoc._id.toString(),
    });

    res.status(200).json({ message: "İstek reddedildi." });
  } catch (error) {
    console.log("Error in decline_request", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};
