import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { invalidatePostsFeed } from "../utils/invalidatePostsFeed";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { isLoggedIn, isAccountVerified } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !isAccountVerified) {
      setSocket(null);
      return undefined;
    }

    const origin =
      import.meta.env.VITE_SOCKET_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    const s = io(origin, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    setSocket(s);

    const invalidate = (keys) => {
      keys.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
    };

    s.on("notification:new", () => {
      invalidate([["notifications"]]);
    });
    s.on("feed:new_post", () => {
      invalidatePostsFeed(queryClient);
    });
    s.on("message:new", () => {
      invalidate([["conversations"], ["messages"]]);
    });
    s.on("message:edited", () => {
      invalidate([["conversations"], ["messages"]]);
    });
    s.on("message:read", (payload) => {
      const { conversationId } = payload || {};
      if (!conversationId) return;
      const cid = String(conversationId);
      /** Sunucudaki read alanı ile cache’i eşitle (setQueryData id eşleşmesi kaçırılabiliyordu) */
      queryClient.invalidateQueries({ queryKey: ["messages", cid] });
    });
    s.on("message:delivered", (payload) => {
      const { conversationId } = payload || {};
      if (!conversationId) return;
      queryClient.invalidateQueries({ queryKey: ["messages", String(conversationId)] });
    });
    s.on("message:reaction", (payload) => {
      const { conversationId } = payload || {};
      if (!conversationId) return;
      queryClient.invalidateQueries({ queryKey: ["messages", String(conversationId)] });
    });
    s.on("message:deleted", (payload) => {
      const cid = payload?.conversationId;
      if (cid) {
        queryClient.invalidateQueries({ queryKey: ["messages", String(cid)] });
      }
      invalidate([["conversations"]]);
    });
    s.on("conversation:cleared", (payload) => {
      const cid = payload?.conversationId;
      if (cid) {
        queryClient.invalidateQueries({ queryKey: ["messages", String(cid)] });
      }
      invalidate([["conversations"]]);
    });
    s.on("conversations:updated", () => {
      invalidate([["conversations"]]);
    });
    s.on("message_request:new", () => {
      invalidate([["messageRequests"], ["notifications"]]);
    });
    s.on("message_request:accepted", () => {
      invalidate([["conversations"], ["messages"], ["messageRequests"]]);
    });
    s.on("message_request:declined", () => {
      invalidate([["messageRequests"]]);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [isLoggedIn, isAccountVerified, queryClient]);

  return (
    <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
  );
};
