import { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  return (
    <>
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen mb-14 md:mb-0 pb-15 md:pb-0 overflow-x-hidden">
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
        <Posts feedType={feedType} />
      </div>
    </>
  );
};
export default HomePage;
