import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import OSSvg from "../svgs/OS";

const SplashLoading = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if this is the first load
    const hasVisited = sessionStorage.getItem("_has_visited");
    return !hasVisited;
  });

  const { isLoading } = useAuth();

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

  // Show splash screen on first load
  if (showSplash) {
    return (
      <div className="relative z-[99999] h-screen w-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="animate-pulse">
          <OSSvg forceDark className="w-40 h-40 md:w-48 md:h-48" />
        </div>
      </div>
    );
  }
};

export default SplashLoading;
