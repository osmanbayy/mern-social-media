import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
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
  save_unsave_post,
  get_saved_posts,
  hide_post,
  unhide_post,
  get_hidden_posts
} from "../controllers/post_controller.js";

const router = express.Router();

router.get("/all", protect_route, get_all_posts);
router.get("/following", protect_route, get_following_posts);
router.get("/likes/:id", protect_route, get_liked_posts);
router.get("/user/:username", protect_route, get_user_posts);
router.post("/save/:id", protect_route, save_unsave_post);
router.get("/saved/:id", get_saved_posts);
router.post("/hide/:id", protect_route, hide_post);
router.delete("/hide/:id", protect_route, unhide_post);
router.get("/hidden/:id", protect_route, get_hidden_posts);
router.post("/create", protect_route, create_post);
router.put("/:id", protect_route, edit_post);
router.post("/like/:id", protect_route, like_unlike_post);
router.post("/comment/:id", protect_route, comment_on_post);
router.delete("/:id", protect_route, delete_post);

export default router;
