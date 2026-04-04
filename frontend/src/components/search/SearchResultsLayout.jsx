import SearchBar from "../common/SearchBar";

export default function SearchResultsLayout({ searchInput, onSearchInputChange, onSubmit, children }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-base-200/35 via-base-100 to-base-100 pb-20 dark:from-base-300/15 lg:pb-0">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-5">
        <SearchBar
          variant="page"
          formClassName="mb-6"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onSubmit={onSubmit}
          placeholder="Ara..."
        />
        {children}
      </div>
    </div>
  );
}
