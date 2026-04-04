import { asyncHandler } from "../lib/asyncHandler.js";
import { sendServiceResult } from "../lib/controllerHttp.js";
import * as notificationOps from "../services/notification/notification.operations.js";

export const gel_all_notifications = asyncHandler("notification.list", async (req, res) => {
  const result = await notificationOps.listNotifications(req.user._id);
  return sendServiceResult(res, result);
});

export const delete_all_notifications = asyncHandler("notification.delete_all", async (req, res) => {
  const result = await notificationOps.deleteAllNotifications(req.user._id);
  return sendServiceResult(res, result);
});

export const delete_notification = asyncHandler("notification.delete_one", async (req, res) => {
  const result = await notificationOps.deleteNotification({
    userId: req.user._id,
    notificationId: req.params.id,
  });
  return sendServiceResult(res, result);
});
