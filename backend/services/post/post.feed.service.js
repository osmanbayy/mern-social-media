import Post from "../../models/post_model.js";
import User from "../../models/user_model.js";
import { ok, fail } from "../../lib/httpResult.js";
import { getViewerBlockContext } from "./post.blocking.js";
import {
  standardPostPopulate,
  singlePostPopulate,
  populateCommentsUser,
} from "./post.populate.js";

export async function getAllPosts({ userId, page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const ctx = await getViewerBlockContext(userId);
  if (!ctx) return fail(404, "Kullanıcı bulunamadı.");
  const { hiddenPostIds, blockedObjectIds } = ctx;

  const totalPosts = await Post.countDocuments({
    _id: { $nin: hiddenPostIds },
    user: { $nin: blockedObjectIds },
  });

  const posts = await Post.find({
    _id: { $nin: hiddenPostIds },
    user: { $nin: blockedObjectIds },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(standardPostPopulate);

  const hasMore = skip + posts.length < totalPosts;
  return ok(200, { posts, hasMore, page, limit, total: totalPosts });
}

export async function getLikedPosts({ profileUserId }) {
  const user = await User.findById(profileUserId);
  if (!user) return fail(404, "Kullanıcı bulunamadı.");

  const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
    .populate({ path: "user", select: "-password" })
    .populate(populateCommentsUser);

  return ok(200, likedPosts);
}

export async function getFollowingPosts({ userId }) {
  const ctx = await getViewerBlockContext(userId);
  if (!ctx) return fail(404, "Kullanıcı bulunamadı.");
  const { user, hiddenPostIds, blockedUserIds, blockedByUserIds } = ctx;

  const followingFiltered = user.following.filter(
    (id) =>
      !blockedUserIds.includes(id.toString()) &&
      !blockedByUserIds.includes(id.toString())
  );

  const feedPosts = await Post.find({
    user: { $in: followingFiltered },
    _id: { $nin: hiddenPostIds },
  })
    .sort({ createdAt: -1 })
    .populate(standardPostPopulate);

  return ok(200, feedPosts);
}

export async function getSinglePost({ postId }) {
  if (!postId) return fail(400, "Post ID gerekli.");

  const post = await Post.findById(postId).populate(singlePostPopulate);

  if (!post) {
    return fail(404, "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.");
  }
  return ok(200, post);
}

export async function getUserPostsByUsername({ username }) {
  const user = await User.findOne({ username }).select("-password");
  if (!user) return fail(404, "Kullanıcı bulunamadı.");

  const posts = await Post.find({ user: user._id })
    .sort({ isPinned: -1, createdAt: -1 })
    .populate(standardPostPopulate);

  return ok(200, posts);
}

export async function searchPosts({ userId, query, page = 1, limit = 5 }) {
  if (!query || query.trim().length === 0) {
    return ok(200, {
      posts: [],
      hasMore: false,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  const ctx = await getViewerBlockContext(userId);
  if (!ctx) return fail(404, "Kullanıcı bulunamadı.");
  const { hiddenPostIds, blockedObjectIds } = ctx;

  const searchQuery = query.trim();
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const filter = {
    _id: { $nin: hiddenPostIds },
    user: { $nin: blockedObjectIds },
    $or: [{ text: { $regex: searchQuery, $options: "i" } }],
  };

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate({ path: "user", select: "-password" })
    .populate(populateCommentsUser);

  const totalCount = await Post.countDocuments(filter);
  const hasMore = skip + posts.length < totalCount;

  return ok(200, {
    posts,
    hasMore,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total: totalCount,
  });
}
