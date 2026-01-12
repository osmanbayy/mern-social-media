import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to get updated post from cache and subscribe to cache updates
 * This ensures component re-renders when cache updates
 */
const usePostCache = (post) => {
  const queryClient = useQueryClient();
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Subscribe to cache updates by checking queries on each render
  const postsQueries = queryClient.getQueriesData({ queryKey: ["posts"] });

  // Get updated post from cache - check all posts queries
  const updatedPost = useMemo(() => {
    // Check all posts queries to find the updated post
    for (const [, postsData] of postsQueries) {
      if (postsData && Array.isArray(postsData)) {
        const cachedPost = postsData.find((p) => p._id === post._id);
        if (cachedPost) {
          return cachedPost;
        }
      }
    }
    return post;
  }, [post, postsQueries, updateTrigger]);

  // Force re-render when cache updates by listening to query cache changes
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === "posts") {
        setUpdateTrigger((prev) => prev + 1);
      }
    });
    return unsubscribe;
  }, [queryClient]);

  return updatedPost;
};

export default usePostCache;
