import Notification from "../../models/notification_model.js";
import { ok, fail } from "../../lib/httpResult.js";

export async function listNotifications(userId) {
  const notifications = await Notification.find({ to: userId })
    .populate({
      path: "from",
      select: "username profileImage fullname isAccountVerified",
    })
    .populate({
      path: "post",
      select: "_id",
    })
    .populate({
      path: "messageRequest",
      select: "text status",
    })
    .sort({ createdAt: -1 });

  await Notification.updateMany({ to: userId }, { read: true });
  return ok(200, notifications);
}

export async function deleteAllNotifications(userId) {
  await Notification.deleteMany({ to: userId });
  return ok(200, { message: "Tüm bildirimler silindi." });
}

export async function deleteNotification({ userId, notificationId }) {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    return fail(404, "Bildirim bulunamadı. Daha önce silinmiş olabilir.");
  }

  if (notification.to.toString() !== userId.toString()) {
    return fail(403, "Bu bildirimi silmek için yetkili değilsiniz.");
  }

  await Notification.findByIdAndDelete(notificationId);
  return ok(200, { message: "Bildirim silindi." });
}
