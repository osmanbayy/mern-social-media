import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { blockUser } from "../api/users";
import { invalidatePostsAndAuthUser } from "../utils/queryInvalidation";

export function useBlockPostAuthor(userId) {
  const queryClient = useQueryClient();
  const [isBlocking, setIsBlocking] = useState(false);

  const blockAuthor = useCallback(async () => {
    if (userId == null) return false;
    setIsBlocking(true);
    try {
      await blockUser(userId);
      await invalidatePostsAndAuthUser(queryClient);
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("blockUser:", error);
      }
      return false;
    } finally {
      setIsBlocking(false);
    }
  }, [queryClient, userId]);

  return { blockAuthor, isBlocking };
}
