import { requestPostsFeedResync } from "../constants/feedEvents";

/** Tüm ["posts", ...] sorgularını yenile + ana akış yerel listesini sıfırla (Senin İçin) */
export function invalidatePostsFeed(queryClient) {
  queryClient.invalidateQueries({ queryKey: ["posts"] });
  requestPostsFeedResync();
}
