import express from "express";
import { get_me, login, logout, signup } from "../controllers/auth_controller.js";
import { protect_route } from "../middlewares/protect_route.js";

const router = express.Router();

router.get("/me", protect_route, get_me);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
