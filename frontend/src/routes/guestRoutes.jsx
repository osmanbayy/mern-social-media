import { Navigate, Route } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/auth/login/LoginPage";
import SignupPage from "../pages/auth/signup/SignupPage";
import ResetPassword from "../pages/ResetPassword";
import VerifyAccount from "../pages/VerifyAccount";

/**
 * `<Routes>` içinde `{guestRouteElements(...)}` olarak kullanın (Fragment + Route).
 */
export function guestRouteElements(isLoggedIn, isAccountVerified) {
  return (
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
      <Route path="/login" element={!isLoggedIn ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/signup" element={!isLoggedIn ? <SignupPage /> : <Navigate to="/" />} />
      <Route path="/reset-password" element={!isLoggedIn ? <ResetPassword /> : <Navigate to="/" />} />
      <Route
        path="/verify-account"
        element={
          isLoggedIn && !isAccountVerified ? <VerifyAccount /> : <Navigate to="/login" />
        }
      />
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/verify-account" : "/login"} replace />}
      />
    </>
  );
}
