import mongoose from "mongoose";
import User from "../../models/user_model.js";

/** Akış/gönderi listelerinde kullanılan engelleme + gizli gönderi id'leri */
export async function getViewerBlockContext(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const blockedByUsers = await User.find({ blockedUsers: userId }).select("_id");
  const blockedByUserIds = blockedByUsers.map((u) => u._id.toString());
  const blockedUserIds = user.blockedUsers.map((id) => id.toString());
  const hiddenPostIds = user.hiddenPosts.map((id) => id.toString());

  const blockedObjectIds = [
    ...blockedUserIds.map((id) => new mongoose.Types.ObjectId(id)),
    ...blockedByUserIds.map((id) => new mongoose.Types.ObjectId(id)),
  ];

  return {
    user,
    blockedUserIds,
    blockedByUserIds,
    hiddenPostIds,
    blockedObjectIds,
  };
}
