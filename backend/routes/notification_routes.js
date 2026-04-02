import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  gel_all_notifications,
  delete_all_notifications,
  delete_notification,
} from "../controllers/notification_controller.js";
import * as nv from "../validators/notification.validators.js";

const router = express.Router();

router.get("/", protect_route, gel_all_notifications);
router.delete("/", protect_route, delete_all_notifications);
router.delete(
  "/:id",
  protect_route,
  ...nv.notificationIdParam,
  validateRequest,
  delete_notification
);

export default router;
