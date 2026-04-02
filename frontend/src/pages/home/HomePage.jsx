import { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import HomeFeedTabs from "../../components/home/HomeFeedTabs";
import { POST_FEED_TYPES } from "../../constants/postFeedTypes";

const HomePage = () => {
  const [feedType, setFeedType] = useState(POST_FEED_TYPES.FOR_YOU);

  return (
    <div className="w-full min-h-screen mb-14 md:mb-0">
      <HomeFeedTabs feedType={feedType} onFeedTypeChange={setFeedType} />
      <CreatePost />
      <Posts feedType={feedType} />
    </div>
  );
};

export default HomePage;
