import mongoose from "mongoose";

const messageRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      maxlength: 4000,
      trim: true,
      default: "",
    },
    share: {
      kind: {
        type: String,
        enum: ["post", "profile"],
      },
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
      profileUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

messageRequestSchema.index({ from: 1, to: 1, status: 1 });

messageRequestSchema.pre("validate", function (next) {
  const hasShare = this.share && this.share.kind;
  if (!hasShare && (!this.text || !String(this.text).trim())) {
    return next(new Error("Mesaj boş olamaz."));
  }
  if (hasShare && this.share.kind === "post" && !this.share.post) {
    return next(new Error("Paylaşılan gönderi gerekli."));
  }
  if (hasShare && this.share.kind === "profile" && !this.share.profileUser) {
    return next(new Error("Paylaşılan profil gerekli."));
  }
  next();
});

const MessageRequest = mongoose.model("MessageRequest", messageRequestSchema);
export default MessageRequest;
