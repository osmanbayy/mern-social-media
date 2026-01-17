import { Navigate, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import LogoutDialog from "../modals/LogoutDialog";
import { logout } from "../../api/auth";
import { getNotifications } from "../../api/notifications";
import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";
import MobileSlideMenu from "./MobileSlideMenu";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: logoutMutation } = useMutation({
    mutationFn: async () => {
      const response = await logout();
      return response;
    },
    onSuccess: () => {
      localStorage.setItem("_logout_in_progress", "true");
      queryClient.setQueryData(["authUser"], null);
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.getQueryCache().clear();
      // Keep _has_visited to prevent splash screen on logout
      const hasVisited = sessionStorage.getItem("_has_visited");
      sessionStorage.clear();
      if (hasVisited) {
        sessionStorage.setItem("_has_visited", "true");
      }
      toast.success("Çıkış yapıldı.");
      setTimeout(() => {
        localStorage.removeItem("_logout_in_progress");
        window.location.href = "/login";
      }, 500);
    },
    onError: () => {
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.getQueryCache().clear();
      // Keep _has_visited to prevent splash screen on logout
      const hasVisited = sessionStorage.getItem("_has_visited");
      sessionStorage.clear();
      if (hasVisited) {
        sessionStorage.setItem("_has_visited", "true");
      }
      localStorage.removeItem("_logout_in_progress");
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    },
  });

  const { authUser } = useAuth();

  useEffect(() => {
    if (!authUser) {
      <Navigate to={"/login"} />;
    }
  }, [authUser]);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const isNotRead = notifications?.map((item) => item?.read).includes(false);
  const location = useLocation();
  const isSettingPage = location.pathname === "/settings";

  return (
    <>
      <DesktopSidebar
        authUser={authUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isNotRead={isNotRead}
        isSettingPage={isSettingPage}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />
      <MobileBottomNav
        authUser={authUser}
        isNotRead={isNotRead}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />
      <MobileSlideMenu
        authUser={authUser}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogoutClick={() => {
          setIsMobileMenuOpen(false);
          setTimeout(() => setIsLogoutModalOpen(true), 200);
        }}
      />
      <LogoutDialog 
        handleLogout={logoutMutation}
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
