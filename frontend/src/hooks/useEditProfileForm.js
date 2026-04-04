import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useUpdateProfile from "./useUpdateProfile";
import { createEditProfileFormFromUser } from "../utils/editProfileFormDefaults";
import { hasValidationErrors, validateEditProfileForm } from "../utils/editProfileValidation";

export function useEditProfileForm(authUser) {
  const navigate = useNavigate();
  const { updateProfile, isUpdatingProfile } = useUpdateProfile();

  const [formData, setFormData] = useState(() => createEditProfileFormFromUser(authUser));
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    newPwd: false,
    confirm: false,
  });

  useEffect(() => {
    if (authUser) {
      setFormData(createEditProfileFormFromUser(authUser));
    }
  }, [authUser]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }, []);

  const togglePasswordVisibility = useCallback((key) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const nextErrors = validateEditProfileForm(formData);
      setErrors(nextErrors);
      if (hasValidationErrors(nextErrors)) {
        toast.error("Lütfen formu kontrol edin");
        return;
      }

      try {
        const { confirmNewPassword, ...profileData } = formData;
        await updateProfile(profileData);
        navigate(`/profile/${formData.username}`);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Update error:", error);
        }
      }
    },
    [formData, navigate, updateProfile]
  );

  return {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    isUpdatingProfile,
    showPassword,
    togglePasswordVisibility,
  };
}
