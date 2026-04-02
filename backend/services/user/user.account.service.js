import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import User from "../../models/user_model.js";
import { ok, fail } from "../../lib/httpResult.js";
import { destroyCloudinaryImageByUrl } from "../../lib/cloudinaryPost.js";

export async function updateUserProfile({
  userId,
  fullname,
  email,
  username,
  currentPassword,
  newPassword,
  bio,
  link,
  profileImage,
  coverImg,
}) {
  const user = await User.findById(userId);
  if (!user) return fail(404, "Kullanıcı bulunamadı.");

  if ((!newPassword && currentPassword) || (newPassword && !currentPassword)) {
    return fail(400, "Eski ve yeni şifrenizi girin.");
  }

  if (newPassword && currentPassword) {
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return fail(400, "Eski şifrenizi kontrol edin.");
    if (newPassword.length < 6) {
      return fail(400, "Yeni şifreniz en az 6 karakter olmalıdır.");
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  }

  let nextProfileImage = profileImage;
  if (profileImage) {
    if (user.profileImage) await destroyCloudinaryImageByUrl(user.profileImage);
    const uploadedResponse = await cloudinary.uploader.upload(profileImage);
    nextProfileImage = uploadedResponse.secure_url;
  }

  let nextCoverImg = coverImg;
  if (coverImg) {
    if (user.coverImg) await destroyCloudinaryImageByUrl(user.coverImg);
    const uploadedResponse = await cloudinary.uploader.upload(coverImg);
    nextCoverImg = uploadedResponse.secure_url;
  }

  user.fullname = fullname || user.fullname;
  user.email = email || user.email;
  user.username = username || user.username;
  user.bio = bio || user.bio;
  user.link = link || user.link;
  if (nextProfileImage) user.profileImage = nextProfileImage;
  if (nextCoverImg) user.coverImg = nextCoverImg;

  await user.save();
  user.password = null;
  return ok(200, user);
}
