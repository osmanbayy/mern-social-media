import { useQuery } from "@tanstack/react-query";
import { getSinglePost } from "../api/posts";

export function usePostDetailQuery(postId) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getSinglePost(postId),
    enabled: Boolean(postId),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
