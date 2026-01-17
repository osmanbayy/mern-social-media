import mongoose, { mongo } from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        mentions: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        replies: [
          {
            text: {
              type: String,
              required: true,
            },
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            mentions: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
              },
            ],
            likes: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
              },
            ],
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    retweetedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    isQuoteRetweet: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
