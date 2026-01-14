import Notification from "../models/notification_model.js";
import User from "../models/user_model.js";
import Post from "../models/post_model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

export const get_user_profile = async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user._id;

  try {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const user = await User.findOne({ username }).select("-password");
    if (!user)
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    // Check if current user is blocked by this user
    // If the profile owner has blocked the current user, they can't see the profile
    const isBlockedByUser = user.blockedUsers.some(
      (id) => id.toString() === currentUserId.toString()
    );
    
    if (isBlockedByUser) {
      return res.status(403).json({ message: "Bu profili görüntüleme yetkiniz yok." });
    }

    // Get post count for this user
    const postCount = await Post.countDocuments({ user: user._id });

    // Add post count to user object
    const userWithPostCount = {
      ...user.toObject(),
      postCount: postCount
    };

    res.status(200).json(userWithPostCount);
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const followingIds = currentUser.following.map(id => id.toString());
    
    // Get blocked user IDs (users who blocked current user)
    const blockedByUsers = await User.find({
      blockedUsers: userId
    }).select("_id");

    const blockedByUserIds = blockedByUsers.map(u => u._id.toString());
    
    // Also exclude users that current user has blocked
    const blockedUserIds = currentUser.blockedUsers.map(id => id.toString());
    
    // Get random sample of users (larger sample to account for filtering)
    // Get more users to ensure we have enough after filtering
    const totalUsers = await User.countDocuments({
      _id: { 
        $ne: userId,
        $nin: [...blockedUserIds, ...blockedByUserIds]
      },
    });
    const sampleSize = Math.min(100, totalUsers);

    if (sampleSize === 0) {
      return res.status(200).json({
        users: [],
        hasMore: false,
        page,
        limit,
      });
    }

    // Get random users (excluding blocked users)
    const users = await User.aggregate([
      {
        $match: {
          _id: { 
            $ne: userId,
            $nin: [...blockedUserIds.map(id => new mongoose.Types.ObjectId(id)), ...blockedByUserIds.map(id => new mongoose.Types.ObjectId(id))]
          },
        },
      },
      { $sample: { size: sampleSize } },
    ]);

    // Filter out users already being followed
    const filteredUsers = users.filter(
      (user) => !followingIds.includes(user._id.toString())
    );

    // Apply pagination
    const skip = (page - 1) * limit;
    const suggestedUsers = filteredUsers.slice(skip, skip + limit);

    suggestedUsers.forEach((user) => (user.password = null));
    
    const hasMore = skip + suggestedUsers.length < filteredUsers.length;
    
    res.status(200).json({
      users: suggestedUsers,
      hasMore,
      page,
      limit,
    });
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

// Search users for mentions (old version, kept for backward compatibility)
export const search_users = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length === 0) {
      return res.status(200).json([]);
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Get blocked user IDs (users who blocked current user)
    const blockedByUsers = await User.find({
      blockedUsers: userId
    }).select("_id");

    const blockedByUserIds = blockedByUsers.map(u => u._id.toString());
    
    // Also exclude users that current user has blocked
    const blockedUserIds = currentUser.blockedUsers.map(id => id.toString());

    const searchQuery = query.trim().toLowerCase();
    
    // Search by username or fullname (case insensitive)
    // Exclude: current user, users blocked by current user, users who blocked current user
    const users = await User.find({
      _id: { 
        $ne: userId,
        $nin: [...blockedUserIds, ...blockedByUserIds]
      },
      $or: [
        { username: { $regex: searchQuery, $options: "i" } },
        { fullname: { $regex: searchQuery, $options: "i" } }
      ]
    })
    .select("username fullname profileImage")
    .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in search users controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Search users with pagination
export const search_users_paginated = async (req, res) => {
  try {
    const { query, page = 1, limit = 5 } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length === 0) {
      return res.status(200).json({
        users: [],
        hasMore: false,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Get blocked user IDs (users who blocked current user)
    const blockedByUsers = await User.find({
      blockedUsers: userId
    }).select("_id");

    const blockedByUserIds = blockedByUsers.map(u => u._id.toString());
    
    // Also exclude users that current user has blocked
    const blockedUserIds = currentUser.blockedUsers.map(id => id.toString());

    const searchQuery = query.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Search by username or fullname (case insensitive)
    // Exclude: current user, users blocked by current user, users who blocked current user
    const users = await User.find({
      _id: { 
        $ne: userId,
        $nin: [...blockedUserIds, ...blockedByUserIds]
      },
      $or: [
        { username: { $regex: searchQuery, $options: "i" } },
        { fullname: { $regex: searchQuery, $options: "i" } }
      ]
    })
    .select("-password")
    .skip(skip)
    .limit(parseInt(limit));

    // Get total count for hasMore
    const totalCount = await User.countDocuments({
      _id: { 
        $ne: userId,
        $nin: [...blockedUserIds, ...blockedByUserIds]
      },
      $or: [
        { username: { $regex: searchQuery, $options: "i" } },
        { fullname: { $regex: searchQuery, $options: "i" } }
      ]
    });

    const hasMore = skip + users.length < totalCount;

    res.status(200).json({
      users,
      hasMore,
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalCount
    });
  } catch (error) {
    console.log("Error in search users paginated controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Block user
export const block_user = async (req, res) => {
  try {
    const { id } = req.params; // User to block
    const currentUserId = req.user._id;

    if (id === currentUserId.toString()) {
      return res.status(400).json({ message: "Kendinizi engelleyemezsiniz." });
    }

    const userToBlock = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!userToBlock || !currentUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Check if already blocked
    const isAlreadyBlocked = currentUser.blockedUsers.some(
      (blockedId) => blockedId.toString() === id
    );

    if (isAlreadyBlocked) {
      return res.status(400).json({ message: "Bu kullanıcı zaten engellenmiş." });
    }

    // Block the user
    currentUser.blockedUsers.push(id);
    
    // Remove from following/followers if exists
    await User.findByIdAndUpdate(currentUserId, { $pull: { following: id } });
    await User.findByIdAndUpdate(id, { $pull: { followers: currentUserId } });
    
    await currentUser.save();

    res.status(200).json({ message: "Kullanıcı engellendi." });
  } catch (error) {
    console.log("Error in block user controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Unblock user
export const unblock_user = async (req, res) => {
  try {
    const { id } = req.params; // User to unblock
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Check if user is blocked
    const isBlocked = currentUser.blockedUsers.some(
      (blockedId) => blockedId.toString() === id
    );

    if (!isBlocked) {
      return res.status(400).json({ message: "Bu kullanıcı engellenmemiş." });
    }

    // Unblock the user
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      (blockedId) => blockedId.toString() !== id
    );
    await currentUser.save();

    res.status(200).json({ message: "Kullanıcının engeli kaldırıldı." });
  } catch (error) {
    console.log("Error in unblock user controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get blocked users
export const get_blocked_users = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId).populate({
      path: "blockedUsers",
      select: "-password",
    });

    if (!currentUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    res.status(200).json(currentUser.blockedUsers || []);
  } catch (error) {
    console.log("Error in get blocked users controller", error.message);
    res.status(500).json({ message: error.message });
  }
};