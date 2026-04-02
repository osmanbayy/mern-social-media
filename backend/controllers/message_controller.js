import { normalizeRequestBody } from "../lib/normalizeRequestBody.js";
import { sendServiceResult } from "../lib/controllerHttp.js";
import * as messageOps from "../services/message/message.operations.js";

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
    const result = await messageOps.sendMessage({
      fromUserId: req.user._id,
      toUserId: req.params.toUserId,
      incoming,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in send_message", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_conversations = async (req, res) => {
  try {
    const result = await messageOps.listConversations(req.user._id);
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in get_conversations", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_messages = async (req, res) => {
  try {
    const result = await messageOps.listMessages({
      userId: req.user._id,
      conversationId: req.params.conversationId,
      page: req.query.page,
      limit: req.query.limit,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in get_messages", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const mark_conversation_read = async (req, res) => {
  try {
    const result = await messageOps.markConversationRead({
      userId: req.user._id,
      conversationId: req.params.conversationId,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in mark_conversation_read", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const ack_messages_delivered = async (req, res) => {
  try {
    const result = await messageOps.ackMessagesDelivered({
      userId: req.user._id,
      conversationId: req.params.conversationId,
      body: req.body,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in ack_messages_delivered", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const toggle_message_reaction = async (req, res) => {
  try {
    const result = await messageOps.toggleMessageReaction({
      userId: req.user._id,
      conversationId: req.params.conversationId,
      messageId: req.params.messageId,
      body: req.body,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in toggle_message_reaction", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_incoming_requests = async (req, res) => {
  try {
    const result = await messageOps.getIncomingRequests(req.user._id);
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in get_incoming_requests", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const accept_request = async (req, res) => {
  try {
    const result = await messageOps.acceptMessageRequest({
      userId: req.user._id,
      requestId: req.params.requestId,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in accept_request", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const edit_message = async (req, res) => {
  try {
    const result = await messageOps.editMessage({
      userId: req.user._id,
      conversationId: req.params.conversationId,
      messageId: req.params.messageId,
      body: req.body,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in edit_message", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const delete_message = async (req, res) => {
  try {
    const result = await messageOps.deleteMessage({
      userId: req.user._id,
      conversationId: req.params.conversationId,
      messageId: req.params.messageId,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in delete_message", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const delete_messages_bulk = async (req, res) => {
  try {
    const result = await messageOps.deleteMessagesBulk({
      userId: req.user._id,
      conversationId: req.params.conversationId,
      body: req.body,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in delete_messages_bulk", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const clear_conversation_messages = async (req, res) => {
  try {
    const result = await messageOps.clearConversationMessages({
      userId: req.user._id,
      conversationId: req.params.conversationId,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in clear_conversation_messages", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const decline_request = async (req, res) => {
  try {
    const result = await messageOps.declineMessageRequest({
      userId: req.user._id,
      requestId: req.params.requestId,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in decline_request", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};
