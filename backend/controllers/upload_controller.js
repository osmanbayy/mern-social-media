import { sendServiceResult } from "../lib/controllerHttp.js";
import * as uploadHandlers from "../services/upload/upload.handlers.js";

export const upload_image = async (req, res) => {
  try {
    const result = await uploadHandlers.handleProfileImageUpload(req, res);
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in upload image controller", error.message);
    res.status(500).json({ message: "Resim yüklenirken bir hata oluştu." });
  }
};

export const upload_chat_file = async (req, res) => {
  try {
    const result = await uploadHandlers.handleChatFileUpload(req, res);
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in upload_chat_file controller", error.message);
    res.status(500).json({ message: "Dosya yüklenirken bir hata oluştu." });
  }
};
