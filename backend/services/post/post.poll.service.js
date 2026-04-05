import Post from "../../models/post_model.js";
import { ok, fail } from "../../lib/httpResult.js";
import { standardPostPopulate } from "./post.populate.js";

export async function votePoll({ userId, postId, optionIndex }) {
  const post = await Post.findById(postId);
  if (!post) return fail(404, "Gönderiye ulaşılamıyor.");
  const opts = post.poll?.options;
  if (!Array.isArray(opts) || opts.length < 2) {
    return fail(400, "Bu gönderide anket yok.");
  }
  if (
    typeof optionIndex !== "number" ||
    !Number.isInteger(optionIndex) ||
    optionIndex < 0 ||
    optionIndex >= opts.length
  ) {
    return fail(400, "Geçersiz seçenek.");
  }

  const uid = userId.toString();
  for (const opt of opts) {
    opt.votes = (opt.votes || []).filter((v) => v.toString() !== uid);
  }
  opts[optionIndex].votes = opts[optionIndex].votes || [];
  opts[optionIndex].votes.push(userId);
  post.markModified("poll");
  await post.save();

  const updated = await Post.findById(postId).populate(standardPostPopulate);
  return ok(200, updated);
}
