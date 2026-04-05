import { v2 as cloudinary } from "cloudinary";
import Post from "../../models/post_model.js";
import User from "../../models/user_model.js";
import Notification from "../../models/notification_model.js";
import { ok, fail } from "../../lib/httpResult.js";
import { emitToUser } from "../../lib/socket_emit.js";
import { normalizeLocationInput, normalizePollInput } from "../../lib/postPollLocationNormalize.js";
import { parseMentions, sendMentionNotifications } from "./mention.service.js";
import { standardPostPopulate } from "./post.populate.js";

export async function retweetPost({ userId, postId }) {
  const originalPost = await Post.findById(postId);
  if (!originalPost) return fail(404, "Gönderi bulunamadı.");

  const existingRetweet = await Post.findOne({
    user: userId,
    originalPost: postId,
    isQuoteRetweet: false,
  });

  if (existingRetweet) {
    await Post.findByIdAndDelete(existingRetweet._id);
    originalPost.retweetedBy = originalPost.retweetedBy.filter(
      (id) => id.toString() !== userId.toString()
    );
    await originalPost.save();
    return ok(200, { message: "Retweet geri alındı.", retweeted: false });
  }

  const retweetPostDoc = new Post({
    user: userId,
    originalPost: postId,
    isQuoteRetweet: false,
  });
  await retweetPostDoc.save();

  if (!originalPost.retweetedBy.some((id) => id.toString() === userId.toString())) {
    originalPost.retweetedBy.push(userId);
    await originalPost.save();
  }

  if (originalPost.user.toString() !== userId.toString()) {
    await Notification.findOneAndUpdate(
      {
        to: originalPost.user,
        type: "retweet",
        post: postId,
        from: userId,
      },
      {
        to: originalPost.user,
        type: "retweet",
        post: postId,
        from: userId,
        read: false,
      },
      { upsert: true, new: true }
    );
  }

  const populatedRetweet = await Post.findById(retweetPostDoc._id).populate(standardPostPopulate);

  const retweeter = await User.findById(userId).select("followers");
  if (retweeter?.followers?.length) {
    const payload = populatedRetweet.toObject
      ? populatedRetweet.toObject()
      : populatedRetweet;
    for (const fid of retweeter.followers) {
      emitToUser(fid.toString(), "feed:new_post", { post: payload });
    }
  }

  return ok(200, {
    message: "Gönderi retweet edildi.",
    retweeted: true,
    post: populatedRetweet,
  });
}

export async function quoteRetweet({ userId, postId, text, img, poll: pollRaw, location: locationRaw }) {
  const originalPost = await Post.findById(postId);
  if (!originalPost) return fail(404, "Gönderi bulunamadı.");

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
    return fail(400, "Alıntı metni, resim, anket veya konum gerekli.");
  }

  let nextImg = img;
  if (img) {
    const uploadedResponse = await cloudinary.uploader.upload(img);
    nextImg = uploadedResponse.secure_url;
  }

  const mentions = await parseMentions(textStr, userId);
  const quotePost = new Post({
    user: userId,
    text: textStr || undefined,
    img: nextImg,
    mentions,
    originalPost: postId,
    isQuoteRetweet: true,
    ...(poll ? { poll } : {}),
    ...(location ? { location } : {}),
  });
  await quotePost.save();

  if (!originalPost.retweetedBy.some((id) => id.toString() === userId.toString())) {
    originalPost.retweetedBy.push(userId);
    await originalPost.save();
  }

  await sendMentionNotifications(mentions, userId, quotePost._id);

  if (originalPost.user.toString() !== userId.toString()) {
    await Notification.findOneAndUpdate(
      {
        to: originalPost.user,
        type: "quote_retweet",
        post: postId,
        from: userId,
      },
      {
        to: originalPost.user,
        type: "quote_retweet",
        post: postId,
        from: userId,
        read: false,
      },
      { upsert: true, new: true }
    );
  }

  const populatedPost = await Post.findById(quotePost._id).populate(standardPostPopulate);

  const quoter = await User.findById(userId).select("followers");
  if (quoter?.followers?.length) {
    const payload = populatedPost.toObject ? populatedPost.toObject() : populatedPost;
    for (const fid of quoter.followers) {
      emitToUser(fid.toString(), "feed:new_post", { post: payload });
    }
  }

  return ok(201, populatedPost);
}
