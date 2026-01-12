import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "../api/users";

const useFollow = (userId) => {
  const queryClient = useQueryClient();

  const { mutate: follow, isPending } = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["followings"]}),
        queryClient.invalidateQueries({ queryKey: ["followers"]}),
        queryClient.invalidateQueries({ queryKey: ["user"]})
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: unfollow, isPending: isUnfollowing } = useMutation({
    mutationFn: () => unfollowUser(userId),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["followings"]}),
        queryClient.invalidateQueries({ queryKey: ["followers"]}),
        queryClient.invalidateQueries({ queryKey: ["user"]})
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { follow, unfollow, isPending: isPending || isUnfollowing };
};

export default useFollow;
