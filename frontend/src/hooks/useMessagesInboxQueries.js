import { useQuery } from "@tanstack/react-query";
import { getConversations, getIncomingMessageRequests } from "../api/messages";
import { QK_CONVERSATIONS, QK_MESSAGE_REQUESTS } from "../constants/queryKeys";

export function useMessagesInboxQueries() {
  const { data: conversations, isLoading } = useQuery({
    queryKey: QK_CONVERSATIONS,
    queryFn: getConversations,
  });

  const { data: requests } = useQuery({
    queryKey: QK_MESSAGE_REQUESTS,
    queryFn: getIncomingMessageRequests,
  });

  const requestCount = requests?.length ?? 0;

  return {
    conversations,
    isLoading,
    requests,
    requestCount,
  };
}
