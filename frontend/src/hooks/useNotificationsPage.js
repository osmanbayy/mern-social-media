import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getNotifications,
  deleteAllNotifications,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationRequest,
} from "../api/notifications";
import { invalidateNotifications } from "../utils/queryInvalidation";

export function useNotificationsPage() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      invalidateNotifications(queryClient);
      toast.success("Bildirimler silindi");
    },
    onError: () => {
      toast.error("Bildirimler silinemedi");
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      invalidateNotifications(queryClient);
      toast.success("Tümü okundu olarak işaretlendi");
    },
    onError: () => {
      toast.error("İşlem yapılamadı");
    },
  });

  const deleteOneMutation = useMutation({
    mutationFn: deleteNotificationRequest,
    onSuccess: () => {
      invalidateNotifications(queryClient);
      toast.success("Bildirim silindi");
    },
    onError: () => {
      toast.error("Bildirim silinemedi");
    },
  });

  const notifications = notificationsQuery.data;
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return {
    notifications,
    isLoading: notificationsQuery.isLoading,
    unreadCount,
    markAllAsRead: markAllReadMutation.mutate,
    deleteAllNotifications: deleteAllMutation.mutate,
    deleteNotificationById: deleteOneMutation.mutate,
    isMarkingAllRead: markAllReadMutation.isPending,
    isDeletingAll: deleteAllMutation.isPending,
    isDeletingOne: deleteOneMutation.isPending,
  };
}
