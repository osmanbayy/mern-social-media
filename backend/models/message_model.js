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
    /** Alıcı mesajı cihazına aldı (iletildi); gönderen mesajında dolu */
    deliveredAt: {
      type: Date,
      default: null,
    },
    /** Yüklenen resim / dosya ekleri (Cloudinary URL) */
    attachments: [
      {
        url: { type: String, required: true },
        mimeType: { type: String, default: "" },
        originalName: { type: String, default: "" },
        size: { type: Number, default: 0 },
        kind: {
          type: String,
          enum: ["image", "file"],
          required: true,
        },
      },
    ],
    /** Kullanıcı başına tek emoji (yenisi eskisinin yerine geçer) */
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        emoji: {
          type: String,
          maxlength: 16,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

messageSchema.pre("validate", function (next) {
  const hasShare = this.share && this.share.kind;
  const hasAttachments = Array.isArray(this.attachments) && this.attachments.length > 0;
  if (!hasShare && !hasAttachments && (!this.text || !String(this.text).trim())) {
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
