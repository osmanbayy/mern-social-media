const TAB_CONFIG = [
  { id: "followers", label: "Takipçiler" },
  { id: "following", label: "Takip edilenler" },
];

export default function FollowListTabs({ activeTab, onTabChange }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 sm:px-5">
      <div
        className="flex gap-1 rounded-2xl border border-base-300/50 bg-base-200/35 p-1 shadow-inner dark:bg-base-300/25"
        role="tablist"
        aria-label="Takip listesi sekmeleri"
      >
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`follow-tab-${tab.id}`}
              className={`flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-base-100 text-accent shadow-sm ring-1 ring-base-300/40 dark:bg-base-100/95 dark:text-accent"
                  : "text-base-content/55 hover:bg-base-100/50 hover:text-base-content dark:hover:bg-base-200/40"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
