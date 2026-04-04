import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "../api/users";
import { invalidateFollowRelated } from "../utils/queryInvalidation";

const useFollow = (userId) => {
  const queryClient = useQueryClient();

  const { mutate: follow, isPending } = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: () => {
      invalidateFollowRelated(queryClient);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: unfollow, isPending: isUnfollowing } = useMutation({
    mutationFn: () => unfollowUser(userId),
    onSuccess: () => {
      invalidateFollowRelated(queryClient);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { follow, unfollow, isPending: isPending || isUnfollowing };
};

export default useFollow;
