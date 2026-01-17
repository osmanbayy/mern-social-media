import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../api/users";
import { useAuth } from "../contexts/AuthContext";

const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: (formData) => updateUserProfile(formData),
    onSuccess: (updatedUser, formData) => {
      toast.success("Profil güncellendi.");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["user"] }),
      ]).then(() => {
        if (authUser?.username !== formData?.username && formData?.username) {
          navigate(`/profile/${formData.username}`);
        }
      });
    },
    onError: (error) => {
      toast.error(error.message || "Profil güncellenirken bir hata oluştu.");
    },
  });

  return { updateProfile, isUpdatingProfile };
};

export default useUpdateProfile;
