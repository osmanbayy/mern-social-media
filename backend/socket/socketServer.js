import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../models/user_model.js";
import Conversation from "../models/conversation_model.js";
import { setIo, emitToUser } from "../lib/socket_emit.js";
import { setUserOnline, setUserOffline } from "../lib/presence.js";

const corsOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://onsekiz.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

/**
 * @param {import("http").Server} httpServer
 */
export const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
    path: "/socket.io",
  });

  io.use(async (socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie;
      if (!raw) {
        return next(new Error("auth"));
      }
      const parsed = cookie.parse(raw);
      const token = parsed.jwt;
      if (!token) {
        return next(new Error("auth"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return next(new Error("auth"));
      }
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch {
      next(new Error("auth"));
    }
  });

  const peerInConversation = async (conversationId, userId) => {
    if (!conversationId || !userId) return null;
    const conv = await Conversation.findById(conversationId).select("participants").lean();
    if (!conv?.participants?.length) return null;
    const uid = String(userId);
    if (!conv.participants.some((p) => p.toString() === uid)) return null;
    const other = conv.participants.find((p) => p.toString() !== uid);
    return other ? other.toString() : null;
  };

  io.on("connection", (socket) => {
    const uid = socket.userId;
    socket.join(`user:${uid}`);
    setUserOnline(uid);

    socket.on("chat:typing", async ({ conversationId } = {}) => {
      if (!conversationId) return;
      try {
        const peerId = await peerInConversation(conversationId, uid);
        if (peerId) {
          emitToUser(peerId, "chat:typing", {
            conversationId: String(conversationId),
            userId: uid,
          });
        }
      } catch {
        /* ignore */
      }
    });

    socket.on("chat:typing_stop", async ({ conversationId } = {}) => {
      if (!conversationId) return;
      try {
        const peerId = await peerInConversation(conversationId, uid);
        if (peerId) {
          emitToUser(peerId, "chat:typing_stop", {
            conversationId: String(conversationId),
            userId: uid,
          });
        }
      } catch {
        /* ignore */
      }
    });

    socket.on("disconnect", async () => {
      setUserOffline(uid);
      try {
        await User.updateOne({ _id: uid }, { $set: { lastSeen: new Date() } });
      } catch {
        /* ignore */
      }
    });
  });

  setIo(io);
  return io;
};
