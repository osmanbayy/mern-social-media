import { v2 as cloudinary } from "cloudinary";
import { ok, fail } from "../../lib/httpResult.js";
import { profileImageUpload, chatFileUpload } from "../../lib/uploadMulter.js";

export async function handleProfileImageUpload(req, res) {
  return new Promise((resolve) => {
    profileImageUpload.single("image")(req, res, async (err) => {
      if (err) {
        resolve(fail(400, err.message));
        return;
      }
      if (!req.file) {
        resolve(fail(400, "Lütfen bir resim dosyası seçin."));
        return;
      }

      try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const uploadedResponse = await cloudinary.uploader.upload(dataURI, {
          folder: "social-media-app",
          resource_type: "auto",
        });

        resolve(
          ok(200, {
            imageUrl: uploadedResponse.secure_url,
            message: "Resim başarıyla yüklendi.",
          })
        );
      } catch (e) {
        console.log("Error in upload image", e.message);
        resolve(fail(500, "Resim yüklenirken bir hata oluştu."));
      }
    });
  });
}

export async function handleChatFileUpload(req, res) {
  return new Promise((resolve) => {
    chatFileUpload.single("file")(req, res, async (err) => {
      if (err) {
        resolve(fail(400, err.message || "Dosya yüklenemedi."));
        return;
      }
      if (!req.file) {
        resolve(fail(400, "Dosya gerekli."));
        return;
      }

      try {
        const mime = req.file.mimetype;
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${mime};base64,${b64}`;

        const isImage = mime.startsWith("image/");
        const isVideo = mime.startsWith("video/");
        const resourceType = isVideo ? "video" : isImage ? "image" : "raw";

        const uploaded = await cloudinary.uploader.upload(dataURI, {
          folder: "social-media-app/chat",
          resource_type: resourceType,
        });

        const kind = isImage || isVideo ? "image" : "file";

        resolve(
          ok(200, {
            url: uploaded.secure_url,
            mimeType: mime,
            originalName: String(req.file.originalname || "dosya").slice(0, 200),
            size: req.file.size,
            kind,
          })
        );
      } catch (e) {
        console.log("Error in upload_chat_file", e.message);
        resolve(fail(500, "Dosya yüklenirken bir hata oluştu."));
      }
    });
  });
}
