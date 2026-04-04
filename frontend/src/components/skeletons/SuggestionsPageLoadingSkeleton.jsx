import { SUGGESTIONS_PAGE } from "../../constants/suggestionsPage";
import SuggestionRowSkeleton from "./SuggestionRowSkeleton";

/** Öneriler sayfası ilk yükleme — kart + başlık şeridi + satır iskeletleri */
const SuggestionsPageLoadingSkeleton = () => (
  <section className="overflow-hidden rounded-3xl border border-base-300/60 bg-gradient-to-b from-base-100 via-base-100 to-base-200/30 shadow-xl ring-1 ring-black/5 dark:to-base-300/15 dark:ring-white/5">
    <div className="border-b border-base-300/40 bg-gradient-to-r from-accent/[0.07] to-transparent px-4 py-3.5 sm:px-5">
      <div className="skeleton h-4 w-48 rounded-full" />
      <div className="skeleton mt-2 h-3 w-32 rounded-full opacity-70" />
    </div>
    <div className="divide-y divide-base-300/45">
      {Array.from({ length: SUGGESTIONS_PAGE.INITIAL_SKELETON_ROWS }).map((_, i) => (
        <SuggestionRowSkeleton key={i} />
      ))}
    </div>
  </section>
);

export default SuggestionsPageLoadingSkeleton;
