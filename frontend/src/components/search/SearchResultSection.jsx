import LoadingSpinner from "../common/LoadingSpinner";

export default function SearchResultSection({
  title,
  icon: Icon,
  isPendingFirst,
  showEmpty,
  emptyMessage,
  hasMore,
  onLoadMore,
  isFetchingMore,
  loadMoreLabel,
  children,
}) {
  return (
    <section className="mb-10 last:mb-0">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 shrink-0 text-base-content/60" />
        <h2 className="text-lg font-bold text-base-content">{title}</h2>
        {isPendingFirst ? <LoadingSpinner size="sm" /> : null}
      </div>

      {showEmpty ? (
        <p className="py-8 text-center text-sm text-base-content/60">{emptyMessage}</p>
      ) : (
        children
      )}

      {hasMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isFetchingMore}
          className="btn btn-block mt-4 rounded-xl border border-base-300/50 bg-base-200/40 text-sm font-medium hover:bg-base-200/70 disabled:opacity-50 dark:bg-base-300/20"
        >
          {isFetchingMore ? <LoadingSpinner size="sm" /> : loadMoreLabel}
        </button>
      ) : null}
    </section>
  );
}
