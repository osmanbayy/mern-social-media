import { asyncHandler } from "../lib/asyncHandler.js";
import { sendServiceResult } from "../lib/controllerHttp.js";
import * as uploadHandlers from "../services/upload/upload.handlers.js";

export const upload_image = asyncHandler(
  "upload.upload_image",
  async (req, res) => {
    const result = await uploadHandlers.handleProfileImageUpload(req, res);
    return sendServiceResult(res, result);
  },
  {
    onError: (_error, res) => {
      res.status(500).json({ message: "Resim yüklenirken bir hata oluştu." });
    },
  }
);

export const upload_chat_file = asyncHandler(
  "upload.upload_chat_file",
  async (req, res) => {
    const result = await uploadHandlers.handleChatFileUpload(req, res);
    return sendServiceResult(res, result);
  },
  {
    onError: (_error, res) => {
      res.status(500).json({ message: "Dosya yüklenirken bir hata oluştu." });
    },
  }
);
