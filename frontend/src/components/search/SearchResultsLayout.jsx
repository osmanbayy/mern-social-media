import SearchBar from "../common/SearchBar";
import PageShell from "../layout/PageShell";

export default function SearchResultsLayout({ searchInput, onSearchInputChange, onSubmit, children }) {
  return (
    <PageShell variant="scroll">
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
    </PageShell>
  );
}
