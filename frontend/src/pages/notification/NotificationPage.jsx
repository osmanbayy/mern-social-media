import PageShell from "../../components/layout/PageShell";
import { NotificationListSkeleton } from "../../components/skeletons";
import NotificationEmptyState from "../../components/notifications/NotificationEmptyState";
import NotificationList from "../../components/notifications/NotificationList";
import NotificationPageHeader from "../../components/notifications/NotificationPageHeader";
import { useNotificationsPage } from "../../hooks/useNotificationsPage";

const NotificationPage = () => {
  const {
    notifications,
    isLoading,
    unreadCount,
    markAllAsRead,
    deleteAllNotifications,
    deleteNotificationById,
    isMarkingAllRead,
    isDeletingAll,
    isDeletingOne,
  } = useNotificationsPage();

  const hasItems = Boolean(notifications?.length);

  return (
    <PageShell variant="scroll">
      <NotificationPageHeader
        unreadCount={unreadCount}
        onMarkAllRead={markAllAsRead}
        onDeleteAll={deleteAllNotifications}
        isMarkingAllRead={isMarkingAllRead}
        isDeletingAll={isDeletingAll}
      />

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-5 sm:py-6">
        {isLoading && <NotificationListSkeleton />}

        {!isLoading && !hasItems && <NotificationEmptyState />}

        {!isLoading && hasItems && (
          <NotificationList
            notifications={notifications}
            onDeleteItem={deleteNotificationById}
            deleteDisabled={isDeletingOne}
          />
        )}
      </main>
    </PageShell>
  );
};

export default NotificationPage;
