import Post from "../../models/post_model.js";
import User from "../../models/user_model.js";
import Notification from "../../models/notification_model.js";
import { ok, fail } from "../../lib/httpResult.js";
import { populateCommentsUser } from "./post.populate.js";

export async function likeUnlikePost({ userId, postId }) {
  const post = await Post.findById(postId);
  if (!post) {
    return fail(404, "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.");
  }

  const userLikedPost = post.likes.includes(userId);
  if (userLikedPost) {
    await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
    await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
    const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
    return ok(200, updatedLikes);
  }

  post.likes.push(userId);
  await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
  await post.save();

  await new Notification({
    from: userId,
    to: post.user,
    type: "like",
    post: postId,
  }).save();

  return ok(200, post.likes);
}

export async function saveUnsavePost({ userId, postId }) {
  const post = await Post.findById(postId);
  if (!post) {
    return fail(404, "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.");
  }

  const userSavedPost = post.saves.includes(userId);
  if (userSavedPost) {
    await Post.updateOne({ _id: postId }, { $pull: { saves: userId } });
    await User.updateOne({ _id: userId }, { $pull: { savedPosts: postId } });
    const updatedSaves = post.saves.filter((id) => id.toString() !== userId.toString());
    return ok(200, updatedSaves);
  }

  post.saves.push(userId);
  await User.updateOne({ _id: userId }, { $push: { savedPosts: postId } });
  await post.save();
  return ok(200, post.saves);
}

export async function getSavedPosts({ profileUserId }) {
  const user = await User.findById(profileUserId);
  if (!user) return fail(404, "Kullanıcı bulunamadı.");

  const savedPosts = await Post.find({ _id: { $in: user.savedPosts } })
    .populate({ path: "user", select: "-password" })
    .populate(populateCommentsUser);

  return ok(200, savedPosts);
}

export async function hidePost({ userId, postId }) {
  const post = await Post.findById(postId);
  if (!post) {
    return fail(404, "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.");
  }

  const user = await User.findById(userId);
  if (!user) return fail(404, "Kullanıcı bulunamadı.");

  const isAlreadyHidden = user.hiddenPosts.some((id) => id.toString() === postId.toString());
  if (isAlreadyHidden) {
    return fail(400, "Bu gönderi zaten gizli.");
  }

  user.hiddenPosts.push(postId);
  await user.save();
  return ok(200, { message: "Gönderi gizlendi." });
}

export async function unhidePost({ userId, postId }) {
  const user = await User.findById(userId);
  if (!user) return fail(404, "Kullanıcı bulunamadı.");

  user.hiddenPosts = user.hiddenPosts.filter((id) => id.toString() !== postId.toString());
  await user.save();
  return ok(200, { message: "Gönderi görünür hale getirildi." });
}

export async function getHiddenPosts({ profileUserId }) {
  const user = await User.findById(profileUserId);
  if (!user) return fail(404, "Kullanıcı bulunamadı.");

  const hiddenPosts = await Post.find({ _id: { $in: user.hiddenPosts } })
    .populate({ path: "user", select: "-password" })
    .populate(populateCommentsUser);

  return ok(200, hiddenPosts);
}

export async function pinUnpinPost({ userId, postId }) {
  const post = await Post.findById(postId);
  if (!post) return fail(404, "Gönderi bulunamadı.");

  if (post.user.toString() !== userId.toString()) {
    return fail(403, "Bu gönderiyi sabitleme yetkiniz yok.");
  }

  if (post.isPinned) {
    post.isPinned = false;
    await post.save();
    return ok(200, { message: "Gönderi sabitlemeden kaldırıldı.", post });
  }

  await Post.updateMany({ user: userId, isPinned: true }, { isPinned: false });
  post.isPinned = true;
  await post.save();
  return ok(200, { message: "Gönderi başa sabitlendi.", post });
}
