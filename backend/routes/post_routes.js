import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { postWriteLimiter } from "../middlewares/rateLimit.js";
import {
  comment_on_post,
  create_post,
  delete_post,
  edit_post,
  like_unlike_post,
  get_all_posts,
  get_liked_posts,
  get_following_posts,
  get_user_posts,
  get_single_post,
  save_unsave_post,
  get_saved_posts,
  hide_post,
  unhide_post,
  get_hidden_posts,
  pin_unpin_post,
  like_unlike_comment,
  reply_to_comment,
  delete_comment,
  edit_comment,
  search_posts,
  get_posts_by_hashtag,
  retweet_post,
  quote_retweet,
  vote_poll,
} from "../controllers/post_controller.js";
import * as pv from "../validators/post.validators.js";

const router = express.Router();

router.get(
  "/all",
  protect_route,
  pv.paginationQueryValidators,
  validateRequest,
  get_all_posts
);
router.get(
  "/following",
  protect_route,
  pv.paginationQueryValidators,
  validateRequest,
  get_following_posts
);
router.get("/search", protect_route, pv.searchPostsValidators, validateRequest, search_posts);
router.get(
  "/hashtag/:tag",
  protect_route,
  pv.hashtagParamValidators,
  pv.paginationQueryValidators,
  validateRequest,
  get_posts_by_hashtag
);
router.post(
  "/create",
  protect_route,
  postWriteLimiter,
  pv.createPostValidators,
  validateRequest,
  pv.requirePostContent,
  create_post
);

router.get("/likes/:id", protect_route, pv.userProfileIdParam, validateRequest, get_liked_posts);
router.get("/user/:username", protect_route, pv.usernameParam, validateRequest, get_user_posts);
router.get("/saved/:id", pv.userProfileIdParam, validateRequest, get_saved_posts);
router.get("/hidden/:id", protect_route, pv.userProfileIdParam, validateRequest, get_hidden_posts);
router.post("/save/:id", protect_route, pv.postIdParam, validateRequest, save_unsave_post);
router.post("/hide/:id", protect_route, pv.postIdParam, validateRequest, hide_post);
router.post("/like/:id", protect_route, pv.postIdParam, validateRequest, like_unlike_post);
router.post(
  "/comment/:id",
  protect_route,
  postWriteLimiter,
  pv.commentValidators,
  validateRequest,
  comment_on_post
);
router.post("/pin/:id", protect_route, pv.postIdParam, validateRequest, pin_unpin_post);
router.post("/retweet/:id", protect_route, pv.postIdParam, validateRequest, retweet_post);
router.post(
  "/quote/:id",
  protect_route,
  postWriteLimiter,
  pv.quoteRetweetValidators,
  validateRequest,
  pv.requirePostContent,
  quote_retweet
);
router.delete("/hide/:id", protect_route, pv.postIdParam, validateRequest, unhide_post);

router.post(
  "/comment/:postId/:commentId/like",
  protect_route,
  pv.commentNestedValidators,
  validateRequest,
  like_unlike_comment
);
router.post(
  "/comment/:postId/:commentId/reply",
  protect_route,
  postWriteLimiter,
  pv.replyValidators,
  validateRequest,
  reply_to_comment
);
router.delete(
  "/comment/:postId/:commentId",
  protect_route,
  pv.commentNestedValidators,
  validateRequest,
  delete_comment
);
router.put(
  "/comment/:postId/:commentId",
  protect_route,
  postWriteLimiter,
  pv.editCommentValidators,
  validateRequest,
  edit_comment
);

router.post(
  "/:id/poll/vote",
  protect_route,
  postWriteLimiter,
  pv.votePollValidators,
  validateRequest,
  vote_poll
);

router.get("/:id", protect_route, pv.postIdParam, validateRequest, get_single_post);
router.put(
  "/:id",
  protect_route,
  postWriteLimiter,
  pv.editPostValidators,
  validateRequest,
  pv.requirePostContent,
  edit_post
);
router.delete("/:id", protect_route, pv.postIdParam, validateRequest, delete_post);

export default router;
