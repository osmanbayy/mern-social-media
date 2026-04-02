import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { messageSendLimiter, uploadLimiter } from "../middlewares/rateLimit.js";
import { paginationQueryValidators } from "../validators/post.validators.js";
import * as mv from "../validators/message.validators.js";
import {
  send_message,
  get_conversations,
  get_messages,
  mark_conversation_read,
  ack_messages_delivered,
  toggle_message_reaction,
  delete_message,
  delete_messages_bulk,
  clear_conversation_messages,
  get_incoming_requests,
  accept_request,
  decline_request,
  edit_message,
} from "../controllers/message_controller.js";
import { upload_chat_file } from "../controllers/upload_controller.js";

const router = express.Router();

router.post("/upload/chat", protect_route, uploadLimiter, upload_chat_file);

router.post(
  "/send/:toUserId",
  protect_route,
  messageSendLimiter,
  ...mv.toUserIdParam,
  validateRequest,
  send_message
);
router.get("/conversations", protect_route, get_conversations);
router.get(
  "/conversations/:conversationId/messages",
  protect_route,
  ...mv.conversationIdParam,
  ...paginationQueryValidators,
  validateRequest,
  get_messages
);
router.patch(
  "/conversations/:conversationId/messages/:messageId",
  protect_route,
  ...mv.conversationIdParam,
  ...mv.messageIdParam,
  validateRequest,
  edit_message
);
router.post(
  "/conversations/:conversationId/read",
  protect_route,
  ...mv.conversationIdParam,
  validateRequest,
  mark_conversation_read
);
router.post(
  "/conversations/:conversationId/delivered",
  protect_route,
  ...mv.conversationIdParam,
  validateRequest,
  ack_messages_delivered
);
router.post(
  "/conversations/:conversationId/messages/:messageId/reactions",
  protect_route,
  ...mv.conversationIdParam,
  ...mv.messageIdParam,
  validateRequest,
  toggle_message_reaction
);
router.delete(
  "/conversations/:conversationId/messages/:messageId",
  protect_route,
  ...mv.conversationIdParam,
  ...mv.messageIdParam,
  validateRequest,
  delete_message
);
router.post(
  "/conversations/:conversationId/messages/delete-many",
  protect_route,
  ...mv.conversationIdParam,
  validateRequest,
  delete_messages_bulk
);
router.delete(
  "/conversations/:conversationId/messages",
  protect_route,
  ...mv.conversationIdParam,
  validateRequest,
  clear_conversation_messages
);
router.get("/requests/incoming", protect_route, get_incoming_requests);
router.post(
  "/requests/:requestId/accept",
  protect_route,
  ...mv.requestIdParam,
  validateRequest,
  accept_request
);
router.post(
  "/requests/:requestId/decline",
  protect_route,
  ...mv.requestIdParam,
  validateRequest,
  decline_request
);

export default router;
