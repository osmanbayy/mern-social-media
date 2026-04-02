import mongoose from "mongoose";
import User from "../../models/user_model.js";
import Post from "../../models/post_model.js";
import { ok, fail } from "../../lib/httpResult.js";
import { isUserOnline } from "../../lib/presence.js";

export async function getUserProfile({ currentUserId, username }) {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) return fail(404, "Kullanıcı bulunamadı.");

  const user = await User.findOne({ username }).select("-password");
  if (!user) return fail(404, "Kullanıcı bulunamadı.");

  const isBlockedByUser = user.blockedUsers.some(
    (id) => id.toString() === currentUserId.toString()
  );
  if (isBlockedByUser) {
    return fail(403, "Bu profili görüntüleme yetkiniz yok.");
  }

  const postCount = await Post.countDocuments({ user: user._id });
  const userWithPostCount = { ...user.toObject(), postCount };
  return ok(200, userWithPostCount);
}

export async function getUserByIdSummary({ currentUserId, targetUserId }) {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return fail(400, "Geçersiz kullanıcı.");
  }
  if (targetUserId === currentUserId.toString()) {
    return fail(400, "Kendinize mesaj gönderemezsiniz.");
  }

  const user = await User.findById(targetUserId).select("-password");
  if (!user) return fail(404, "Kullanıcı bulunamadı.");

  const currentUser = await User.findById(currentUserId);
  if (!currentUser) return fail(404, "Kullanıcı bulunamadı.");

  const isBlockedByUser = user.blockedUsers.some(
    (x) => x.toString() === currentUserId.toString()
  );
  if (isBlockedByUser) {
    return fail(403, "Bu kullanıcıya mesaj gönderemezsiniz.");
  }

  const isBlockedByUs = currentUser.blockedUsers.some(
    (x) => x.toString() === targetUserId.toString()
  );
  if (isBlockedByUs) {
    return fail(403, "Bu kullanıcıya mesaj gönderemezsiniz.");
  }

  return ok(200, {
    _id: user._id,
    username: user.username,
    fullname: user.fullname,
    profileImage: user.profileImage,
    online: isUserOnline(targetUserId),
    lastSeen: user.lastSeen || null,
  });
}
