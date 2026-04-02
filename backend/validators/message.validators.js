import { param } from "express-validator";

export const toUserIdParam = [
  param("toUserId").isMongoId().withMessage("Geçersiz alıcı ID."),
];

export const conversationIdParam = [
  param("conversationId").isMongoId().withMessage("Geçersiz konuşma ID."),
];

export const messageIdParam = [
  param("messageId").isMongoId().withMessage("Geçersiz mesaj ID."),
];

export const requestIdParam = [
  param("requestId").isMongoId().withMessage("Geçersiz istek ID."),
];
