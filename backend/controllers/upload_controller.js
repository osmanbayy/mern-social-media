import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Sadece resim dosyaları yüklenebilir."), false);
    }
  },
});

/** Sohbet: resim, PDF, zip, video (kısa) */
const uploadChat = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ok =
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/") ||
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed" ||
      file.mimetype === "text/plain";
    if (!ok) {
      return cb(new Error("Bu dosya türü desteklenmiyor."), false);
    }
    cb(null, true);
  },
});

export const upload_image = async (req, res) => {
  try {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Lütfen bir resim dosyası seçin." });
      }

      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const uploadedResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "social-media-app",
        resource_type: "auto",
      });

      res.status(200).json({
        imageUrl: uploadedResponse.secure_url,
        message: "Resim başarıyla yüklendi.",
      });
    });
  } catch (error) {
    console.log("Error in upload image controller", error.message);
    res.status(500).json({ message: "Resim yüklenirken bir hata oluştu." });
  }
};

export const upload_chat_file = async (req, res) => {
  try {
    uploadChat.single("file")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Dosya yüklenemedi." });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Dosya gerekli." });
      }
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

      res.status(200).json({
        url: uploaded.secure_url,
        mimeType: mime,
        originalName: String(req.file.originalname || "dosya").slice(0, 200),
        size: req.file.size,
        kind,
      });
    });
  } catch (error) {
    console.log("Error in upload_chat_file", error.message);
    res.status(500).json({ message: "Dosya yüklenirken bir hata oluştu." });
  }
};
