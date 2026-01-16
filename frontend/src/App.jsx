/* eslint-disable react-hooks/rules-of-hooks */
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/home/HomePage";
import SignupPage from "./pages/auth/signup/SignupPage";
import LoginPage from "./pages/auth/login/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import ProfilePage from "./pages/profile/ProfilePage";
import ProfileFollowersPage from "./pages/profile/ProfileFollowersPage";
import NotificationPage from "./pages/notification/NotificationPage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { getCurrentUser } from "./api/auth";
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
import OSSvg from "./components/svgs/OS";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";

function App() {
  const isLoggingOut = localStorage.getItem("_logout_in_progress") === "true";
  const [showSplash, setShowSplash] = useState(() => {
    // Check if this is the first load
    const hasVisited = sessionStorage.getItem("_has_visited");
    return !hasVisited;
  });

  const {
    data: authUser,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 0,
    cacheTime: 0,
    enabled: !isLoggingOut,
  });

  const location = useLocation();
  const isSettingPage = location.pathname === "/settings";

  // Handle splash screen
  useEffect(() => {
    if (showSplash && !isLoading) {
      // Mark as visited
      sessionStorage.setItem("_has_visited", "true");

      // Show splash for minimum 1.5 seconds, then navigate
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Navigation will be handled by Routes below
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [showSplash, isLoading]);

  const isLoggedIn =
    !isError &&
    authUser !== null &&
    authUser !== undefined &&
    Object.keys(authUser || {}).length > 0;
  const isAccountVerified = authUser?.isAccountVerified;

  // Show splash screen on first load
  if (showSplash) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="animate-pulse">
          <OSSvg forceDark className="w-40 h-40 md:w-48 md:h-48" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* Desktop Layout: Sidebar | Content | RightPanel */}
      <div className="hidden md:flex w-full max-w-6xl mx-auto">
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
        </Routes>
      </div>

      <PWAInstallPrompt />
      <Toaster />
    </div>
  );
}

export default App;
