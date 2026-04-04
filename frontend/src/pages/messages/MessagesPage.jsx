import { useNavigate } from "react-router-dom";
import { useMessagesInboxQueries } from "../../hooks/useMessagesInboxQueries";
import MessagesPageHeader from "../../components/messages/MessagesPageHeader";
import { MessagesListSkeleton } from "../../components/skeletons";
import MessagesEmptyState from "../../components/messages/MessagesEmptyState";
import ConversationList from "../../components/messages/ConversationList";

const MessagesPage = () => {
  const navigate = useNavigate();
  const { conversations, isLoading, requestCount } = useMessagesInboxQueries();

  const showEmpty = !isLoading && (!conversations || conversations.length === 0);
  const showList = !isLoading && conversations?.length > 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-base-200/40 via-base-100 to-base-100 dark:from-base-300/20">
      <MessagesPageHeader requestCount={requestCount} onBack={() => navigate(-1)} />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 py-4 sm:px-4 sm:py-6">
        {isLoading && <MessagesListSkeleton />}
        {showEmpty && <MessagesEmptyState />}
        {showList && <ConversationList conversations={conversations} />}
      </main>
    </div>
  );
};

export default MessagesPage;
