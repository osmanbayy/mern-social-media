import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { useAuth } from "./contexts/AuthContext";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";
import StatusNotice from "./components/common/StatusNotice";
import SplashLoading from "./components/skeletons/SplashLoading";
import { authenticatedRouteElements } from "./routes/authenticatedRoutes";
import { guestRouteElements } from "./routes/guestRoutes";

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
    isLoggedIn && isAccountVerified && location.pathname.startsWith("/messages");

  const showShell = isLoggedIn && isAccountVerified;

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
      <div className="flex w-full max-w-7xl mx-auto flex-col md:flex-row">
        {showShell && <Sidebar />}

        <div
          className={`flex-1 min-w-0 ${
            showShell ? "md:border-r md:border-base-300/50" : ""
          }`}
        >
          <div
            className={
              showShell && !hideMobileTopPadding
                ? "pt-[calc(3.75rem+env(safe-area-inset-top))] md:pt-0"
                : undefined
            }
          >
            <Routes>
              {showShell
                ? authenticatedRouteElements(isAccountVerified)
                : guestRouteElements(isLoggedIn, isAccountVerified)}
            </Routes>
          </div>
        </div>

        {showShell && !isSettingPage && <RightPanel />}
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
