import Notification from "../models/notification_model.js";
import User from "../models/user_model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const get_user_profile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user)
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in get user profile", error.message);
  }
};

export const follow_unfollow_user = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "Kendinizi takip edemezsiniz." });
    }

    if (!userToModify || !currentUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      // unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res
        .status(200)
        .json({ message: "Kullanıcıyı artık takip etmiyorsunuz." });
    } else {
      //follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // Send notification to user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();
      res.status(200).json({ message: "Kullanıcıyı takip ediyorsunuz." });
    }
  } catch (error) {
    console.log("Error in follow/unfollow user controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const get_suggested_users = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 10);

    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in get suggested users controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const update_user_profile = async (req, res) => {
  const { fullname, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImage, coverImg } = req.body;

  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    //* Update password
    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res.status(400).json({ message: "Eski ve yeni şifrenizi girin." });
    }

    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Eski şifrenizi kontrol edin." });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Yeni şifreniz en az 6 karakter olmalıdır." });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    //* Update profile image
    if (profileImage) {
      if (user.profileImage) {
        await cloudinary.uploader.destroy(
          user.profileImage.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImage);
      profileImage = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImage = profileImage || user.profileImage;
    user.coverImg = coverImg || user.coverImg;

    await user.save();

    user.password = null;
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in update user profile controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const get_followers = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate('followers');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.status(200).json(user.followers);
  } catch (error) {
    res.status(500).json({ message: 'Takipçiler alınırken hata oluştu.', error: error.message });
  }
};

export const get_following = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate('following');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.status(200).json(user.following);
  } catch (error) {
    res.status(500).json({ message: 'Takip edilenler alınırken hata oluştu.', error: error.message });
  }
};
