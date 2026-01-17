import { useState, useRef } from "react";
import { optimizeImage, isImageFile } from "../utils/imageOptimizer";
import toast from "react-hot-toast";

/**
 * Hook for handling profile and cover image uploads with crop support
 */
const useProfileImage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropType, setCropType] = useState(null); // "coverImg" or "profileImage"
  const [showCropModal, setShowCropModal] = useState(false);
  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const handleImgChange = async (e, state) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isImageFile(file)) {
      toast.error("Lütfen bir resim dosyası seçin.");
      return;
    }

    try {
      // Optimize image if it's over 10MB
      const optimizedImage = await optimizeImage(file, 9);
      
      // Instead of directly setting the image, open crop modal
      setCropImageSrc(optimizedImage);
      setCropType(state);
      setShowCropModal(true);
    } catch (error) {
      toast.error(error.message || "Resim yüklenirken bir hata oluştu.");
      // Reset file input on error
      if (coverImgRef.current) coverImgRef.current.value = "";
      if (profileImgRef.current) profileImgRef.current.value = "";
    }
  };

  const handleCropComplete = (croppedImage) => {
    if (cropType === "coverImg") {
      setCoverImg(croppedImage);
    } else if (cropType === "profileImage") {
      setProfileImage(croppedImage);
    }
    setShowCropModal(false);
    setCropImageSrc(null);
    setCropType(null);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setCropImageSrc(null);
    setCropType(null);
    // Reset file input
    if (coverImgRef.current) coverImgRef.current.value = "";
    if (profileImgRef.current) profileImgRef.current.value = "";
  };

  const resetImages = () => {
    setCoverImg(null);
    setProfileImage(null);
    setCropImageSrc(null);
    setCropType(null);
    setShowCropModal(false);
  };

  return {
    coverImg,
    profileImage,
    coverImgRef,
    profileImgRef,
    handleImgChange,
    resetImages,
    setCoverImg,
    setProfileImage,
    // Crop modal state
    cropImageSrc,
    showCropModal,
    cropType,
    handleCropComplete,
    handleCropCancel,
  };
};

export default useProfileImage;
