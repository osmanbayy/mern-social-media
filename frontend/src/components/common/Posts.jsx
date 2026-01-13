import { useState, useEffect, useCallback, useRef } from "react";
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getAllPosts, getFollowingPosts, getUserPosts, getLikedPosts, getSavedPosts, getHiddenPosts } from "../../api/posts";
import MobileSuggestedUsers from "./MobileSuggestedUsers";

const Posts = ({ feedType, username, userId }) => {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [suggestionPosition, setSuggestionPosition] = useState(null);
  const limit = 10;

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
    queryKey: ["posts", feedType, username, userId, page],
    queryFn: getPostQueryFn(feedType, page),
    enabled: feedType === "forYou" ? hasMore : true,
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    staleTime: 30000, // Consider data fresh for 30 seconds
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
    if (postsData && !isLoading) {
      const posts = Array.isArray(postsData) ? postsData : postsData?.posts || [];
      const hasMoreData = Array.isArray(postsData) ? false : (postsData?.hasMore || false);
      
      if (page === 1) {
        setAllPosts(posts);
      } else {
        // For subsequent pages, append smoothly without scroll jump
        setAllPosts((prev) => {
          const existingIds = new Set(prev.map(p => p._id));
          const newPosts = posts.filter(p => !existingIds.has(p._id));
          return [...prev, ...newPosts];
        });
      }
      
      setHasMore(hasMoreData);
    }
  }, [postsData, page, isLoading]);

  // Reset when feedType changes
  useEffect(() => {
    setPage(1);
    setAllPosts([]);
    setHasMore(true);
    setSuggestionPosition(null);
    refetch();
  }, [feedType, refetch, username]);

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

  const posts = feedType === "forYou" ? allPosts : (Array.isArray(postsData) ? postsData : postsData?.posts || postsData || []);

  return (
    <>
      {isLoading && page === 1 && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && posts?.length === 0 && (
        <p className="text-center my-4">
          {feedType === "hidden" 
            ? "Henüz gizlenen gönderiniz yok. 👻" 
            : "Burada hiç gönderi yok. Sayfayı yenilemeyi dene.👻"
          }
        </p>
      )}
      {!isLoading && posts && posts.length > 0 && (
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
};
export default Posts;
