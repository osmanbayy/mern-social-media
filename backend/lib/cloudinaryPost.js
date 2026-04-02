import { v2 as cloudinary } from "cloudinary";

/** Cloudinary `.../upload/v1234/folder/public_id.ext` URL'den public_id çıkarır ve siler */
export async function destroyCloudinaryImageByUrl(url) {
  if (!url || typeof url !== "string") return;
  try {
    const imageId = url.split("/").pop().split(".")[0];
    if (imageId) await cloudinary.uploader.destroy(imageId);
  } catch (e) {
    console.log("cloudinary destroy:", e.message);
  }
}
