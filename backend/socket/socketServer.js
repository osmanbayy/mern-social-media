import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../models/user_model.js";
import { setIo } from "../lib/socket_emit.js";

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

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.on("disconnect", () => {});
  });

  setIo(io);
  return io;
};
