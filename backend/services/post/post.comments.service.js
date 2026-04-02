import Post from "../../models/post_model.js";
import Notification from "../../models/notification_model.js";
import { ok, fail } from "../../lib/httpResult.js";
import { parseMentions, sendMentionNotifications } from "./mention.service.js";
import { singlePostPopulate } from "./post.populate.js";

async function findPopulatedPost(postId) {
  return Post.findById(postId).populate(singlePostPopulate);
}

export async function commentOnPost({ userId, postId, text }) {
  if (!text) return fail(400, "Boş yorum yapılamaz.");

  const post = await Post.findById(postId);
  if (!post) {
    return fail(404, "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.");
  }

  const commentMentions = await parseMentions(text, userId);
  const comment = { user: userId, text, mentions: commentMentions };
  post.comments.push(comment);
  await post.save();

  if (post.user.toString() !== userId.toString()) {
    try {
      await new Notification({
        from: userId,
        to: post.user,
        type: "comment",
        post: postId,
      }).save();
    } catch (e) {
      console.log("Error creating comment notification:", e.message);
    }
  }

  const newComment = post.comments[post.comments.length - 1];
  await sendMentionNotifications(commentMentions, userId, postId, newComment._id);

  const populatedPost = await findPopulatedPost(postId);
  return ok(200, populatedPost);
}

export async function likeUnlikeComment({ userId, postId, commentId }) {
  const post = await Post.findById(postId);
  if (!post) return fail(404, "Gönderi bulunamadı.");

  const comment = post.comments.id(commentId);
  if (!comment) return fail(404, "Yorum bulunamadı.");

  const userLikedComment = comment.likes.some((id) => id.toString() === userId.toString());

  if (userLikedComment) {
    comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    comment.likes.push(userId);
    if (comment.user.toString() !== userId.toString()) {
      try {
        await new Notification({
          from: userId,
          to: comment.user,
          type: "like",
          post: postId,
          comment: commentId,
        }).save();
      } catch (e) {
        console.log("Error creating comment like notification:", e.message);
      }
    }
  }

  await post.save();
  const populatedPost = await findPopulatedPost(postId);
  return ok(200, populatedPost);
}

export async function replyToComment({ userId, postId, commentId, text }) {
  if (!text) return fail(400, "Boş yanıt yapılamaz.");

  const post = await Post.findById(postId);
  if (!post) return fail(404, "Gönderi bulunamadı.");

  const comment = post.comments.id(commentId);
  if (!comment) return fail(404, "Yorum bulunamadı.");

  const replyMentions = await parseMentions(text, userId);
  const reply = { user: userId, text, mentions: replyMentions };
  comment.replies.push(reply);
  await post.save();

  if (comment.user.toString() !== userId.toString()) {
    try {
      await new Notification({
        from: userId,
        to: comment.user,
        type: "comment",
        post: postId,
        comment: commentId,
      }).save();
    } catch (e) {
      console.log("Error creating reply notification:", e.message);
    }
  }

  const newReply = comment.replies[comment.replies.length - 1];
  await sendMentionNotifications(replyMentions, userId, postId, commentId, newReply._id);

  const populatedPost = await findPopulatedPost(postId);
  return ok(200, populatedPost);
}

export async function deleteComment({ userId, postId, commentId }) {
  const post = await Post.findById(postId);
  if (!post) return fail(404, "Gönderi bulunamadı.");

  const comment = post.comments.id(commentId);
  if (!comment) return fail(404, "Yorum bulunamadı.");

  const isCommentOwner = comment.user.toString() === userId.toString();
  const isPostOwner = post.user.toString() === userId.toString();
  if (!isCommentOwner && !isPostOwner) {
    return fail(403, "Bu yorumu silme yetkiniz yok.");
  }

  post.comments.pull(commentId);
  await post.save();

  const populatedPost = await findPopulatedPost(postId);
  return ok(200, populatedPost);
}

export async function editComment({ userId, postId, commentId, text }) {
  if (!text) return fail(400, "Boş yorum yapılamaz.");

  const post = await Post.findById(postId);
  if (!post) return fail(404, "Gönderi bulunamadı.");

  const comment = post.comments.id(commentId);
  if (!comment) return fail(404, "Yorum bulunamadı.");

  if (comment.user.toString() !== userId.toString()) {
    return fail(403, "Bu yorumu düzenleme yetkiniz yok.");
  }

  const commentMentions = await parseMentions(text, userId);
  comment.text = text;
  comment.mentions = commentMentions;
  await post.save();

  await sendMentionNotifications(commentMentions, userId, postId, commentId);

  const populatedPost = await findPopulatedPost(postId);
  return ok(200, populatedPost);
}
