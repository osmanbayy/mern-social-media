import { requestPostsFeedResync } from "../constants/feedEvents";
import {
  QK_AUTH_USER,
  QK_BLOCKED_USERS,
  QK_CONVERSATIONS,
  QK_FOLLOWERS,
  QK_FOLLOWINGS,
  QK_MESSAGE_REQUESTS,
  QK_NOTIFICATIONS,
  QK_POSTS,
  QK_TRENDING_HASHTAGS,
  QK_HASHTAG_POSTS,
  QK_USER_PREFIX,
  SUGGESTED_USERS_QUERY_KEYS,
  qkMessages,
  qkPost,
} from "../constants/queryKeys";

const inv = (queryClient, queryKey) => queryClient.invalidateQueries({ queryKey });

/** Birden fazla query key’ini toplu invalidate */
export function invalidateKeys(queryClient, queryKeysList) {
  return Promise.all(queryKeysList.map((qk) => inv(queryClient, qk)));
}

/** @param {import("@tanstack/react-query").QueryClient} queryClient */
export function invalidateAuthUser(queryClient) {
  return inv(queryClient, QK_AUTH_USER);
}

/** Ana akış + Senin İçin yerel sıfırlama olayı */
export function invalidatePostsFeed(queryClient) {
  inv(queryClient, QK_POSTS);
  requestPostsFeedResync();
}

/**
 * Yeni gönderi / retweet / düzenleme / silme / feed soketi sonrası gündem + etiket sayfası akışları.
 */
export function invalidateTrendingHashtags(queryClient) {
  return Promise.all([inv(queryClient, QK_TRENDING_HASHTAGS), inv(queryClient, QK_HASHTAG_POSTS)]);
}

export function invalidateNotifications(queryClient) {
  return inv(queryClient, QK_NOTIFICATIONS);
}

export function invalidateConversations(queryClient) {
  return inv(queryClient, QK_CONVERSATIONS);
}

export function invalidateMessageRequests(queryClient) {
  return inv(queryClient, QK_MESSAGE_REQUESTS);
}

export function invalidateMessagesForConversation(queryClient, conversationId) {
  const id = conversationId != null ? String(conversationId) : conversationId;
  return inv(queryClient, qkMessages(id));
}

export function invalidatePostById(queryClient, postId) {
  return inv(queryClient, qkPost(postId));
}

/** Profil rotası: ["user", username] */
export function invalidateUserByUsername(queryClient, username) {
  if (username == null) return Promise.resolve();
  return inv(queryClient, ["user", username]);
}

/** Takip / takipten çık sonrası (useFollow) */
export function invalidateFollowRelated(queryClient) {
  return invalidateKeys(queryClient, [
    SUGGESTED_USERS_QUERY_KEYS.rightPanel,
    QK_AUTH_USER,
    QK_FOLLOWINGS,
    QK_FOLLOWERS,
    QK_USER_PREFIX,
  ]);
}

export function invalidateUserProfiles(queryClient) {
  return inv(queryClient, QK_USER_PREFIX);
}

export function invalidatePostsAndAuthUser(queryClient) {
  return Promise.all([inv(queryClient, QK_POSTS), inv(queryClient, QK_AUTH_USER)]);
}

export function invalidateAuthUserAndUserProfiles(queryClient) {
  return Promise.all([inv(queryClient, QK_AUTH_USER), inv(queryClient, QK_USER_PREFIX)]);
}

export function invalidateBlockedAndFeed(queryClient) {
  return invalidateKeys(queryClient, [QK_BLOCKED_USERS, QK_AUTH_USER, QK_POSTS]);
}

export function invalidateAfterBlockOrProfileDamage(queryClient, username) {
  return Promise.all([
    invalidateUserByUsername(queryClient, username),
    inv(queryClient, QK_AUTH_USER),
    inv(queryClient, QK_POSTS),
  ]);
}

/** Mesaj isteği kabul: konuşmalar + bildirimler (+ istek listesi çağıran taraf zaten invalidate ediyor olabilir) */
export function invalidateAfterMessageRequestAccepted(queryClient) {
  return invalidateKeys(queryClient, [
    QK_MESSAGE_REQUESTS,
    QK_CONVERSATIONS,
    QK_NOTIFICATIONS,
  ]);
}

export function invalidateAfterMessageRequestDeclined(queryClient) {
  return invalidateKeys(queryClient, [QK_MESSAGE_REQUESTS, QK_NOTIFICATIONS]);
}

/** Konuşma listesi + mesaj istekleri (ilk mesaj / beklemede) */
export function invalidateConversationsAndMessageRequests(queryClient) {
  return invalidateKeys(queryClient, [QK_CONVERSATIONS, QK_MESSAGE_REQUESTS]);
}

/** Mesaj sorgusu + konuşma listesi + istek kutusu (gönderim sonrası tam yenileme) */
export function invalidateMessagesConversationsAndMessageRequests(queryClient, conversationId) {
  const id = conversationId != null ? String(conversationId) : conversationId;
  return invalidateKeys(queryClient, [
    qkMessages(id),
    QK_CONVERSATIONS,
    QK_MESSAGE_REQUESTS,
  ]);
}

/** Mesaj sorgusu + konuşma listesi (silme, düzenleme, toplu sil, temizle) */
export function invalidateMessagesAndConversations(queryClient, conversationId) {
  const id = conversationId != null ? String(conversationId) : conversationId;
  return invalidateKeys(queryClient, [qkMessages(id), QK_CONVERSATIONS]);
}
