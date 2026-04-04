import NotificationListSkeleton from "../../components/skeletons/NotificationListSkeleton";
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
    <div className="min-h-screen w-full bg-gradient-to-b from-base-200/35 via-base-100 to-base-100 pb-20 dark:from-base-300/15 lg:pb-0">
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
    </div>
  );
};

export default NotificationPage;
