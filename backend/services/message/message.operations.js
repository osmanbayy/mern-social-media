import Conversation from "../../models/conversation_model.js";
import Message from "../../models/message_model.js";
import MessageRequest from "../../models/message_request_model.js";
import User from "../../models/user_model.js";
import Notification from "../../models/notification_model.js";
import { emitToUser } from "../../lib/socket_emit.js";
import { isUserOnline } from "../../lib/presence.js";
import { ok, fail } from "../../lib/httpResult.js";
import { normalizeRequestBody } from "../../lib/normalizeRequestBody.js";
import {
  ALLOWED_REACTION_EMOJI,
  SHARE_TEXT_PLACEHOLDER,
} from "./message.constants.js";
import {
  shapeOutgoingMessage,
  lastPreviewForMessage,
  validateAttachments,
  pickAttachments,
  validateSharePayload,
  populateMessageOutgoing,
  messageQueryPopulate,
  sortParticipantIds,
  participantKey,
  isMutualFollow,
  isEitherBlocked,
  pickShareInput,
  pickReplyToId,
  validateReplyTo,
  buildReplySnapshot,
} from "./message.support.js";

export async function sendMessage({ fromUserId, toUserId, incoming }) {
  const replyToMessageId = pickReplyToId(incoming);
  const shareInput = pickShareInput(incoming);
  const text = incoming.text;

  if (!toUserId || toUserId === "undefined") {
    return fail(400, "Geçersiz alıcı.");
  }
  if (toUserId === fromUserId.toString()) {
    return fail(400, "Kendinize mesaj gönderemezsiniz.");
  }

  const shareResult = await validateSharePayload(shareInput);
  if (!shareResult.ok) {
    return fail(shareResult.status, shareResult.message);
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

  const attRes = validateAttachments(pickAttachments(incoming));
  if (!attRes.ok) {
    return fail(400, attRes.message);
  }
  const attachmentsDoc = attRes.attachments || [];

  if (shareDoc && attachmentsDoc.length > 0) {
    return fail(400, "Paylaşım ile dosya birlikte gönderilemez.");
  }

  if (!trimmed && !shareDoc && attachmentsDoc.length === 0) {
    if (hadShareIntent) {
      return fail(400, "Paylaşım doğrulanamadı.");
    }
    const emptyPayload = Object.keys(incoming).length === 0;
    return fail(400, "Mesaj boş olamaz.", {
      ...(emptyPayload && {
        hint:
          "Sunucu gövdeyi alamadı. POST ile Content-Type: application/json kullanın; örnek: {\"share\":{\"kind\":\"post\",\"postId\":\"...\"}}",
      }),
    });
  }

  const messageText =
    shareDoc && !trimmed
      ? SHARE_TEXT_PLACEHOLDER
      : trimmed
        ? trimmed.slice(0, 4000)
        : attachmentsDoc.length > 0
          ? SHARE_TEXT_PLACEHOLDER
          : "";

  const [toUser, fromUser] = await Promise.all([
    User.findById(toUserId),
    User.findById(fromUserId),
  ]);

  if (!toUser) {
    return fail(404, "Kullanıcı bulunamadı.");
  }

  if (isEitherBlocked(fromUser, toUser)) {
    return fail(403, "Bu kullanıcıya mesaj gönderemezsiniz.");
  }

  const preview = lastPreviewForMessage(trimmed, shareDoc, attachmentsDoc);
  const key = participantKey(fromUserId, toUserId);
  let conv = await Conversation.findOne({ participantKey: key });

  const createMessageDoc = async (convId, replyToRef, replySnapshotDoc) =>
    Message.create({
      conversation: convId,
      sender: fromUserId,
      text: messageText,
      ...(shareDoc ? { share: shareDoc } : {}),
      ...(attachmentsDoc.length ? { attachments: attachmentsDoc } : {}),
      ...(replyToRef ? { replyTo: replyToRef } : {}),
      ...(replySnapshotDoc ? { replySnapshot: replySnapshotDoc } : {}),
    });

  const emitNewMessage = (convLocal, msgOut) => {
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
  };

  const respondWithMessage = async (convLocal, msgDoc) => {
    const msgOut = await populateMessageOutgoing(msgDoc._id);
    if (!msgOut) {
      return fail(500, "Mesaj oluşturulamadı.");
    }
    emitNewMessage(convLocal, msgOut);
    return ok(201, { ...msgOut, conversationId: convLocal._id });
  };

  if (conv) {
    const replyRes = await validateReplyTo(replyToMessageId, conv._id);
    if (!replyRes.ok) {
      return fail(replyRes.status, replyRes.message);
    }
    const replySnap = replyRes.replyTo ? await buildReplySnapshot(replyRes.replyTo) : null;
    conv.lastMessageAt = new Date();
    conv.lastMessagePreview = preview;
    await conv.save();

    const msg = await createMessageDoc(conv._id, replyRes.replyTo, replySnap);
    return respondWithMessage(conv, msg);
  }

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
      return fail(replyRes.status, replyRes.message);
    }
    const replySnapNew = replyRes.replyTo ? await buildReplySnapshot(replyRes.replyTo) : null;

    const msg = await createMessageDoc(conv._id, replyRes.replyTo, replySnapNew);
    return respondWithMessage(conv, msg);
  }

  if (replyToMessageId) {
    return fail(400, "Mesaj isteği gönderilirken alıntı kullanılamaz.");
  }
  if (attachmentsDoc.length > 0) {
    return fail(400, "Mesaj isteğinde dosya gönderilemez.");
  }

  const existingPending = await MessageRequest.findOne({
    from: fromUserId,
    to: toUserId,
    status: "pending",
  });
  if (existingPending) {
    return fail(400, "Bu kullanıcıya zaten bekleyen bir mesaj isteğiniz var.");
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
    .populate("from", "username profileImage fullname isAccountVerified")
    .populate({
      path: "share.post",
      select: "text img user createdAt",
      populate: { path: "user", select: "username profileImage fullname isAccountVerified" },
    })
    .populate("share.profileUser", "username profileImage fullname bio isAccountVerified")
    .lean();

  emitToUser(toUserId, "message_request:new", { request: populatedReq });

  return ok(201, { request: populatedReq, pending: true });
}

export async function listConversations(userId) {
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

  return ok(200, populated);
}

export async function listMessages({ userId, conversationId, page = 1, limit: limitRaw }) {
  const limit = Math.min(parseInt(limitRaw, 10) || 30, 50);
  const skip = (page - 1) * limit;

  const conv = await Conversation.findById(conversationId);
  if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
    return fail(404, "Sohbet bulunamadı.");
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

  return ok(200, {
    messages: ordered,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    total,
  });
}

export async function markConversationRead({ userId, conversationId }) {
  const conv = await Conversation.findById(conversationId);
  if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
    return fail(404, "Sohbet bulunamadı.");
  }

  const peerId = conv.participants.find((p) => p.toString() !== userId.toString());
  if (!peerId) {
    return fail(400, "Geçersiz sohbet.");
  }

  const unread = await Message.find({
    conversation: conversationId,
    sender: peerId,
    readReceipt: { $ne: true },
  })
    .select("_id")
    .lean();

  if (unread.length === 0) {
    return ok(200, { ok: true, count: 0, messageIds: [] });
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

  return ok(200, { ok: true, count: unread.length, messageIds });
}

export async function ackMessagesDelivered({ userId, conversationId, body }) {
  const b = normalizeRequestBody(body);
  const rawIds = b.messageIds;
  if (!Array.isArray(rawIds) || rawIds.length === 0) {
    return fail(400, "messageIds gerekli.");
  }

  const conv = await Conversation.findById(conversationId);
  if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
    return fail(404, "Sohbet bulunamadı.");
  }
  const peerId = conv.participants.find((p) => p.toString() !== userId.toString());
  if (!peerId) {
    return fail(400, "Geçersiz sohbet.");
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

  return ok(200, { ok: true, messageIds });
}

export async function toggleMessageReaction({ userId, conversationId, messageId, body }) {
  const b = normalizeRequestBody(body);
  const emoji = b.emoji != null ? String(b.emoji).trim() : "";
  if (!ALLOWED_REACTION_EMOJI.has(emoji)) {
    return fail(400, "Geçersiz emoji.");
  }

  const conv = await Conversation.findById(conversationId);
  if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
    return fail(404, "Sohbet bulunamadı.");
  }

  const msg = await Message.findOne({
    _id: messageId,
    conversation: conversationId,
  });
  if (!msg) {
    return fail(404, "Mesaj bulunamadı.");
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
    return fail(500, "Mesaj güncellenemedi.");
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

  return ok(200, msgOut);
}

export async function getIncomingRequests(userId) {
  const requests = await MessageRequest.find({
    to: userId,
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .populate("from", "username profileImage fullname isAccountVerified")
    .populate({
      path: "share.post",
      select: "text img user createdAt",
      populate: { path: "user", select: "username profileImage fullname isAccountVerified" },
    })
    .populate("share.profileUser", "username profileImage fullname bio isAccountVerified")
    .lean();

  return ok(200, requests);
}

export async function acceptMessageRequest({ userId, requestId }) {
  const reqDoc = await MessageRequest.findById(requestId);
  if (!reqDoc || reqDoc.to.toString() !== userId.toString()) {
    return fail(404, "İstek bulunamadı.");
  }
  if (reqDoc.status !== "pending") {
    return fail(400, "Bu istek artık geçerli değil.");
  }

  const key = participantKey(reqDoc.from, reqDoc.to);
  let conv = await Conversation.findOne({ participantKey: key });
  const ids = [reqDoc.from, reqDoc.to].sort(sortParticipantIds);

  const preview = lastPreviewForMessage(reqDoc.text, reqDoc.share, []);

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
    return fail(500, "Mesaj oluşturulamadı.");
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

  return ok(200, { conversation: conv, message: msgOut });
}

export async function declineMessageRequest({ userId, requestId }) {
  const reqDoc = await MessageRequest.findById(requestId);
  if (!reqDoc || reqDoc.to.toString() !== userId.toString()) {
    return fail(404, "İstek bulunamadı.");
  }
  if (reqDoc.status !== "pending") {
    return fail(400, "Bu istek artık geçerli değil.");
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

  return ok(200, { message: "İstek reddedildi." });
}

export async function editMessage({ userId, conversationId, messageId, body }) {
  const b = normalizeRequestBody(body);
  const text = b.text != null ? String(b.text).trim() : "";

  if (!text) {
    return fail(400, "Mesaj boş olamaz.");
  }

  const conv = await Conversation.findById(conversationId);
  if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
    return fail(404, "Sohbet bulunamadı.");
  }

  const msg = await Message.findById(messageId);
  if (!msg) return fail(404, "Mesaj bulunamadı.");
  if (msg.conversation.toString() !== conversationId) {
    return fail(400, "Mesaj bu sohbete ait değil.");
  }
  if (msg.sender.toString() !== userId.toString()) {
    return fail(403, "Bu mesajı düzenleyemezsiniz.");
  }
  if (msg.share && msg.share.kind) {
    return fail(400, "Paylaşım mesajları düzenlenemez.");
  }

  msg.text = text.slice(0, 4000);
  msg.editedAt = new Date();
  await msg.save();

  const msgOut = await populateMessageOutgoing(msg._id);
  if (!msgOut) {
    return fail(500, "Mesaj kaydedilemedi.");
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

  return ok(200, msgOut);
}

export async function deleteMessage({ userId, conversationId, messageId }) {
  const conv = await Conversation.findById(conversationId);
  if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
    return fail(404, "Sohbet bulunamadı.");
  }
  const msg = await Message.findById(messageId);
  if (!msg) return fail(404, "Mesaj bulunamadı.");
  if (msg.conversation.toString() !== conversationId) {
    return fail(400, "Mesaj bu sohbete ait değil.");
  }
  if (msg.sender.toString() !== userId.toString()) {
    return fail(403, "Bu mesajı silemezsiniz.");
  }
  await Message.deleteOne({ _id: messageId });
  const peerId = conv.participants.find((p) => p.toString() !== userId.toString());
  const payload = {
    conversationId: String(conversationId),
    messageIds: [String(messageId)],
  };
  if (peerId) emitToUser(peerId.toString(), "message:deleted", payload);
  emitToUser(userId.toString(), "message:deleted", payload);
  return ok(200, { ok: true });
}

export async function deleteMessagesBulk({ userId, conversationId, body }) {
  const b = normalizeRequestBody(body);
  const raw = b.messageIds;
  if (!Array.isArray(raw) || raw.length === 0) {
    return fail(400, "messageIds gerekli.");
  }
  const ids = raw.map((x) => String(x).trim()).filter(Boolean);
  if (ids.length === 0) {
    return fail(400, "messageIds gerekli.");
  }
  const conv = await Conversation.findById(conversationId);
  if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
    return fail(404, "Sohbet bulunamadı.");
  }
  await Message.deleteMany({
    _id: { $in: ids },
    conversation: conversationId,
    sender: userId,
  });
  const peerId = conv.participants.find((p) => p.toString() !== userId.toString());
  const payload = {
    conversationId: String(conversationId),
    messageIds: ids.map(String),
  };
  if (peerId) emitToUser(peerId.toString(), "message:deleted", payload);
  emitToUser(userId.toString(), "message:deleted", payload);
  return ok(200, { ok: true, messageIds: payload.messageIds });
}

export async function clearConversationMessages({ userId, conversationId }) {
  const conv = await Conversation.findById(conversationId);
  if (!conv || !conv.participants.some((p) => p.toString() === userId.toString())) {
    return fail(404, "Sohbet bulunamadı.");
  }
  await Message.deleteMany({ conversation: conversationId });
  conv.lastMessagePreview = "Sohbet temizlendi";
  conv.lastMessageAt = new Date();
  await conv.save();
  const peerId = conv.participants.find((p) => p.toString() !== userId.toString());
  const payload = { conversationId: String(conversationId) };
  if (peerId) emitToUser(peerId.toString(), "conversation:cleared", payload);
  emitToUser(userId.toString(), "conversation:cleared", payload);
  return ok(200, { ok: true });
}
