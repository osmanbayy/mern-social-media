import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
import { get_user_profile, follow_unfollow_user, get_suggested_users, update_user_profile, get_followers, get_following } from "../controllers/user_controller.js";

const router = express.Router();

router.get("/profile/:username", protect_route, get_user_profile);
router.get("/followers/:username", protect_route, get_followers);
router.get("/following/:username", protect_route, get_following);
router.get("/suggested", protect_route, get_suggested_users);
router.post("/follow/:id", protect_route, follow_unfollow_user);
router.post("/update", protect_route, update_user_profile);

export default router;
