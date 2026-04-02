import mongoose from "mongoose";
import User from "../../models/user_model.js";

/** Arama / öneri sorgularında hariç tutulacak engellenen kullanıcı ObjectId listesi */
export async function getBlockedExclusionObjectIds(userId) {
  const currentUser = await User.findById(userId);
  if (!currentUser) return null;

  const blockedByUsers = await User.find({ blockedUsers: userId }).select("_id");
  const blockedByUserIds = blockedByUsers.map((u) => u._id.toString());
  const blockedUserIds = currentUser.blockedUsers.map((id) => id.toString());

  const excludedObjectIds = [
    ...blockedUserIds.map((id) => new mongoose.Types.ObjectId(id)),
    ...blockedByUserIds.map((id) => new mongoose.Types.ObjectId(id)),
  ];

  return {
    currentUser,
    blockedUserIds,
    blockedByUserIds,
    excludedObjectIds,
  };
}
