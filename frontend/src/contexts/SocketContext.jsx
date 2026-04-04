import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  invalidateConversations,
  invalidateKeys,
  invalidateMessagesForConversation,
  invalidateNotifications,
  invalidatePostsFeed,
} from "../utils/queryInvalidation";
import {
  QK_CONVERSATIONS,
  QK_MESSAGE_REQUESTS,
  QK_MESSAGES_PREFIX,
  QK_NOTIFICATIONS,
} from "../constants/queryKeys";
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

    s.on("notification:new", () => {
      invalidateNotifications(queryClient);
    });
    s.on("feed:new_post", () => {
      invalidatePostsFeed(queryClient);
    });
    s.on("message:new", () => {
      invalidateKeys(queryClient, [QK_CONVERSATIONS, QK_MESSAGES_PREFIX]);
    });
    s.on("message:edited", () => {
      invalidateKeys(queryClient, [QK_CONVERSATIONS, QK_MESSAGES_PREFIX]);
    });
    s.on("message:read", (payload) => {
      const { conversationId } = payload || {};
      if (!conversationId) return;
      /** Sunucudaki read alanı ile cache’i eşitle (setQueryData id eşleşmesi kaçırılabiliyordu) */
      invalidateMessagesForConversation(queryClient, conversationId);
    });
    s.on("message:delivered", (payload) => {
      const { conversationId } = payload || {};
      if (!conversationId) return;
      invalidateMessagesForConversation(queryClient, conversationId);
    });
    s.on("message:reaction", (payload) => {
      const { conversationId } = payload || {};
      if (!conversationId) return;
      invalidateMessagesForConversation(queryClient, conversationId);
    });
    s.on("message:deleted", (payload) => {
      const cid = payload?.conversationId;
      if (cid) {
        invalidateMessagesForConversation(queryClient, cid);
      }
      invalidateConversations(queryClient);
    });
    s.on("conversation:cleared", (payload) => {
      const cid = payload?.conversationId;
      if (cid) {
        invalidateMessagesForConversation(queryClient, cid);
      }
      invalidateConversations(queryClient);
    });
    s.on("conversations:updated", () => {
      invalidateConversations(queryClient);
    });
    s.on("message_request:new", () => {
      invalidateKeys(queryClient, [QK_MESSAGE_REQUESTS, QK_NOTIFICATIONS]);
    });
    s.on("message_request:accepted", () => {
      invalidateKeys(queryClient, [QK_CONVERSATIONS, QK_MESSAGES_PREFIX, QK_MESSAGE_REQUESTS]);
    });
    s.on("message_request:declined", () => {
      invalidateKeys(queryClient, [QK_MESSAGE_REQUESTS]);
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
