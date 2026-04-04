import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getConversations,
  getMessages,
} from "../api/messages";
import { getUserByIdSummary } from "../api/users";
import { useAuth } from "../contexts/AuthContext";
import { buildChatTimeline } from "../utils/chatTimeline";
import { QK_CONVERSATIONS, qkMessages } from "../constants/queryKeys";

/**
 * Sohbet rotası: konuşma / compose eşlemesi, karşı taraf, mesaj sorgusu.
 */
export function useChatThread() {
  const { conversationId, userId: composePeerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuth();

  const isCompose = Boolean(composePeerId);
  const peerFromNav = location.state?.messagePeer;

  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: QK_CONVERSATIONS,
    queryFn: getConversations,
  });

  const conv = !isCompose
    ? conversations?.find((c) => String(c._id) === String(conversationId))
    : undefined;

  const needPeerFetch =
    !!isCompose &&
    !!composePeerId &&
    (!peerFromNav || String(peerFromNav._id) !== String(composePeerId));

  const { data: peerSummary, isLoading: loadingPeerSummary } = useQuery({
    queryKey: ["userByIdSummary", composePeerId],
    queryFn: () => getUserByIdSummary(composePeerId),
    enabled: needPeerFetch,
    retry: 1,
  });

  useEffect(() => {
    if (!isCompose || !composePeerId || !conversations?.length) return;
    const target = String(composePeerId);
    const existing = conversations.find((c) => {
      if (c.otherUser?._id && String(c.otherUser._id) === target) return true;
      return c.participants?.some((p) => String(p) === target);
    });
    if (existing) {
      navigate(`/messages/chat/${existing._id}`, { replace: true });
    }
  }, [isCompose, composePeerId, conversations, navigate]);

  const peerPlaceholder = useMemo(() => {
    if (!isCompose || !composePeerId) return null;
    return {
      _id: composePeerId,
      username: "…",
      fullname: "Kullanıcı",
      profileImage: null,
      online: false,
      lastSeen: null,
    };
  }, [isCompose, composePeerId]);

  const otherUser =
    conv?.otherUser ??
    (peerFromNav && String(peerFromNav._id) === String(composePeerId)
      ? peerFromNav
      : null) ??
    peerSummary ??
    peerPlaceholder;

  const peerId = useMemo(() => {
    if (isCompose && composePeerId) return composePeerId;
    if (!conv?.participants?.length || !authUser?._id) return null;
    const self = authUser._id.toString();
    const other = conv.participants.find((p) => p.toString() !== self);
    return other != null ? other.toString() : null;
  }, [isCompose, composePeerId, conv, authUser]);

  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: qkMessages(conversationId),
    queryFn: () => getMessages(conversationId, 1),
    enabled: !!conversationId && !isCompose,
  });

  const messages = messagesData?.messages || [];

  const timeline = useMemo(() => buildChatTimeline(messages), [messages]);

  const myId = authUser?._id?.toString();

  return {
    conversationId,
    composePeerId,
    navigate,
    isCompose,
    myId,
    loadingConversations,
    conversations,
    conv,
    needPeerFetch,
    loadingPeerSummary,
    otherUser,
    peerId,
    loadingMessages,
    messages,
    timeline,
  };
}
