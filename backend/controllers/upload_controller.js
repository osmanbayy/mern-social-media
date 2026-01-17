import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// Multer configuration for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Sadece resim dosyaları yüklenebilir."), false);
    }
  },
});

export const upload_image = async (req, res) => {
  try {
    // Use multer to handle the file upload
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Lütfen bir resim dosyası seçin." });
      }

      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
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