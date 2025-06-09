import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
  const getPostEndpoint = (feedType) => {
    switch (feedType) {
      case "forYou":
        return "api/post/all";
      case "following":
        return "api/post/following";
      case "posts":
        return `/api/post/user/${username}`;
      case "likes":
        return `/api/post/likes/${userId}`;
      case "saves": 
        return `/api/post/saved/${userId}`;    
      default:
        return "api/post/all";
    }
  };

  const POST_ENDPOINT = getPostEndpoint(feedType);

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const response = await fetch(POST_ENDPOINT);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message ||
              "Gönderiler şu anda alınamıyor. Sunucuyla ilgili hata olabilir."
          );
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
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
          Burada hiç gönderi yok. Sayfayı yenilemeyi dene.👻
        </p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
