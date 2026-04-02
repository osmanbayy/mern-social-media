import User from "../../models/user_model.js";
import { ok, fail } from "../../lib/httpResult.js";
import { getBlockedExclusionObjectIds } from "./user.support.js";

export async function getSuggestedUsers({ userId, page = 1, limit = 5 }) {
  const p = parseInt(page, 10) || 1;
  const l = parseInt(limit, 10) || 5;

  const ctx = await getBlockedExclusionObjectIds(userId);
  if (!ctx) return fail(404, "Kullanıcı bulunamadı.");

  const { currentUser, excludedObjectIds } = ctx;
  const followingIds = currentUser.following.map((id) => id.toString());

  const totalUsers = await User.countDocuments({
    _id: { $ne: userId, $nin: excludedObjectIds },
  });
  const sampleSize = Math.min(100, totalUsers);

  if (sampleSize === 0) {
    return ok(200, { users: [], hasMore: false, page: p, limit: l });
  }

  const users = await User.aggregate([
    {
      $match: {
        _id: { $ne: userId, $nin: excludedObjectIds },
      },
    },
    { $sample: { size: sampleSize } },
  ]);

  const filteredUsers = users.filter(
    (u) => !followingIds.includes(u._id.toString())
  );

  const skip = (p - 1) * l;
  const suggestedUsers = filteredUsers.slice(skip, skip + l);
  suggestedUsers.forEach((u) => {
    u.password = null;
  });

  const hasMore = skip + suggestedUsers.length < filteredUsers.length;
  return ok(200, { users: suggestedUsers, hasMore, page: p, limit: l });
}

export async function searchUsers({ userId, query }) {
  if (!query || query.trim().length === 0) {
    return ok(200, []);
  }

  const ctx = await getBlockedExclusionObjectIds(userId);
  if (!ctx) return fail(404, "Kullanıcı bulunamadı.");

  const { blockedUserIds, blockedByUserIds } = ctx;
  const searchQuery = query.trim().toLowerCase();

  const users = await User.find({
    _id: {
      $ne: userId,
      $nin: [...blockedUserIds, ...blockedByUserIds],
    },
    $or: [
      { username: { $regex: searchQuery, $options: "i" } },
      { fullname: { $regex: searchQuery, $options: "i" } },
    ],
  })
    .select("username fullname profileImage")
    .limit(10);

  return ok(200, users);
}

export async function searchUsersPaginated({ userId, query, page = 1, limit = 5 }) {
  if (!query || query.trim().length === 0) {
    return ok(200, {
      users: [],
      hasMore: false,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  const ctx = await getBlockedExclusionObjectIds(userId);
  if (!ctx) return fail(404, "Kullanıcı bulunamadı.");

  const { blockedUserIds, blockedByUserIds } = ctx;
  const searchQuery = query.trim();
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const idFilter = {
    $ne: userId,
    $nin: [...blockedUserIds, ...blockedByUserIds],
  };

  const textOr = [
    { username: { $regex: searchQuery, $options: "i" } },
    { fullname: { $regex: searchQuery, $options: "i" } },
  ];

  const users = await User.find({ _id: idFilter, $or: textOr })
    .select("-password")
    .skip(skip)
    .limit(parseInt(limit, 10));

  const totalCount = await User.countDocuments({ _id: idFilter, $or: textOr });
  const hasMore = skip + users.length < totalCount;

  return ok(200, {
    users,
    hasMore,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total: totalCount,
  });
}
