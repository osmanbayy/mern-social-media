import { Navigate, Route } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import PostCreate from "../components/common/PostCreate";
import Settings from "../pages/Settings";
import BookmarkedPosts from "../pages/BookmarkedPosts";
import HiddenPosts from "../pages/HiddenPosts";
import PostDetailPage from "../pages/post/PostDetailPage";
import EditProfilePage from "../pages/profile/EditProfilePage";
import SuggestionsPage from "../pages/SuggestionsPage";
import SearchResultsPage from "../pages/search/SearchResultsPage";
import HashtagPage from "../pages/hashtag/HashtagPage";
import MessagesPage from "../pages/messages/MessagesPage";
import MessageRequestsPage from "../pages/messages/MessageRequestsPage";
import ChatPage from "../pages/messages/ChatPage";
import VerifyAccount from "../pages/VerifyAccount";
import NotificationPage from "../pages/notification/NotificationPage";
import ProfilePage from "../pages/profile/ProfilePage";
import ProfileFollowersPage from "../pages/profile/ProfileFollowersPage";
import RedirectWriteToChat from "./RedirectWriteToChat";

/**
 * `<Routes>` içinde doğrudan kullanılmalı; özel bileşen sarmalayıcı React Router v6 ile uyumlu değil.
 * Fragment + `<Route>` döndürür.
 */
export function authenticatedRouteElements(isAccountVerified) {
  return (
    <>
      <Route path="/" element={<HomePage />} />
      <Route path="/notifications" element={<NotificationPage />} />
      <Route path="/profile/:username" element={<ProfilePage />} />
      <Route path="/profile/:username/followers" element={<ProfileFollowersPage />} />
      <Route path="/profile/:username/following" element={<ProfileFollowersPage />} />
      <Route path="/create-post" element={<PostCreate />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/saved-posts" element={<BookmarkedPosts />} />
      <Route path="/hidden-posts" element={<HiddenPosts />} />
      <Route path="/post/:postId" element={<PostDetailPage />} />
      <Route path="/edit-profile" element={<EditProfilePage />} />
      <Route path="/suggestions" element={<SuggestionsPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/hashtag/:tag" element={<HashtagPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/messages/requests" element={<MessageRequestsPage />} />
      <Route path="/messages/chat/new/:userId" element={<ChatPage />} />
      <Route path="/messages/chat/:conversationId" element={<ChatPage />} />
      <Route path="/messages/write/:userId" element={<RedirectWriteToChat />} />
      <Route
        path="/verify-account"
        element={!isAccountVerified ? <VerifyAccount /> : <Navigate to="/" />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  );
}
