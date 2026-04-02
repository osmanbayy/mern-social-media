import User from "../../models/user_model.js";
import { ok, fail } from "../../lib/httpResult.js";

export async function blockUser({ currentUserId, targetUserId }) {
  if (targetUserId === currentUserId.toString()) {
    return fail(400, "Kendinizi engelleyemezsiniz.");
  }

  const userToBlock = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!userToBlock || !currentUser) {
    return fail(404, "Kullanıcı bulunamadı.");
  }

  const isAlreadyBlocked = currentUser.blockedUsers.some(
    (blockedId) => blockedId.toString() === targetUserId
  );
  if (isAlreadyBlocked) {
    return fail(400, "Bu kullanıcı zaten engellenmiş.");
  }

  currentUser.blockedUsers.push(targetUserId);
  await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
  await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
  await currentUser.save();

  return ok(200, { message: "Kullanıcı engellendi." });
}

export async function unblockUser({ currentUserId, targetUserId }) {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) return fail(404, "Kullanıcı bulunamadı.");

  const isBlocked = currentUser.blockedUsers.some(
    (blockedId) => blockedId.toString() === targetUserId
  );
  if (!isBlocked) {
    return fail(400, "Bu kullanıcı engellenmemiş.");
  }

  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (blockedId) => blockedId.toString() !== targetUserId
  );
  await currentUser.save();

  return ok(200, { message: "Kullanıcının engeli kaldırıldı." });
}

export async function getBlockedUsers({ currentUserId }) {
  const currentUser = await User.findById(currentUserId).populate({
    path: "blockedUsers",
    select: "-password",
  });
  if (!currentUser) return fail(404, "Kullanıcı bulunamadı.");

  return ok(200, currentUser.blockedUsers || []);
}
