import { useQuery } from "@tanstack/react-query";
import { getTrendingHashtags } from "../api/posts";
import { QK_TRENDING_HASHTAGS } from "../constants/queryKeys";

const STALE_MS = 5 * 60 * 1000;

/**
 * @param {{ limit?: number, sinceDays?: number, enabled?: boolean }} [options]
 */
export function useTrendingHashtags(options = {}) {
  const { limit = 10, sinceDays = 7, enabled = true } = options;

  return useQuery({
    queryKey: [...QK_TRENDING_HASHTAGS, limit, sinceDays],
    queryFn: () => getTrendingHashtags({ limit, sinceDays }),
    staleTime: STALE_MS,
    enabled,
  });
}
