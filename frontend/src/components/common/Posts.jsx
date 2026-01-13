import { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from "react";
import { useLocation } from "react-router-dom";
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { getAllPosts, getFollowingPosts, getUserPosts, getLikedPosts, getSavedPosts, getHiddenPosts } from "../../api/posts";
import MobileSuggestedUsers from "./MobileSuggestedUsers";

const Posts = forwardRef(({ feedType, username, userId }, ref) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [suggestionPosition, setSuggestionPosition] = useState(null);
  const limit = 10;
  const previousLocationRef = useRef(location.pathname);

  const getPostQueryFn = (feedType, pageNum) => {
    switch (feedType) {
      case "forYou":
        return () => getAllPosts(pageNum, limit);
      case "following":
        return getFollowingPosts;
      case "posts":
        return () => getUserPosts(username);
      case "likes":
        return () => getLikedPosts(userId);
      case "saves": 
        return () => getSavedPosts(userId);
      case "hidden":
        return () => getHiddenPosts(userId);
      default:
        return () => getAllPosts(pageNum, limit);
    }
  };

  const {
    data: postsData,
    isLoading,
    isFetching,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", feedType, username, userId, page, location.pathname],
    queryFn: getPostQueryFn(feedType, page),
    enabled: feedType === "forYou" ? hasMore : true,
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    staleTime: 0, // Always consider data stale, refetch on mount
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus (to avoid unnecessary requests)
    gcTime: 5 * 60 * 1000, // Keep cache for 5 minutes (formerly cacheTime)
  });

  // Set random suggestion position on first load (only for forYou feed, within first 10 posts)
  useEffect(() => {
    if (feedType === "forYou" && suggestionPosition === null && allPosts.length >= 3) {
      // Random position between 3-7 (within first 10 posts)
      const randomPos = Math.floor(Math.random() * 5) + 3;
      setSuggestionPosition(Math.min(randomPos, Math.min(10, allPosts.length)));
    }
  }, [feedType, allPosts.length, suggestionPosition]);

  // Handle paginated response - preserve scroll position smoothly
  useEffect(() => {
    if (postsData && (!isLoading || isRefetching)) {
      const posts = Array.isArray(postsData) ? postsData : postsData?.posts || [];
      const hasMoreData = Array.isArray(postsData) ? false : (postsData?.hasMore || false);
      
      // Sort posts: pinned first, then by date (only for profile posts)
      const sortedPosts = feedType === "posts" 
        ? [...posts].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
        : posts;
      
      if (page === 1) {
        setAllPosts(sortedPosts);
      } else {
        // For subsequent pages, append smoothly without scroll jump
        setAllPosts((prev) => {
          const existingIds = new Set(prev.map(p => p._id));
          const newPosts = sortedPosts.filter(p => !existingIds.has(p._id));
          // Sort again to maintain pinned posts at top
          const combined = [...prev, ...newPosts];
          if (feedType === "posts") {
            return combined.sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return new Date(b.createdAt) - new Date(a.createdAt);
            });
          }
          return combined;
        });
      }
      
      setHasMore(hasMoreData);
    }
  }, [postsData, page, isLoading, isRefetching, feedType]);

  // Subscribe to cache updates to sync allPosts state
  useEffect(() => {
    if (feedType === "forYou" && allPosts.length > 0) {
      const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
        if (event?.type === "updated" && event?.query?.queryKey?.[0] === "posts") {
          // Get latest data from cache for page 1
          const cachedData = queryClient.getQueryData(["posts", feedType, username, userId, 1]);
          if (cachedData) {
            const cachedPosts = Array.isArray(cachedData) ? cachedData : cachedData?.posts || [];
            // Update allPosts with cached data, preserving order and appending new posts
            setAllPosts((prev) => {
              const updatedPosts = prev.map((prevPost) => {
                const cachedPost = cachedPosts.find((p) => p._id === prevPost._id);
                return cachedPost || prevPost;
              });
              // Add any new posts that aren't in allPosts yet
              const existingIds = new Set(prev.map(p => p._id));
              const newPosts = cachedPosts.filter(p => !existingIds.has(p._id));
              return [...updatedPosts, ...newPosts];
            });
          }
        }
      });
      return unsubscribe;
    }
  }, [feedType, allPosts.length, queryClient, username, userId]);

  // Expose refetch method to parent component
  useImperativeHandle(ref, () => ({
    refetch: async () => {
      setPage(1);
      setAllPosts([]);
      setHasMore(true);
      setSuggestionPosition(null);
      // Wait for refetch to complete
      await refetch();
    }
  }));

  // Reset when feedType changes
  useEffect(() => {
    setPage(1);
    setAllPosts([]);
    setHasMore(true);
    setSuggestionPosition(null);
    refetch();
  }, [feedType, refetch, username]);

  // Refetch when returning to home page from another page
  useEffect(() => {
    const isReturningToHome = previousLocationRef.current !== "/" && location.pathname === "/";
    
    if (isReturningToHome && feedType === "forYou") {
      // Reset to page 1 and clear posts when returning to home
      setPage(1);
      setAllPosts([]);
      setHasMore(true);
      setSuggestionPosition(null);
      // Directly refetch without invalidateQueries
      refetch();
    }
    
    previousLocationRef.current = location.pathname;
  }, [location.pathname, refetch, feedType]);

  // Throttle scroll handler using useRef
  const scrollTimeoutRef = useRef(null);
  
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) return;
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (
        feedType === "forYou" &&
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 300 &&
        !isFetching &&
        hasMore &&
        !isLoading
      ) {
        setPage((prev) => prev + 1);
      }
      scrollTimeoutRef.current = null;
    }, 150);
  }, [isFetching, hasMore, isLoading, feedType]);

  useEffect(() => {
    if (feedType === "forYou") {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      };
    }
  }, [handleScroll, feedType]);

  // Use allPosts for forYou feed, but fallback to postsData if allPosts is empty
  const posts = feedType === "forYou" 
    ? (allPosts.length > 0 ? allPosts : (Array.isArray(postsData) ? postsData : postsData?.posts || postsData || []))
    : (Array.isArray(postsData) ? postsData : postsData?.posts || postsData || []);

  return (
    <>
      {(isLoading || (isRefetching && page === 1 && allPosts.length === 0)) && page === 1 && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">
          {feedType === "hidden" 
            ? "Henüz gizlenen gönderiniz yok. 👻" 
            : "Burada hiç gönderi yok. Sayfayı yenilemeyi dene.👻"
          }
        </p>
      )}
      {(!isLoading || (isRefetching && posts && posts.length > 0)) && posts && posts.length > 0 && (
        <div className="w-full overflow-x-hidden">
          {posts.map((post, index) => (
            <div key={post._id} className="w-full">
              <Post post={post} isHidden={feedType === "hidden"} />
              {/* Show mobile suggested users at random position (only for forYou feed, within first 10 posts) */}
              {feedType === "forYou" && 
               suggestionPosition !== null && 
               index === suggestionPosition - 1 &&
               index < 10 && (
                <MobileSuggestedUsers />
              )}
            </div>
          ))}
        </div>
      )}
      {/* Smooth loading indicator for pagination */}
      {isFetching && page > 1 && (
        <div className="flex justify-center items-center py-4 animate-pulse">
          <div className="flex flex-col gap-2 w-full max-w-md">
            <PostSkeleton />
          </div>
        </div>
      )}
    </>
  );
});

Posts.displayName = "Posts";

export default Posts;
