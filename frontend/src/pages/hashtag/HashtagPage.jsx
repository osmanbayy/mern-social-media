import { useMemo } from "react";
import { useParams } from "react-router-dom";
import Post from "../../components/common/Post";
import PageShell from "../../components/layout/PageShell";
import { useHashtagPosts } from "../../hooks/useHashtagPosts";

function normalizeTagFromRoute(raw) {
  if (raw == null) return "";
  try {
    return decodeURIComponent(String(raw)).replace(/^#/, "").trim().toLowerCase();
  } catch {
    return "";
  }
}

export default function HashtagPage() {
  const { tag: tagParam } = useParams();
  const normalizedTag = useMemo(() => normalizeTagFromRoute(tagParam), [tagParam]);

  const { posts, fetchNextPage, hasNextPage, isPending, isFetchingNextPage, total } =
    useHashtagPosts(normalizedTag);

  return (
    <PageShell variant="scroll">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-5">
        <header className="mb-6 border-b border-base-300/40 pb-4">
          <h1 className="text-xl font-bold text-base-content sm:text-2xl">
            {normalizedTag ? (
              <>
                Etiket: <span className="text-primary">#{normalizedTag}</span>
              </>
            ) : (
              "Etiket"
            )}
          </h1>
          {normalizedTag && total != null && (
            <p className="mt-1 text-sm text-base-content/60">
              {total} gönderi
            </p>
          )}
        </header>

        {!normalizedTag ? (
          <p className="text-center text-base-content/60">Geçersiz etiket.</p>
        ) : isPending ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-lg loading-spinner text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-base-content/60">Bu etiketle henüz gönderi yok.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Post key={post._id} post={post} />
            ))}
          </div>
        )}

        {hasNextPage && !isPending && normalizedTag && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="btn btn-outline btn-sm rounded-full border-primary/40"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Daha fazla göster"
              )}
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
