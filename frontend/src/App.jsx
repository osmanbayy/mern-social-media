/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignupPage from "./pages/auth/signup/SignupPage";
import LoginPage from "./pages/auth/login/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import ProfilePage from "./pages/profile/ProfilePage";
import ProfileFollowersPage from "./pages/profile/ProfileFollowersPage";
import NotificationPage from "./pages/notification/NotificationPage";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { useAuth } from "./contexts/AuthContext";
import PostCreate from "./components/common/PostCreate";
import VerifyAccount from "./pages/VerifyAccount";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import BookmarkedPosts from "./pages/BookmarkedPosts";
import HiddenPosts from "./pages/HiddenPosts";
import PostDetailPage from "./pages/post/PostDetailPage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import SuggestionsPage from "./pages/SuggestionsPage";
import SearchResultsPage from "./pages/search/SearchResultsPage";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";
import StatusNotice from "./components/common/StatusNotice";
import SplashLoading from "./components/skeletons/SplashLoading";
import MessagesPage from "./pages/messages/MessagesPage";
import MessageRequestsPage from "./pages/messages/MessageRequestsPage";
import ChatPage from "./pages/messages/ChatPage";
function RedirectWriteToChat() {
  const { userId } = useParams();
  return <Navigate to={`/messages/chat/new/${userId}`} replace />;
}

function AppContent() {
  const { isLoading, isLoggedIn, isAccountVerified } = useAuth();
  const [isLoadingDelayed, setIsLoadingDelayed] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsLoadingDelayed(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      setIsLoadingDelayed(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const location = useLocation();
  const isSettingPage = location.pathname === "/settings";
  const hideMobileTopPadding =
    isLoggedIn &&
    isAccountVerified &&
    location.pathname.startsWith("/messages");

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col gap-4 justify-center items-center px-4 text-center">
        <LoadingSpinner size="lg" />
        {isLoadingDelayed && (
          <StatusNotice
            title="Baglanti gecikmesi algilandi"
            message="Sunucu su an beklenenden gec yanit veriyor. Sorunu cozmeye calisiyoruz, lutfen kisa bir sure sonra tekrar dene."
            actionLabel="Tekrar Dene"
            onAction={() => window.location.reload()}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <SplashLoading />
      {/* Desktop Layout: Sidebar | Content | RightPanel */}
      <div className="hidden md:flex w-full max-w-7xl mx-auto">
        {isLoggedIn && isAccountVerified && <Sidebar />}

        {/* Middle Content - Scrollable */}
        <div
          className={`flex-1 min-w-0 ${
            isLoggedIn && isAccountVerified ? "border-r border-base-300/50" : ""
          }`}
        >
          <Routes>
            {isLoggedIn && isAccountVerified ? (
              <>
                <Route path="/" element={<HomePage />} />
                <Route path="/notifications" element={<NotificationPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route
                  path="/profile/:username/followers"
                  element={<ProfileFollowersPage />}
                />
                <Route
                  path="/profile/:username/following"
                  element={<ProfileFollowersPage />}
                />
                <Route path="/create-post" element={<PostCreate />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/saved-posts" element={<BookmarkedPosts />} />
                <Route path="/hidden-posts" element={<HiddenPosts />} />
                <Route path="/post/:postId" element={<PostDetailPage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
                <Route path="/suggestions" element={<SuggestionsPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/requests" element={<MessageRequestsPage />} />
                <Route path="/messages/chat/new/:userId" element={<ChatPage />} />
                <Route path="/messages/chat/:conversationId" element={<ChatPage />} />
                <Route path="/messages/write/:userId" element={<RedirectWriteToChat />} />
                <Route
                  path="/verify-account"
                  element={
                    !isAccountVerified ? <VerifyAccount /> : <Navigate to="/" />
                  }
                />
              </>
            ) : (
              <>
                <Route
                  path="/"
                  element={
                    isLoggedIn ? (
                      isAccountVerified ? (
                        <HomePage />
                      ) : (
                        <Navigate to="/verify-account" />
                      )
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/login"
                  element={!isLoggedIn ? <LoginPage /> : <Navigate to="/" />}
                />
                <Route
                  path="/signup"
                  element={!isLoggedIn ? <SignupPage /> : <Navigate to="/" />}
                />
                <Route
                  path="/reset-password"
                  element={
                    !isLoggedIn ? <ResetPassword /> : <Navigate to="/" />
                  }
                />
                <Route
                  path="/verify-account"
                  element={
                    isLoggedIn && !isAccountVerified ? (
                      <VerifyAccount />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </div>

        {/* Right Panel - Fixed */}
        {isLoggedIn && isAccountVerified && !isSettingPage && <RightPanel />}
      </div>

      {/* Mobile/Unauthenticated Layout: Single Column */}
      <div className="md:hidden w-full">
        {isLoggedIn && isAccountVerified && <Sidebar />}
        <div
          className={
            isLoggedIn && isAccountVerified && !hideMobileTopPadding
              ? "pt-[calc(3.75rem+env(safe-area-inset-top))]"
              : undefined
          }
        >
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                isAccountVerified ? (
                  <HomePage />
                ) : (
                  <Navigate to="/verify-account" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/signup"
            element={!isLoggedIn ? <SignupPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!isLoggedIn ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/notifications"
            element={
              isLoggedIn ? <NotificationPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/profile/:username"
            element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile/:username/followers"
            element={
              isLoggedIn ? <ProfileFollowersPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/profile/:username/following"
            element={
              isLoggedIn ? <ProfileFollowersPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/create-post"
            element={isLoggedIn ? <PostCreate /> : <Navigate to="/login" />}
          />
          <Route
            path="/verify-account"
            element={
              isLoggedIn && !isAccountVerified ? (
                <VerifyAccount />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/reset-password"
            element={!isLoggedIn ? <ResetPassword /> : <Navigate to={"/"} />}
          />
          <Route path="/settings" element={isLoggedIn && <Settings />} />
          <Route
            path="/saved-posts"
            element={isLoggedIn && <BookmarkedPosts />}
          />
          <Route path="/hidden-posts" element={isLoggedIn && <HiddenPosts />} />
          <Route
            path="/post/:postId"
            element={
              isLoggedIn && isAccountVerified ? (
                <PostDetailPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/edit-profile"
            element={
              isLoggedIn && isAccountVerified ? (
                <EditProfilePage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/suggestions"
            element={
              isLoggedIn && isAccountVerified ? (
                <SuggestionsPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/search"
            element={
              isLoggedIn && isAccountVerified ? (
                <SearchResultsPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/messages"
            element={
              isLoggedIn && isAccountVerified ? (
                <MessagesPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/messages/requests"
            element={
              isLoggedIn && isAccountVerified ? (
                <MessageRequestsPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/messages/chat/new/:userId"
            element={
              isLoggedIn && isAccountVerified ? (
                <ChatPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/messages/chat/:conversationId"
            element={
              isLoggedIn && isAccountVerified ? (
                <ChatPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/messages/write/:userId"
            element={
              isLoggedIn && isAccountVerified ? (
                <RedirectWriteToChat />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
        </div>
      </div>

      <PWAInstallPrompt />
      <Toaster />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
