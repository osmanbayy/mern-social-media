import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostsByHashtag } from "../api/posts";
import { HASHTAG_PAGE_SIZE } from "../constants/hashtagConstants";
import { QK_HASHTAG_POSTS } from "../constants/queryKeys";

const nextPageParam = (lastPage) => {
  if (!lastPage?.hasMore) return undefined;
  return (lastPage.page ?? 1) + 1;
};

/**
 * @param {string} normalizedTag URL’den gelen, küçük harf etiket
 */
export function useHashtagPosts(normalizedTag) {
  const enabled = Boolean(normalizedTag && normalizedTag.length > 0);

  const query = useInfiniteQuery({
    queryKey: [...QK_HASHTAG_POSTS, normalizedTag],
    queryFn: ({ pageParam }) => getPostsByHashtag(normalizedTag, pageParam, HASHTAG_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
  });

  const posts = query.data?.pages.flatMap((p) => p.posts ?? []) ?? [];

  return {
    posts,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage ?? false,
    isPending: query.isPending,
    isFetchingNextPage: query.isFetchingNextPage,
    total: query.data?.pages[0]?.total,
  };
}
