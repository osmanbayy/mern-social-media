import multer from "multer";

export const profileImageUpload = multer({
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
export const chatFileUpload = multer({
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
