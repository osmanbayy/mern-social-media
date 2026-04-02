import Conversation from "../models/conversation_model.js";
import Message from "../models/message_model.js";
import MessageRequest from "../models/message_request_model.js";
import User from "../models/user_model.js";
import Notification from "../models/notification_model.js";
import Post from "../models/post_model.js";
import { emitToUser } from "../lib/socket_emit.js";

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

const populateMessageOutgoing = async (msgId) => {
  const populated = await Message.findById(msgId)
    .populate("sender", "username profileImage fullname")
    .populate({
      path: "share.post",
      select: "text img user createdAt",
      populate: { path: "user", select: "username profileImage fullname" },
    })
    .populate("share.profileUser", "username profileImage fullname bio")
    .lean();
  if (!populated) return null;
  return { ...populated, read: populated.readReceipt === true };
};

const messageQueryPopulate = [
  { path: "sender", select: "username profileImage fullname" },
  {
    path: "share.post",
    select: "text img user createdAt",
    populate: { path: "user", select: "username profileImage fullname" },
  },
  { path: "share.profileUser", select: "username profileImage fullname bio" },
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

    const createMessageDoc = async (convId) =>
      Message.create({
        conversation: convId,
        sender: fromUserId,
        text: messageText,
        ...(shareDoc ? { share: shareDoc } : {}),
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
      conv.lastMessageAt = new Date();
      conv.lastMessagePreview = preview;
      await conv.save();

      const msg = await createMessageDoc(conv._id);
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

      const msg = await createMessageDoc(conv._id);
      return respondWithMessage(conv, msg);
    }

    // 3) Sohbet yok ve karşılıklı takip yok → mesaj isteği
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
          .select("_id username profileImage fullname")
          .lean();
        return {
          ...c,
          otherUser: other,
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

    const ordered = messages.reverse().map((m) => ({
      ...m,
      read: m.readReceipt === true,
    }));

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
