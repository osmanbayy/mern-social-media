import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");
  const location = useLocation();
  const postsRef = useRef(null);
  const previousPathRef = useRef(location.pathname);

  // Refetch posts when returning to home page from another page
  useEffect(() => {
    const isReturningToHome = previousPathRef.current !== "/" && location.pathname === "/";
    
    if (isReturningToHome && postsRef.current) {
      // Directly refetch posts when returning to home page
      postsRef.current.refetch();
    }
    
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen mb-14 md:mb-0">
        {/* Header */}
        <div className="flex w-full border-b border-base-300/50 bg-base-100/80 backdrop-blur-sm sticky top-0 z-10">
          <div
            className={
              "flex justify-center flex-1 p-4 hover:bg-base-200/50 transition-all duration-300 cursor-pointer relative group"
            }
            onClick={() => setFeedType("forYou")}
          >
            <span className={`font-medium transition-colors ${
              feedType === "forYou" ? "text-primary" : "text-base-content/70 group-hover:text-base-content"
            }`}>
              Senin İçin
            </span>
            {feedType === "forYou" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 bg-primary h-1 rounded-full"></div>
            )}
          </div>
          <div
            className="flex justify-center flex-1 p-4 hover:bg-base-200/50 transition-all duration-300 cursor-pointer relative group"
            onClick={() => setFeedType("following")}
          >
            <span className={`font-medium transition-colors ${
              feedType === "following" ? "text-primary" : "text-base-content/70 group-hover:text-base-content"
            }`}>
              Takip Ettiklerin
            </span>
            {feedType === "following" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 bg-primary h-1 rounded-full"></div>
            )}
          </div>
        </div>

        {/*  CREATE POST INPUT */}
        <CreatePost />

        {/* POSTS */}
        <Posts ref={postsRef} feedType={feedType} />
    </div>
  );
};
export default HomePage;
