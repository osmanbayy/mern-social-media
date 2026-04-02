import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
import {
  send_message,
  get_conversations,
  get_messages,
  mark_conversation_read,
  ack_messages_delivered,
  toggle_message_reaction,
  get_incoming_requests,
  accept_request,
  decline_request,
  edit_message,
} from "../controllers/message_controller.js";

const router = express.Router();

router.post("/send/:toUserId", protect_route, send_message);
router.get("/conversations", protect_route, get_conversations);
router.get("/conversations/:conversationId/messages", protect_route, get_messages);
router.patch(
  "/conversations/:conversationId/messages/:messageId",
  protect_route,
  edit_message
);
router.post("/conversations/:conversationId/read", protect_route, mark_conversation_read);
router.post(
  "/conversations/:conversationId/delivered",
  protect_route,
  ack_messages_delivered
);
router.post(
  "/conversations/:conversationId/messages/:messageId/reactions",
  protect_route,
  toggle_message_reaction
);
router.get("/requests/incoming", protect_route, get_incoming_requests);
router.post("/requests/:requestId/accept", protect_route, accept_request);
router.post("/requests/:requestId/decline", protect_route, decline_request);

export default router;
