import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getAllPosts, getFollowingPosts, getUserPosts, getLikedPosts, getSavedPosts, getHiddenPosts } from "../../api/posts";

const Posts = ({ feedType, username, userId }) => {
  const getPostQueryFn = (feedType) => {
    switch (feedType) {
      case "forYou":
        return getAllPosts;
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
        return getAllPosts;
    }
  };

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", feedType, username, userId],
    queryFn: getPostQueryFn(feedType),
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);
  return (
    <>
      {(isLoading || isRefetching) && (
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
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} isHidden={feedType === "hidden"} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
