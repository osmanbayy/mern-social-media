import User from "../../models/user_model.js";
import Notification from "../../models/notification_model.js";
import { ok, fail } from "../../lib/httpResult.js";

export async function followUnfollow({ currentUserId, targetUserId }) {
  if (targetUserId === currentUserId.toString()) {
    return fail(400, "Kendinizi takip edemezsiniz.");
  }

  const userToModify = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!userToModify || !currentUser) {
    return fail(404, "Kullanıcı bulunamadı.");
  }

  const isFollowing = currentUser.following.some(
    (id) => id.toString() === targetUserId
  );

  if (isFollowing) {
    await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
    await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
    return ok(200, { message: "Kullanıcıyı artık takip etmiyorsunuz." });
  }

  await User.findByIdAndUpdate(targetUserId, { $push: { followers: currentUserId } });
  await User.findByIdAndUpdate(currentUserId, { $push: { following: targetUserId } });

  await new Notification({
    type: "follow",
    from: currentUserId,
    to: userToModify._id,
  }).save();

  return ok(200, { message: "Kullanıcıyı takip ediyorsunuz." });
}

export async function getFollowers({ username }) {
  const user = await User.findOne({ username }).populate("followers");
  if (!user) return fail(404, "Kullanıcı bulunamadı.");
  return ok(200, user.followers);
}

export async function getFollowing({ username }) {
  const user = await User.findOne({ username }).populate("following");
  if (!user) return fail(404, "Kullanıcı bulunamadı.");
  return ok(200, user.following);
}
