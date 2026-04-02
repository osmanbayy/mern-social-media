import { sendServiceResult } from "../lib/controllerHttp.js";
import * as notificationOps from "../services/notification/notification.operations.js";

export const gel_all_notifications = async (req, res) => {
  try {
    const result = await notificationOps.listNotifications(req.user._id);
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in get notifications controller", error.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

export const delete_all_notifications = async (req, res) => {
  try {
    const result = await notificationOps.deleteAllNotifications(req.user._id);
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in delete all notifications controller", error.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

export const delete_notification = async (req, res) => {
  try {
    const result = await notificationOps.deleteNotification({
      userId: req.user._id,
      notificationId: req.params.id,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in delete notification controller", error.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
