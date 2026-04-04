import { useQuery } from "@tanstack/react-query";
import { getSuggestedUsers } from "../api/users";

/**
 * Önerilen kullanıcılar için standart useQuery sarmalayıcısı.
 * @param {object} options
 * @param {import("@tanstack/react-query").QueryKey} options.queryKey
 * @param {number} [options.page=1]
 * @param {number} [options.limit=5]
 * @param {boolean} [options.enabled=true]
 * @param {Omit<import("@tanstack/react-query").UseQueryOptions, "queryKey" | "queryFn">} [options.queryOptions]
 */
export function useSuggestedUsersQuery({
  queryKey,
  page = 1,
  limit = 5,
  enabled = true,
  ...queryOptions
} = {}) {
  return useQuery({
    queryKey,
    queryFn: () => getSuggestedUsers(page, limit),
    enabled,
    ...queryOptions,
  });
}
