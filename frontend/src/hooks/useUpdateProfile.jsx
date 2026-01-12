import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../api/users";

const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const authUser = queryClient.getQueryData({ queryKey: ["authUser"] });

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: (formData) => updateUserProfile(formData),
    onSuccess: (formData) => {
      toast.success("Profil güncellendi.");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["user"] }),
      ]);
      if (authUser?.username !== formData?.username) {
        navigate(`/profile/${formData.username}`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { updateProfile, isUpdatingProfile };
};

export default useUpdateProfile;
