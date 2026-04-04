import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function useSearchQueryInput() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlQuery = searchParams.get("q") ?? "";
  const [input, setInput] = useState(urlQuery);

  useEffect(() => {
    setInput(urlQuery);
  }, [urlQuery]);

  const submitSearch = useCallback(
    (e) => {
      e.preventDefault();
      const t = input.trim();
      if (t) navigate(`/search?q=${encodeURIComponent(t)}`);
    },
    [input, navigate]
  );

  const trimmedQuery = urlQuery.trim();
  const hasSearchQuery = trimmedQuery.length > 0;

  return {
    urlQuery,
    trimmedQuery,
    hasSearchQuery,
    input,
    setInput,
    submitSearch,
  };
}
