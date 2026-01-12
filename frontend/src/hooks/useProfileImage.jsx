import { useState, useRef } from "react";

/**
 * Hook for handling profile and cover image uploads
 */
const useProfileImage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (state === "coverImg") {
          setCoverImg(reader.result);
        } else if (state === "profileImage") {
          setProfileImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImages = () => {
    setCoverImg(null);
    setProfileImage(null);
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
  };
};

export default useProfileImage;
