import Post from "../../models/post_model.js";
import User from "../../models/user_model.js";
import { v2 as cloudinary } from "cloudinary";
import { ok, fail } from "../../lib/httpResult.js";
import { destroyCloudinaryImageByUrl } from "../../lib/cloudinaryPost.js";
import { normalizeLocationInput, normalizePollInput } from "../../lib/postPollLocationNormalize.js";
import { parseMentions, sendMentionNotifications } from "./mention.service.js";
import { extractHashtagsFromText } from "../../lib/hashtags.js";
import { emitToUser } from "../../lib/socket_emit.js";

export async function createPost({ userId, text, img, poll: pollRaw, location: locationRaw }) {
  const user = await User.findById(userId);
  if (!user) return fail(404, "Kullanıcı bulunamadı.");

  const poll = normalizePollInput(pollRaw);
  const location = normalizeLocationInput(locationRaw);
  if (pollRaw != null && typeof pollRaw === "object" && !poll) {
    return fail(400, "Anket 2–4 geçerli seçenek içermelidir.");
  }
  if (locationRaw != null && typeof locationRaw === "object" && !location) {
    return fail(400, "Geçersiz konum bilgisi.");
  }

  const textStr = typeof text === "string" ? text : "";
  const hasText = textStr.trim().length > 0;
  const hasImg = typeof img === "string" && img.trim().length > 0;
  if (!hasText && !hasImg && !poll && !location) {
    return fail(400, "Gönderiniz boş olamaz.");
  }

  let imgUrl = img;
  if (img) {
    const uploadedResponse = await cloudinary.uploader.upload(img);
    imgUrl = uploadedResponse.secure_url;
  }

  const mentions = await parseMentions(textStr, userId);
  const hashtags = extractHashtagsFromText(textStr);
  const newPost = new Post({
    user: userId,
    text: textStr || undefined,
    img: imgUrl,
    mentions,
    hashtags,
    ...(poll ? { poll } : {}),
    ...(location ? { location } : {}),
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

export async function editPost({ userId, postId, text, img, location: locationBody, hasLocationField }) {
  const post = await Post.findById(postId);
  if (!post) {
    return fail(404, "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.");
  }
  if (post.user.toString() !== userId.toString()) {
    return fail(401, "Gönderiyi düzenlemek için yetkiniz yok.");
  }

  let nextLocation = post.location;
  if (hasLocationField) {
    if (locationBody === null) {
      nextLocation = null;
    } else {
      const n = normalizeLocationInput(locationBody);
      if (!n) {
        return fail(400, "Geçersiz konum bilgisi.");
      }
      nextLocation = n;
    }
  }

  let nextImg = post.img;
  if (img !== undefined) {
    const imgExplicitlyEmpty =
      img === "" || img === null || (typeof img === "string" && img.trim() === "");
    if (imgExplicitlyEmpty) {
      if (post.img) {
        await destroyCloudinaryImageByUrl(post.img);
      }
      nextImg = null;
    } else if (img !== post.img) {
      if (post.img) {
        await destroyCloudinaryImageByUrl(post.img);
      }
      const uploadedResponse = await cloudinary.uploader.upload(img);
      nextImg = uploadedResponse.secure_url;
    }
  }

  const resolvedTextForEmpty = typeof text === "string" ? text : post.text ?? "";
  const hasText = resolvedTextForEmpty.trim().length > 0;
  const hasImg = nextImg && String(nextImg).trim().length > 0;
  const hasPoll = Array.isArray(post.poll?.options) && post.poll.options.length >= 2;
  const hasLocName = Boolean(nextLocation?.name);
  if (!hasText && !hasImg && !hasPoll && !hasLocName) {
    return fail(400, "Gönderiniz boş olamaz.");
  }

  const resolvedText = typeof text === "string" ? text : post.text ?? "";

  let mentions = post.mentions;
  let hashtags = post.hashtags || [];
  if (text !== undefined) {
    mentions = await parseMentions(resolvedText, userId);
    hashtags = extractHashtagsFromText(resolvedText);
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { text: resolvedText, img: nextImg, mentions, hashtags, location: nextLocation },
    { new: true }
  )
    .populate({ path: "user", select: "-password" })
    .populate({ path: "comments.user", select: "-password" });

  if (
    resolvedText &&
    JSON.stringify(mentions.sort()) !==
      JSON.stringify(post.mentions.map((m) => m.toString()).sort())
  ) {
    await sendMentionNotifications(mentions, userId, postId);
  }

  return ok(200, updatedPost);
}
