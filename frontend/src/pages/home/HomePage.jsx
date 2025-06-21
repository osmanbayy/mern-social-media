import { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  return (
    <>
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen mb-14 md:mb-0 pb-15 md:pb-0">
        {/* Header */}
        <div className="flex w-full border-b border-gray-600">
          <div
            className={
              "flex justify-center flex-1 p-3 hover:bg-base-200 transition duration-300 cursor-pointer relative"
            }
            onClick={() => setFeedType("forYou")}
          >
            Senin İçin
            {feedType === "forYou" && (
              <div className="absolute bottom-0 w-10 bg-indigo-500 h-1 rounded-full"></div>
            )}
          </div>
          <div
            className="flex justify-center flex-1 p-3 hover:bg-base-200 transition duration-300 cursor-pointer relative"
            onClick={() => setFeedType("following")}
          >
            Takip Ettiklerin
            {feedType === "following" && (
              <div className="absolute bottom-0 bg-indigo-500 w-10 h-1 rounded-full"></div>
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
