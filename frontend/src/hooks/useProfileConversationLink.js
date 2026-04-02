import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getConversations } from "../api/messages";

/**
 * Profil sayfasında mesaj butonu: mevcut konuşma varsa chat id, yoksa yeni sohbet yolu.
 */
export function useProfileConversationLink({ authUser, isAccountVerified, isMyProfile, profileUser }) {
  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: !!authUser && !!isAccountVerified && !isMyProfile && !!profileUser?._id,
  });

  const conversationWithProfileUser = useMemo(() => {
    if (!conversations?.length || !profileUser?._id) return null;
    const target = String(profileUser._id);
    return (
      conversations.find((c) => {
        if (c.otherUser?._id && String(c.otherUser._id) === target) return true;
        return c.participants?.some((p) => String(p) === target);
      }) ?? null
    );
  }, [conversations, profileUser?._id]);

  const messageLinkTo = conversationWithProfileUser
    ? `/messages/chat/${conversationWithProfileUser._id}`
    : `/messages/chat/new/${profileUser?._id}`;

  const messageLinkState =
    !conversationWithProfileUser && profileUser
      ? {
          messagePeer: {
            _id: profileUser._id,
            username: profileUser.username,
            fullname: profileUser.fullname,
            profileImage: profileUser.profileImage,
          },
        }
      : undefined;

  return {
    loadingConversations,
    messageLinkTo,
    messageLinkState,
  };
}
