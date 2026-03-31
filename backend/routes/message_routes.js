import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
import {
  send_message,
  get_conversations,
  get_messages,
  get_incoming_requests,
  accept_request,
  decline_request,
} from "../controllers/message_controller.js";

const router = express.Router();

router.post("/send/:toUserId", protect_route, send_message);
router.get("/conversations", protect_route, get_conversations);
router.get("/conversations/:conversationId/messages", protect_route, get_messages);
router.get("/requests/incoming", protect_route, get_incoming_requests);
router.post("/requests/:requestId/accept", protect_route, accept_request);
router.post("/requests/:requestId/decline", protect_route, decline_request);

export default router;
