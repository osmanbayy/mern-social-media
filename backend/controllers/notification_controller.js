import Notification from "../models/notification_model.js";

export const gel_all_notifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId })
      .populate({
        path: "from",
        select: "username profileImage fullname",
      })
      .populate({
        path: "post",
        select: "_id",
      })
      .sort({ createdAt: -1 }); // En yeni bildirimler en üste

    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in get notifications controller", error.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

export const delete_all_notifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Tüm bildirimler silindi." });
  } catch (error) {
    console.log(
      "Error in delete all notifications controller",
      error.message
    );
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

export const delete_notification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res
        .status(404)
        .json({ message: "Bildirim bulunamadı. Daha önce silinmiş olabilir." });
    }

    if (notification.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bu bildirimi silmek için yetkili değilsiniz." });
    }

    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Bildirim silindi." });
  } catch (error) {
    console.log("Error in delete notification controller", error.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
