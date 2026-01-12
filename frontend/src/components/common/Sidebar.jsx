import { Navigate, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import LogoutDialog from "../modals/LogoutDialog";
import { logout } from "../../api/auth";
import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";
import MobileSlideMenu from "./MobileSlideMenu";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: logoutMutation } = useMutation({
    mutationFn: async () => {
      await logout();
      await new Promise(resolve => setTimeout(resolve, 200));
    },
    onSuccess: () => {
      // Clear all queries and cache
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.getQueryCache().clear();
      
      localStorage.clear();
      sessionStorage.clear();
      
      toast.success("Çıkış yapıldı.");
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
    },
    onError: (error) => {
      console.error("Çıkış hatası:", error.message);
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.getQueryCache().clear();
      localStorage.clear();
      sessionStorage.clear();
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
    },
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  useEffect(() => {
    if (!authUser) {
      <Navigate to={"/login"} />;
    }
  }, [authUser]);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/notifications");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Bir şeyler yanlış gitti");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
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
      />
      <LogoutDialog handleLogout={logoutMutation} />
    </>
  );
};

export default Sidebar;
