import { IMAGE_OPTIMIZER } from "../constants/imageOptimizer";

/**
 * Optimizes an image file to ensure it's under the specified size limit
 * Uses canvas API to compress the image while maintaining quality
 * @param {File} file - The image file to optimize
 * @param {number} maxSizeMB - Maximum size in MB (default: 9)
 * @param {number} maxWidth - Maximum width for resizing (default: 1920)
 * @param {number} maxHeight - Maximum height for resizing (default: 1920)
 * @returns {Promise<string>} - Promise that resolves to base64 data URL
 */
export const optimizeImage = async (
  file,
  maxSizeMB = IMAGE_OPTIMIZER.DEFAULT_MAX_SIZE_MB,
  maxWidth = IMAGE_OPTIMIZER.DEFAULT_MAX_WIDTH,
  maxHeight = IMAGE_OPTIMIZER.DEFAULT_MAX_HEIGHT
) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // If file is already under the limit, return as-is
  if (file.size <= maxSizeBytes) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions if image is too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Optimize quality using iterative approach (more efficient than recursive)
      const optimizeQuality = (startQuality, startWidth, startHeight) => {
        let currentQuality = startQuality;
        let currentWidth = startWidth;
        let currentHeight = startHeight;
        const imageType = file.type || IMAGE_OPTIMIZER.FALLBACK_IMAGE_TYPE;

        while (true) {
          // Reuse canvas with current dimensions
          if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
            canvas.width = currentWidth;
            canvas.height = currentHeight;
            ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
          }
          
          const dataURL = canvas.toDataURL(imageType, currentQuality);
          const currentSize = getBase64Size(dataURL);
          
          if (currentSize <= maxSizeBytes) {
            resolve(dataURL);
            return;
          }

          // If quality is too low, try resizing more aggressively
          if (currentQuality <= IMAGE_OPTIMIZER.MIN_QUALITY) {
            if (currentWidth > IMAGE_OPTIMIZER.RESIZE_THRESHOLD && currentHeight > IMAGE_OPTIMIZER.RESIZE_THRESHOLD) {
              currentWidth = Math.round(currentWidth * IMAGE_OPTIMIZER.RESIZE_RATIO);
              currentHeight = Math.round(currentHeight * IMAGE_OPTIMIZER.RESIZE_RATIO);
              currentQuality = IMAGE_OPTIMIZER.FALLBACK_QUALITY;
              continue;
            } else {
              // Return the best we can do
              resolve(dataURL);
              return;
            }
          }

          // Reduce quality and try again
          currentQuality = Math.max(IMAGE_OPTIMIZER.MIN_QUALITY, currentQuality - IMAGE_OPTIMIZER.QUALITY_STEP);
        }
      };

      optimizeQuality(IMAGE_OPTIMIZER.MAX_QUALITY, width, height);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Resim yüklenemedi."));
    };
    
    img.src = objectUrl;
  });
};

/**
 * Calculates the approximate size of a base64 string in bytes
 * @param {string} base64String - The base64 string
 * @returns {number} - Size in bytes
 */
const getBase64Size = (base64String) => {
  // Remove data URL prefix if present
  const base64 = base64String.includes(",")
    ? base64String.split(",")[1]
    : base64String;
  
  // Calculate size: base64 is ~4/3 of original size
  // But we need to account for padding
  const padding = (base64.match(/=/g) || []).length;
  return (base64.length * 3) / 4 - padding;
};

/**
 * Checks if a file is an image
 * @param {File} file - The file to check
 * @returns {boolean} - True if file is an image
 */
export const isImageFile = (file) => {
  return file && file.type.startsWith("image/");
};

/**
 * Formats file size to human-readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
