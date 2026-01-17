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
  maxSizeMB = 9,
  maxWidth = 1920,
  maxHeight = 1920
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

      // Binary search for optimal quality
      const optimizeQuality = (currentQuality, currentWidth, currentHeight) => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = currentWidth;
        tempCanvas.height = currentHeight;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(img, 0, 0, currentWidth, currentHeight);
        
        const dataURL = tempCanvas.toDataURL(file.type || "image/jpeg", currentQuality);
        const currentSize = getBase64Size(dataURL);
        
        if (currentSize <= maxSizeBytes) {
          resolve(dataURL);
          return;
        }

        // If quality is too low, try resizing more aggressively
        if (currentQuality <= 0.1) {
          if (currentWidth > 800 && currentHeight > 800) {
            const newWidth = Math.round(currentWidth * 0.8);
            const newHeight = Math.round(currentHeight * 0.8);
            optimizeQuality(0.85, newWidth, newHeight);
          } else {
            // Return the best we can do
            resolve(dataURL);
          }
          return;
        }

        // Reduce quality and try again
        const newQuality = Math.max(0.1, currentQuality - 0.1);
        optimizeQuality(newQuality, currentWidth, currentHeight);
      };

      optimizeQuality(0.9, width, height);
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
