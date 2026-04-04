import { normalizeRequestBody } from "../lib/normalizeRequestBody.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { sendServiceResult } from "../lib/controllerHttp.js";
import * as messageOps from "../services/message/message.operations.js";

export const send_message = asyncHandler("message.send_message", async (req, res) => {
  let incoming = normalizeRequestBody(req.body);
  if (Object.keys(incoming).length === 0 && req.rawBody && Buffer.byteLength(req.rawBody) > 0) {
    incoming = normalizeRequestBody(req.rawBody);
  }
  const result = await messageOps.sendMessage({
    fromUserId: req.user._id,
    toUserId: req.params.toUserId,
    incoming,
  });
  return sendServiceResult(res, result);
});

export const get_conversations = asyncHandler("message.get_conversations", async (req, res) => {
  const result = await messageOps.listConversations(req.user._id);
  return sendServiceResult(res, result);
});

export const get_messages = asyncHandler("message.get_messages", async (req, res) => {
  const result = await messageOps.listMessages({
    userId: req.user._id,
    conversationId: req.params.conversationId,
    page: req.query.page,
    limit: req.query.limit,
  });
  return sendServiceResult(res, result);
});

export const mark_conversation_read = asyncHandler("message.mark_conversation_read", async (req, res) => {
  const result = await messageOps.markConversationRead({
    userId: req.user._id,
    conversationId: req.params.conversationId,
  });
  return sendServiceResult(res, result);
});

export const ack_messages_delivered = asyncHandler("message.ack_messages_delivered", async (req, res) => {
  const result = await messageOps.ackMessagesDelivered({
    userId: req.user._id,
    conversationId: req.params.conversationId,
    body: req.body,
  });
  return sendServiceResult(res, result);
});

export const toggle_message_reaction = asyncHandler("message.toggle_message_reaction", async (req, res) => {
  const result = await messageOps.toggleMessageReaction({
    userId: req.user._id,
    conversationId: req.params.conversationId,
    messageId: req.params.messageId,
    body: req.body,
  });
  return sendServiceResult(res, result);
});

export const get_incoming_requests = asyncHandler("message.get_incoming_requests", async (req, res) => {
  const result = await messageOps.getIncomingRequests(req.user._id);
  return sendServiceResult(res, result);
});

export const accept_request = asyncHandler("message.accept_request", async (req, res) => {
  const result = await messageOps.acceptMessageRequest({
    userId: req.user._id,
    requestId: req.params.requestId,
  });
  return sendServiceResult(res, result);
});

export const edit_message = asyncHandler("message.edit_message", async (req, res) => {
  const result = await messageOps.editMessage({
    userId: req.user._id,
    conversationId: req.params.conversationId,
    messageId: req.params.messageId,
    body: req.body,
  });
  return sendServiceResult(res, result);
});

export const delete_message = asyncHandler("message.delete_message", async (req, res) => {
  const result = await messageOps.deleteMessage({
    userId: req.user._id,
    conversationId: req.params.conversationId,
    messageId: req.params.messageId,
  });
  return sendServiceResult(res, result);
});

export const delete_messages_bulk = asyncHandler("message.delete_messages_bulk", async (req, res) => {
  const result = await messageOps.deleteMessagesBulk({
    userId: req.user._id,
    conversationId: req.params.conversationId,
    body: req.body,
  });
  return sendServiceResult(res, result);
});

export const clear_conversation_messages = asyncHandler(
  "message.clear_conversation_messages",
  async (req, res) => {
    const result = await messageOps.clearConversationMessages({
      userId: req.user._id,
      conversationId: req.params.conversationId,
    });
    return sendServiceResult(res, result);
  }
);

export const decline_request = asyncHandler("message.decline_request", async (req, res) => {
  const result = await messageOps.declineMessageRequest({
    userId: req.user._id,
    requestId: req.params.requestId,
  });
  return sendServiceResult(res, result);
});
