import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      maxlength: 4000,
      trim: true,
      default: "",
    },
    /** Gönderi veya profil kartı */
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
    /** Karşı taraf okudu mu (görüldü). `read` Mongoose ile çakışabildiği için readReceipt */
    readReceipt: {
      type: Boolean,
      default: false,
    },
    /** Bu sohbetteki başka bir mesaja yanıt (alıntı) */
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    /** Alıntı önizlemesi (populate’a bağlı kalmadan karşı tarafta da görünsün) */
    replySnapshot: {
      senderLabel: { type: String, default: "" },
      preview: { type: String, default: "" },
    },
    /** Metin düzenlendiyse (sadece metin mesajları) */
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

messageSchema.pre("validate", function (next) {
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

const Message = mongoose.model("Message", messageSchema);
export default Message;
