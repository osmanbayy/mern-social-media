import NotificationListItem from "./NotificationListItem";

export default function NotificationList({ notifications, onDeleteItem, deleteDisabled }) {
  return (
    <ul className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationListItem
          key={notification._id}
          notification={notification}
          onDelete={onDeleteItem}
          deleteDisabled={deleteDisabled}
        />
      ))}
    </ul>
  );
}
