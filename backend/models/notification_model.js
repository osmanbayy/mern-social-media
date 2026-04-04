import mongoose from "mongoose";
import { emitToUser } from "../lib/socket_emit.js";

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "follow",
        "like",
        "comment",
        "mention",
        "retweet",
        "quote_retweet",
        "message_request",
      ],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post.comments",
    },
    messageRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MessageRequest",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ to: 1, createdAt: -1 });
notificationSchema.index({ to: 1, read: 1 });

notificationSchema.post("save", async function (doc) {
  try {
    const Notification = mongoose.model("Notification");
    const populated = await Notification.findById(doc._id)
      .populate("from", "username profileImage fullname isAccountVerified")
      .populate("post", "_id")
      .populate("messageRequest");

    if (!populated) return;
    emitToUser(populated.to.toString(), "notification:new", populated.toObject());
  } catch (e) {
    console.log("notification socket emit:", e.message);
  }
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
