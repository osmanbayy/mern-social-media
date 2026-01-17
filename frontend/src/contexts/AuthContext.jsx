import { createContext, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "../api/auth";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const isLoggingOut = localStorage.getItem("_logout_in_progress") === "true";

  const {
    data: authUser,
    isLoading,
    isError,
    refetch: refetchAuthUser,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 0,
    cacheTime: 0,
    enabled: !isLoggingOut,
  });

  const isLoggedIn =
    !isError &&
    authUser !== null &&
    authUser !== undefined &&
    Object.keys(authUser || {}).length > 0;

  const isAccountVerified = authUser?.isAccountVerified;

  const value = {
    authUser,
    isLoading,
    isError,
    isLoggedIn,
    isAccountVerified,
    refetchAuthUser,
    queryClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
