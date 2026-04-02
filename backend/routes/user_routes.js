import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  get_user_profile,
  get_user_by_id_summary,
  follow_unfollow_user,
  get_suggested_users,
  update_user_profile,
  get_followers,
  get_following,
  search_users,
  search_users_paginated,
  block_user,
  unblock_user,
  get_blocked_users,
} from "../controllers/user_controller.js";
import * as uv from "../validators/user.validators.js";
import { paginationQueryValidators } from "../validators/post.validators.js";

const router = express.Router();

router.get(
  "/by-id/:id",
  protect_route,
  uv.userIdParam,
  validateRequest,
  get_user_by_id_summary
);
router.get(
  "/profile/:username",
  protect_route,
  uv.profileUsernameParam,
  validateRequest,
  get_user_profile
);
router.get(
  "/followers/:username",
  protect_route,
  uv.profileUsernameParam,
  validateRequest,
  get_followers
);
router.get(
  "/following/:username",
  protect_route,
  uv.profileUsernameParam,
  validateRequest,
  get_following
);
router.get(
  "/suggested",
  protect_route,
  paginationQueryValidators,
  validateRequest,
  get_suggested_users
);
router.get("/search", protect_route, uv.searchUsersValidators, validateRequest, search_users);
router.get(
  "/search/paginated",
  protect_route,
  uv.searchUsersPaginatedValidators,
  validateRequest,
  search_users_paginated
);
router.post("/follow/:id", protect_route, uv.userIdParam, validateRequest, follow_unfollow_user);
router.put("/update", protect_route, uv.updateProfileValidators, validateRequest, update_user_profile);
router.post("/block/:id", protect_route, uv.userIdParam, validateRequest, block_user);
router.post("/unblock/:id", protect_route, uv.userIdParam, validateRequest, unblock_user);
router.get("/blocked", protect_route, get_blocked_users);

export default router;
