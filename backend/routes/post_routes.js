import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
import {
  comment_on_post,
  create_post,
  delete_post,
  like_unlike_post,
  get_all_posts,
  get_liked_posts,
  get_following_posts,
  get_user_posts,
  save_unsave_post,
  get_saved_posts
} from "../controllers/post_controller.js";

const router = express.Router();

router.get("/all", protect_route, get_all_posts);
router.get("/following", protect_route, get_following_posts);
router.get("/likes/:id", protect_route, get_liked_posts);
router.get("/user/:username", protect_route, get_user_posts);
router.post("/save/:id", protect_route, save_unsave_post);
router.get("/saved/:id", get_saved_posts);
router.post("/create", protect_route, create_post);
router.post("/like/:id", protect_route, like_unlike_post);
router.post("/comment/:id", protect_route, comment_on_post);
router.delete("/:id", protect_route, delete_post);

export default router;
