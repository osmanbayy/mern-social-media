import { FEED_TYPES } from "../../constants/feedTypes";

function tabClass(active, tabType) {
  const on = active === tabType;
  return `min-w-0 flex-1 rounded-lg px-2 py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
    on
      ? "bg-base-100 text-accent shadow-sm ring-1 ring-base-300/40 dark:bg-base-200/90"
      : "text-base-content/55 hover:bg-base-100/60 hover:text-base-content"
  }`;
}

export default function ProfileFeedTabs({ feedType, onFeedTypeChange }) {
  return (
    <div className="mt-5 rounded-xl bg-base-200/45 p-1 ring-1 ring-base-300/35 dark:bg-base-300/20">
      <div className="flex gap-1">
        <button
          type="button"
          className={tabClass(feedType, FEED_TYPES.POSTS)}
          onClick={() => onFeedTypeChange(FEED_TYPES.POSTS)}
        >
          Gönderiler
        </button>
        <button
          type="button"
          className={tabClass(feedType, FEED_TYPES.LIKES)}
          onClick={() => onFeedTypeChange(FEED_TYPES.LIKES)}
        >
          Beğeniler
        </button>
      </div>
    </div>
  );
}
