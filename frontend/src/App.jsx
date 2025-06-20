/* eslint-disable react-hooks/rules-of-hooks */
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignupPage from "./pages/auth/signup/SignupPage";
import LoginPage from "./pages/auth/login/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import ProfilePage from "./pages/profile/ProfilePage";
import NotificationPage from "./pages/notification/NotificationPage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import PostCreate from "./components/common/PostCreate";
import VerifyAccount from "./pages/VerifyAccount";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import BookmarkedPosts from "./pages/BookmarkedPosts";
import HiddenPosts from "./pages/HiddenPosts";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Hay aksi. Bir şeyler yanlış gitti.");
      }
      return data;
    },

    retry: false,
  });

  if (isLoading || authUser === null) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isAccountVerified = authUser?.isAccountVerified;

  const location = useLocation();
  const isSettingPage = location.pathname === "/settings";
  
  return (
    <div className="flex max-w-6xl mx-auto">
      {authUser && isAccountVerified && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
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
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/create-post"
          element={authUser ? <PostCreate /> : <Navigate to="/login" />}
        />
        <Route
          path="/verify-account"
          element={
            authUser && !isAccountVerified ? (
              <VerifyAccount />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/reset-password"
          element={!authUser ? <ResetPassword /> : <Navigate to={"/"} />}
        />
        <Route path="/settings"
          element={authUser && <Settings /> }
        />
        <Route path="/saved-posts" element={authUser && <BookmarkedPosts />} />
        <Route path="/hidden-posts" element={authUser && <HiddenPosts />} />
      </Routes>
      {authUser && isAccountVerified && !isSettingPage && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
