import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const authUser = queryClient.getQueryData({ queryKey: ["authUser"] });

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await fetch(`/api/user/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Bir hata oluştu.");
        }
        return data;
      } catch (error) {
        throw new Error(error.message || "Bir hata oluştu.");
      }
    },
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
