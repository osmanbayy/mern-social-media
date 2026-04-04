import { useInfiniteQuery } from "@tanstack/react-query";
import { searchPosts } from "../api/posts";
import { searchUsersPaginated } from "../api/users";
import { SEARCH_PAGE_SIZE } from "../constants/searchConstants";

const nextPageParam = (lastPage) => {
  if (!lastPage?.hasMore) return undefined;
  return (lastPage.page ?? 1) + 1;
};

export function useSearchInfiniteResults(trimmedQuery) {
  const enabled = trimmedQuery.length > 0;

  const usersQuery = useInfiniteQuery({
    queryKey: ["searchResults", "users", trimmedQuery],
    queryFn: ({ pageParam }) => searchUsersPaginated(trimmedQuery, pageParam, SEARCH_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
  });

  const postsQuery = useInfiniteQuery({
    queryKey: ["searchResults", "posts", trimmedQuery],
    queryFn: ({ pageParam }) => searchPosts(trimmedQuery, pageParam, SEARCH_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
  });

  const users = usersQuery.data?.pages.flatMap((p) => p.users ?? []) ?? [];
  const posts = postsQuery.data?.pages.flatMap((p) => p.posts ?? []) ?? [];

  return {
    users,
    posts,
    usersQuery,
    postsQuery,
    fetchNextUsers: usersQuery.fetchNextPage,
    fetchNextPosts: postsQuery.fetchNextPage,
    hasMoreUsers: usersQuery.hasNextPage ?? false,
    hasMorePosts: postsQuery.hasNextPage ?? false,
    isPendingUsers: usersQuery.isPending,
    isPendingPosts: postsQuery.isPending,
    isFetchingNextUsers: usersQuery.isFetchingNextPage,
    isFetchingNextPosts: postsQuery.isFetchingNextPage,
  };
}
