/** Öneriler sayfası liste satırı — yükleme iskeleti */
const SuggestionRowSkeleton = () => (
  <div className="flex animate-pulse items-center gap-4 px-4 py-4 sm:px-5">
    <div className="skeleton h-[52px] w-[52px] shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="skeleton h-4 w-40 max-w-[60%] rounded-full" />
      <div className="skeleton h-3 w-28 rounded-full" />
      <div className="skeleton mt-2 h-3 w-full max-w-md rounded-full" />
    </div>
    <div className="skeleton h-9 w-24 shrink-0 rounded-full" />
  </div>
);

export default SuggestionRowSkeleton;
