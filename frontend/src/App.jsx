/* eslint-disable react-hooks/rules-of-hooks */
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
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

function App() {
  const isLoggingOut = localStorage.getItem("_logout_in_progress") === "true";
  
  const { data: authUser, isLoading, isError } = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 0,
    cacheTime: 0,
    enabled: !isLoggingOut,
  });

  const location = useLocation();
  const isSettingPage = location.pathname === "/settings";

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isLoggedIn = !isError && authUser !== null && authUser !== undefined && Object.keys(authUser || {}).length > 0;
  const isAccountVerified = authUser?.isAccountVerified;
  
  return (
    <div className="flex max-w-6xl mx-auto">
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
          element={isLoggedIn ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username/followers"
          element={isLoggedIn ? <ProfileFollowersPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username/following"
          element={isLoggedIn ? <ProfileFollowersPage /> : <Navigate to="/login" />}
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
        <Route path="/settings"
          element={isLoggedIn && <Settings /> }
        />
        <Route path="/saved-posts" element={isLoggedIn && <BookmarkedPosts />} />
        <Route path="/hidden-posts" element={isLoggedIn && <HiddenPosts />} />
        <Route path="/post/:postId" element={isLoggedIn && isAccountVerified ? <PostDetailPage /> : <Navigate to="/login" />} />
        <Route path="/edit-profile" element={isLoggedIn && isAccountVerified ? <EditProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      {isLoggedIn && isAccountVerified && !isSettingPage && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
