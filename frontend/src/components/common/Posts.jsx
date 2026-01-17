import { useState, useEffect, useCallback, useRef } from "react";
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { getAllPosts, getFollowingPosts, getUserPosts, getLikedPosts, getSavedPosts, getHiddenPosts } from "../../api/posts";
import MobileSuggestedUsers from "./MobileSuggestedUsers";
import { POST_FEED_TYPES, POST_CONSTANTS } from "../../constants/postFeedTypes";
import { sortPostsByPinned, extractPostsFromData, getHasMoreFromData } from "../../utils/postSorting";

const Posts = ({ feedType, username, userId }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [suggestionPosition, setSuggestionPosition] = useState(null);
  const scrollTimeoutRef = useRef(null);

  const getPostQueryFn = useCallback((feedType, pageNum) => {
    const queryMap = {
      [POST_FEED_TYPES.FOR_YOU]: () => getAllPosts(pageNum, POST_CONSTANTS.DEFAULT_LIMIT),
      [POST_FEED_TYPES.FOLLOWING]: getFollowingPosts,
      [POST_FEED_TYPES.POSTS]: () => getUserPosts(username),
      [POST_FEED_TYPES.LIKES]: () => getLikedPosts(userId),
      [POST_FEED_TYPES.SAVES]: () => getSavedPosts(userId),
      [POST_FEED_TYPES.HIDDEN]: () => getHiddenPosts(userId),
    };
    
    return queryMap[feedType] || queryMap[POST_FEED_TYPES.FOR_YOU];
  }, [username, userId]);

  const {
    data: postsData,
    isLoading,
    isFetching,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", feedType, username, userId, page],
    queryFn: getPostQueryFn(feedType, page),
    enabled: feedType === POST_FEED_TYPES.FOR_YOU ? hasMore : true,
    placeholderData: keepPreviousData,
    staleTime: 30000, // 30 seconds - cache data for 30 seconds to prevent unnecessary refetches
    refetchOnMount: true, // Only refetch if data is stale
    refetchOnWindowFocus: false,
    gcTime: POST_CONSTANTS.CACHE_TIME_MS,
  });

  // Set random suggestion position on first load (only for forYou feed, within first 10 posts)
  useEffect(() => {
    if (
      feedType === POST_FEED_TYPES.FOR_YOU && 
      suggestionPosition === null && 
      allPosts.length >= POST_CONSTANTS.SUGGESTION_MIN_POSTS
    ) {
      const randomPos = Math.floor(Math.random() * 
        (POST_CONSTANTS.SUGGESTION_MAX_POSITION - POST_CONSTANTS.SUGGESTION_MIN_POSITION + 1)
      ) + POST_CONSTANTS.SUGGESTION_MIN_POSITION;
      setSuggestionPosition(Math.min(randomPos, Math.min(POST_CONSTANTS.SUGGESTION_MAX_INDEX, allPosts.length)));
    }
  }, [feedType, allPosts.length, suggestionPosition]);

  // Handle paginated response - preserve scroll position smoothly
  useEffect(() => {
    if (!postsData || (isLoading && !isRefetching)) return;

    const posts = extractPostsFromData(postsData);
    const hasMoreData = getHasMoreFromData(postsData);
    
    // Sort posts: pinned first, then by date (only for profile posts)
    const sortedPosts = feedType === POST_FEED_TYPES.POSTS 
      ? sortPostsByPinned(posts)
      : posts;
    
    if (page === 1) {
      setAllPosts(sortedPosts);
    } else {
      // For subsequent pages, append smoothly without scroll jump
      setAllPosts((prev) => {
        const existingIds = new Set(prev.map(p => p._id));
        const newPosts = sortedPosts.filter(p => !existingIds.has(p._id));
        const combined = [...prev, ...newPosts];
        return feedType === POST_FEED_TYPES.POSTS 
          ? sortPostsByPinned(combined)
          : combined;
      });
    }
    
    setHasMore(hasMoreData);
  }, [postsData, page, isLoading, isRefetching, feedType]);

  // Subscribe to cache updates to sync allPosts state
  useEffect(() => {
    if (feedType !== POST_FEED_TYPES.FOR_YOU || allPosts.length === 0) return;

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === "updated" && event?.query?.queryKey?.[0] === "posts") {
        const cachedData = queryClient.getQueryData(["posts", feedType, username, userId, 1]);
        if (!cachedData) return;

        const cachedPosts = extractPostsFromData(cachedData);
        setAllPosts((prev) => {
          const updatedPosts = prev.map((prevPost) => {
            const cachedPost = cachedPosts.find((p) => p._id === prevPost._id);
            return cachedPost || prevPost;
          });
          const existingIds = new Set(prev.map(p => p._id));
          const newPosts = cachedPosts.filter(p => !existingIds.has(p._id));
          return [...updatedPosts, ...newPosts];
        });
      }
    });
    return unsubscribe;
  }, [feedType, allPosts.length, queryClient, username, userId]);

  const resetPostsState = useCallback(() => {
    setPage(1);
    setAllPosts([]);
    setHasMore(true);
    setSuggestionPosition(null);
  }, []);

  // Reset when feedType changes
  useEffect(() => {
    resetPostsState();
  }, [feedType, username, resetPostsState]);

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) return;
    
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const documentHeight = document.documentElement.offsetHeight;
      const shouldLoadMore = scrollPosition >= documentHeight - POST_CONSTANTS.SCROLL_THRESHOLD;
      
      if (
        feedType === POST_FEED_TYPES.FOR_YOU &&
        shouldLoadMore &&
        !isFetching &&
        hasMore &&
        !isLoading
      ) {
        setPage((prev) => prev + 1);
      }
      scrollTimeoutRef.current = null;
    }, POST_CONSTANTS.SCROLL_THROTTLE_MS);
  }, [isFetching, hasMore, isLoading, feedType]);

  useEffect(() => {
    if (feedType !== POST_FEED_TYPES.FOR_YOU) return;

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, [handleScroll, feedType]);

  // Use allPosts for forYou feed, but fallback to postsData if allPosts is empty
  const posts = feedType === POST_FEED_TYPES.FOR_YOU 
    ? (allPosts.length > 0 ? allPosts : extractPostsFromData(postsData))
    : extractPostsFromData(postsData);

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
          {feedType === POST_FEED_TYPES.HIDDEN 
            ? "Henüz gizlenen gönderiniz yok. 👻" 
            : "Burada hiç gönderi yok. Sayfayı yenilemeyi dene.👻"
          }
        </p>
      )}
      {(!isLoading || (isRefetching && posts && posts.length > 0)) && posts && posts.length > 0 && (
        <div className="w-full overflow-x-hidden">
          {posts.map((post, index) => (
            <div key={post._id} className="w-full">
              <Post post={post} isHidden={feedType === POST_FEED_TYPES.HIDDEN} />
              {/* Show mobile suggested users at random position (only for forYou feed, within first 10 posts) */}
              {feedType === POST_FEED_TYPES.FOR_YOU && 
               suggestionPosition !== null && 
               index === suggestionPosition - 1 &&
               index < POST_CONSTANTS.SUGGESTION_MAX_INDEX && (
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
};

export default Posts;
