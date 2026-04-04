import Post from "../../models/post_model.js";
import User from "../../models/user_model.js";
import { v2 as cloudinary } from "cloudinary";
import { ok, fail } from "../../lib/httpResult.js";
import { destroyCloudinaryImageByUrl } from "../../lib/cloudinaryPost.js";
import { parseMentions, sendMentionNotifications } from "./mention.service.js";
import { emitToUser } from "../../lib/socket_emit.js";

export async function createPost({ userId, text, img }) {
  const user = await User.findById(userId);
  if (!user) return fail(404, "Kullanıcı bulunamadı.");
  if (!text && !img) return fail(400, "Gönderiniz boş olamaz.");

  let imgUrl = img;
  if (img) {
    const uploadedResponse = await cloudinary.uploader.upload(img);
    imgUrl = uploadedResponse.secure_url;
  }

  const mentions = await parseMentions(text, userId);
  const newPost = new Post({
    user: userId,
    text,
    img: imgUrl,
    mentions,
  });
  await newPost.save();
  await sendMentionNotifications(mentions, userId, newPost._id);

  const populatedPost = await Post.findById(newPost._id)
    .populate("user", "username fullname profileImage isAccountVerified")
    .lean();

  const author = await User.findById(userId).select("followers");
  if (author?.followers?.length) {
    for (const fid of author.followers) {
      emitToUser(fid.toString(), "feed:new_post", { post: populatedPost });
    }
  }

  return ok(201, newPost);
}

export async function deletePost({ userId, postId }) {
  const post = await Post.findById(postId);
  if (!post) {
    return fail(404, "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.");
  }
  if (post.user.toString() !== userId.toString()) {
    return fail(401, "Gönderiyi silmek için giriş yapmalısınız.");
  }

  await destroyCloudinaryImageByUrl(post.img);

  const relatedPosts = await Post.find({ originalPost: postId });
  for (const relatedPost of relatedPosts) {
    await destroyCloudinaryImageByUrl(relatedPost.img);
  }

  if (relatedPosts.length > 0) {
    await Post.deleteMany({ originalPost: postId });
  }

  await Post.findByIdAndDelete(postId);
  return ok(200, { message: "Gönderi silindi." });
}

export async function editPost({ userId, postId, text, img }) {
  if (!text && !img) return fail(400, "Gönderiniz boş olamaz.");

  const post = await Post.findById(postId);
  if (!post) {
    return fail(404, "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.");
  }
  if (post.user.toString() !== userId.toString()) {
    return fail(401, "Gönderiyi düzenlemek için yetkiniz yok.");
  }

  let nextImg = post.img;
  if (img && img !== post.img) {
    if (post.img) {
      await destroyCloudinaryImageByUrl(post.img);
    }
    const uploadedResponse = await cloudinary.uploader.upload(img);
    nextImg = uploadedResponse.secure_url;
  }

  let mentions = post.mentions;
  if (text) {
    mentions = await parseMentions(text, userId);
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { text, img: nextImg, mentions },
    { new: true }
  )
    .populate({ path: "user", select: "-password" })
    .populate({ path: "comments.user", select: "-password" });

  if (
    text &&
    JSON.stringify(mentions.sort()) !==
      JSON.stringify(post.mentions.map((m) => m.toString()).sort())
  ) {
    await sendMentionNotifications(mentions, userId, postId);
  }

  return ok(200, updatedPost);
}
