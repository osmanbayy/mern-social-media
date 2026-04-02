import { POST_FEED_TYPES } from "../../constants/postFeedTypes";

const tabLabelClass = (active) =>
  `font-medium transition-colors ${
    active ? "text-base-content" : "text-base-content/20 group-hover:text-base-content"
  }`;

export default function HomeFeedTabs({ feedType, onFeedTypeChange }) {
  return (
    <div className="flex w-full border-b border-base-300/50 bg-base-100/95 backdrop-blur-md sticky top-0 z-10">
      <button
        type="button"
        className="flex justify-center flex-1 p-4 hover:bg-base-200/50 transition-all duration-300 cursor-pointer relative group"
        onClick={() => onFeedTypeChange(POST_FEED_TYPES.FOR_YOU)}
      >
        <span className={tabLabelClass(feedType === POST_FEED_TYPES.FOR_YOU)}>Senin İçin</span>
        {feedType === POST_FEED_TYPES.FOR_YOU && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 bg-base-content h-1 rounded-full" />
        )}
      </button>
      <button
        type="button"
        className="flex justify-center flex-1 p-4 hover:bg-base-200/50 transition-all duration-300 cursor-pointer relative group"
        onClick={() => onFeedTypeChange(POST_FEED_TYPES.FOLLOWING)}
      >
        <span className={tabLabelClass(feedType === POST_FEED_TYPES.FOLLOWING)}>Takip Ettiklerin</span>
        {feedType === POST_FEED_TYPES.FOLLOWING && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 bg-base-content h-1 rounded-full" />
        )}
      </button>
    </div>
  );
}
