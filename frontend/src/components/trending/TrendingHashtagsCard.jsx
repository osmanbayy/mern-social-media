import { Link } from "react-router-dom";
import { LuHash } from "react-icons/lu";
import { useTrendingHashtags } from "../../hooks/useTrendingHashtags";

function formatPostCount(n) {
  if (typeof n !== "number" || n < 0) return "—";
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")} B`;
  }
  return String(n);
}

/**
 * @param {{ variant?: 'panel' | 'page', limit?: number }} props
 */
export default function TrendingHashtagsCard({ variant = "page", limit = 10 }) {
  const { data, isPending, isError } = useTrendingHashtags({ limit, sinceDays: 7 });

  const trends = data?.trends ?? [];
  const sinceDays = data?.sinceDays ?? 7;

  const shell =
    variant === "panel"
      ? "w-full overflow-hidden rounded-3xl border border-base-300/60 bg-gradient-to-b from-base-100 via-base-100 to-base-200/25 shadow-xl ring-1 ring-black/5 dark:from-base-100 dark:via-base-100 dark:to-base-300/20 dark:ring-white/5"
      : "w-full overflow-hidden rounded-3xl border border-base-300/50 bg-base-100/80 shadow-lg ring-1 ring-black/5 dark:bg-base-200/30 dark:ring-white/5";

  return (
    <section className={shell} aria-labelledby="trending-hashtags-heading">
      <div className="border-b border-base-300/40 bg-gradient-to-r from-primary/10 to-transparent px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <LuHash className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <h2 id="trending-hashtags-heading" className="text-[15px] font-bold leading-tight text-base-content">
              Gündem
            </h2>
            <p className="text-xs text-base-content/55">Son {sinceDays} gün · OnSekiz</p>
          </div>
        </div>
      </div>

      <div className="p-2">
        {isPending && (
          <ul className="flex flex-col gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className="h-12 animate-pulse rounded-2xl bg-base-300/40 dark:bg-base-300/25"
              />
            ))}
          </ul>
        )}

        {!isPending && isError && (
          <p className="px-2 py-4 text-center text-sm text-base-content/60">Gündem yüklenemedi.</p>
        )}

        {!isPending && !isError && trends.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-base-content/55">Henüz gündem etiketi yok.</p>
        )}

        {!isPending && !isError && trends.length > 0 && (
          <ol className="flex flex-col gap-0.5">
            {trends.map((row, index) => (
              <li key={row.tag}>
                <Link
                  to={`/hashtag/${encodeURIComponent(row.tag)}`}
                  className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-base-200/50 dark:hover:bg-base-300/25"
                >
                  <span className="min-w-0">
                    <span className="text-[11px] font-medium text-base-content/45">{(index + 1).toString()}</span>
                    <span className="ml-2 truncate text-[15px] font-semibold text-base-content">
                      #{row.tag}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-base-content/50">
                    {formatPostCount(row.count)} gönderi
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
