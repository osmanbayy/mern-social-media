import User from "../../models/user_model.js";
import Notification from "../../models/notification_model.js";
import { emitToUser } from "../../lib/socket_emit.js";

export async function parseMentions(text, excludeUserId) {
  if (!text) return [];

  const mentionRegex = /@(\w+)/g;
  const matches = [...text.matchAll(mentionRegex)];
  const usernames = [...new Set(matches.map((match) => match[1]))];

  if (usernames.length === 0) return [];

  const users = await User.find({
    username: { $in: usernames },
    _id: { $ne: excludeUserId },
  }).select("_id");

  return users.map((user) => user._id);
}

export async function sendMentionNotifications(
  mentionedUserIds,
  fromUserId,
  postId,
  commentId = null,
  replyId = null
) {
  if (!mentionedUserIds || mentionedUserIds.length === 0) return;

  const notifications = mentionedUserIds.map((mentionedUserId) => ({
    from: fromUserId,
    to: mentionedUserId,
    type: "mention",
    post: postId,
    comment: commentId || replyId || undefined,
  }));

  try {
    const inserted = await Notification.insertMany(notifications);
    const ids = inserted.map((n) => n._id);
    const populated = await Notification.find({ _id: { $in: ids } })
      .populate("from", "username profileImage fullname")
      .populate("post", "_id");
    for (const n of populated) {
      emitToUser(n.to.toString(), "notification:new", n.toObject());
    }
  } catch (error) {
    console.log("Error creating mention notifications:", error.message);
  }
}
