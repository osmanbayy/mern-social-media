import { param } from "express-validator";

export const notificationIdParam = [
  param("id").isMongoId().withMessage("Geçersiz bildirim ID."),
];
