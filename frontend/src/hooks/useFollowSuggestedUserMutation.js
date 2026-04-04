import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser } from "../api/users";
import { removeUserFromSuggestedCacheData } from "../utils/suggestedUsers";

/**
 * Öneri listelerinden takip; isteğe bağlı optimistic cache + invalidate.
 *
 * @param {object} [options]
 * @param {import("@tanstack/react-query").QueryKey[]} [options.optimisticRemoveFromQueryKeys] — onMutate'ta listeden düşürülecek cache key'leri
 * @param {import("@tanstack/react-query").QueryKey[]} [options.invalidateQueryKeys] — onSuccess'te invalidate
 * @param {string | null} [options.successToast] — başarılı olunca toast (null ise gösterme)
 */
export function useFollowSuggestedUserMutation({
  optimisticRemoveFromQueryKeys = [],
  invalidateQueryKeys = [],
  successToast = null,
} = {}) {
  const queryClient = useQueryClient();
  const [loadingUserId, setLoadingUserId] = useState(null);

  const { mutate: follow } = useMutation({
    mutationFn: (userId) => followUser(userId),
    onMutate: (userId) => {
      setLoadingUserId(userId);
      for (const key of optimisticRemoveFromQueryKeys) {
        queryClient.setQueryData(key, (old) => removeUserFromSuggestedCacheData(old, userId));
      }
    },
    onSuccess: async () => {
      await Promise.all(
        invalidateQueryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
      );
      setLoadingUserId(null);
      if (successToast) {
        toast.success(successToast);
      }
    },
    onError: (error) => {
      toast.error(error.message);
      for (const key of optimisticRemoveFromQueryKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      setLoadingUserId(null);
    },
  });

  return { follow, loadingUserId };
}
