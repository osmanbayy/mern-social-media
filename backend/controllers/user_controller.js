import { asyncHandler } from "../lib/asyncHandler.js";
import { sendServiceResult } from "../lib/controllerHttp.js";
import * as userProfile from "../services/user/user.profile.service.js";
import * as userFollow from "../services/user/user.follow.service.js";
import * as userDiscovery from "../services/user/user.discovery.service.js";
import * as userAccount from "../services/user/user.account.service.js";
import * as userBlock from "../services/user/user.block.service.js";

const errMessage = (error, res) => {
  res.status(500).json({ message: error.message });
};

export const get_user_profile = asyncHandler(
  "user.get_user_profile",
  async (req, res) => {
    const result = await userProfile.getUserProfile({
      currentUserId: req.user._id,
      username: req.params.username,
    });
    return sendServiceResult(res, result);
  },
  { onError: errMessage }
);

export const get_user_by_id_summary = asyncHandler("user.get_user_by_id_summary", async (req, res) => {
  const result = await userProfile.getUserByIdSummary({
    currentUserId: req.user._id,
    targetUserId: req.params.id,
  });
  return sendServiceResult(res, result);
});

export const follow_unfollow_user = asyncHandler(
  "user.follow_unfollow_user",
  async (req, res) => {
    const result = await userFollow.followUnfollow({
      currentUserId: req.user._id,
      targetUserId: req.params.id,
    });
    return sendServiceResult(res, result);
  },
  { onError: errMessage }
);

export const get_suggested_users = asyncHandler(
  "user.get_suggested_users",
  async (req, res) => {
    const result = await userDiscovery.getSuggestedUsers({
      userId: req.user._id,
      page: req.query.page,
      limit: req.query.limit,
    });
    return sendServiceResult(res, result);
  },
  { onError: errMessage }
);

export const update_user_profile = asyncHandler(
  "user.update_user_profile",
  async (req, res) => {
    const { fullname, email, username, currentPassword, newPassword, bio, link, profileImage, coverImg } =
      req.body;
    const result = await userAccount.updateUserProfile({
      userId: req.user._id,
      fullname,
      email,
      username,
      currentPassword,
      newPassword,
      bio,
      link,
      profileImage,
      coverImg,
    });
    return sendServiceResult(res, result);
  },
  { onError: errMessage }
);

export const get_followers = asyncHandler(
  "user.get_followers",
  async (req, res) => {
    const result = await userFollow.getFollowers({ username: req.params.username });
    return sendServiceResult(res, result);
  },
  {
    onError: (error, res) => {
      res.status(500).json({
        message: "Takipçiler alınırken hata oluştu.",
        error: error.message,
      });
    },
  }
);

export const get_following = asyncHandler(
  "user.get_following",
  async (req, res) => {
    const result = await userFollow.getFollowing({ username: req.params.username });
    return sendServiceResult(res, result);
  },
  {
    onError: (error, res) => {
      res.status(500).json({
        message: "Takip edilenler alınırken hata oluştu.",
        error: error.message,
      });
    },
  }
);

export const search_users = asyncHandler("user.search_users", async (req, res) => {
  const result = await userDiscovery.searchUsers({
    userId: req.user._id,
    query: req.query.query,
  });
  return sendServiceResult(res, result);
});

export const search_users_paginated = asyncHandler("user.search_users_paginated", async (req, res) => {
  const result = await userDiscovery.searchUsersPaginated({
    userId: req.user._id,
    query: req.query.query,
    page: req.query.page,
    limit: req.query.limit,
  });
  return sendServiceResult(res, result);
});

export const block_user = asyncHandler(
  "user.block_user",
  async (req, res) => {
    const result = await userBlock.blockUser({
      currentUserId: req.user._id,
      targetUserId: req.params.id,
    });
    return sendServiceResult(res, result);
  },
  { onError: errMessage }
);

export const unblock_user = asyncHandler(
  "user.unblock_user",
  async (req, res) => {
    const result = await userBlock.unblockUser({
      currentUserId: req.user._id,
      targetUserId: req.params.id,
    });
    return sendServiceResult(res, result);
  },
  { onError: errMessage }
);

export const get_blocked_users = asyncHandler(
  "user.get_blocked_users",
  async (req, res) => {
    const result = await userBlock.getBlockedUsers({ currentUserId: req.user._id });
    return sendServiceResult(res, result);
  },
  { onError: errMessage }
);
