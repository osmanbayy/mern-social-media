/** Ana sayfa "Senin İçin" yerel state + sayfalama ile senkron kalsın diye */
export const POSTS_FEED_RESET_EVENT = "posts-feed-reset";

export function requestPostsFeedResync() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(POSTS_FEED_RESET_EVENT));
  }
}
