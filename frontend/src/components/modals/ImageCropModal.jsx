import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { LuX, LuCheck } from "react-icons/lu";
import LoadingSpinner from "../common/LoadingSpinner";

const ImageCropModal = ({ 
  imageSrc, 
  isOpen, 
  onClose, 
  onCropComplete, 
  aspectRatio = 1, 
  cropShape = "rect"
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context is not available");
    }

    // Set canvas size to crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.imageSmoothingQuality = "high";

    // Draw the cropped portion of the image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const fileUrl = URL.createObjectURL(blob);
          resolve(fileUrl);
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageUrl) {
        // Convert blob URL to base64
        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          onCropComplete(reader.result);
          setIsProcessing(false);
          onClose();
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      // Error is handled by toast
      if (process.env.NODE_ENV === "development") {
        console.error("Error cropping image:", error);
      }
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300/50">
          <h3 className="font-semibold text-lg text-base-content">
            Fotoğrafı Düzenle
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isProcessing}
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative w-full" style={{ height: "400px" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={cropShape}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4 border-t border-base-300/50">
          {/* Zoom Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content/70">
              Yakınlaştır
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full range range-primary"
            />
            <div className="flex justify-between text-xs text-base-content/50">
              <span>1x</span>
              <span>3x</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline rounded-full flex-1"
              disabled={isProcessing}
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary rounded-full flex-1 text-white"
              disabled={isProcessing || !croppedAreaPixels}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>İşleniyor...</span>
                </>
              ) : (
                <>
                  <LuCheck className="w-5 h-5" />
                  <span>Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
