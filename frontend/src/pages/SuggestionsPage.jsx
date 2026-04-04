import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LuSparkles, LuUsers } from "react-icons/lu";
import { IoArrowBack } from "react-icons/io5";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SuggestedUserRow from "../components/common/SuggestedUserRow";
import { getSuggestedUsers } from "../api/users";
import { SUGGESTED_USERS_QUERY_KEYS } from "../constants/suggestedUsersQueries";
import { SUGGESTIONS_PAGE } from "../constants/suggestionsPage";
import { SuggestionsPageLoadingSkeleton } from "../components/skeletons";
import { useFollowSuggestedUserMutation } from "../hooks/useFollowSuggestedUserMutation";
import { useAuth } from "../contexts/AuthContext";
import { isFollowingUser } from "../utils/followStatus";

const SuggestionsPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["suggestedUsersPage", page],
    queryFn: () => getSuggestedUsers(page, SUGGESTIONS_PAGE.PAGE_LIMIT),
    enabled: hasMore,
  });

  useEffect(() => {
    if (data) {
      const users = Array.isArray(data) ? data : data.users || [];
      const hasMoreData = Array.isArray(data) ? false : data.hasMore || false;

      if (page === 1) {
        setAllUsers(users);
      } else {
        setAllUsers((prev) => {
          const existingIds = new Set(prev.map((u) => u._id));
          const newUsers = users.filter((u) => !existingIds.has(u._id));
          return [...prev, ...newUsers];
        });
      }

      setHasMore(hasMoreData);
    }
  }, [data, page]);

  const { follow, loadingUserId, isFollowed } = useFollowSuggestedUserMutation({
    invalidateQueryKeys: [
      SUGGESTED_USERS_QUERY_KEYS.rightPanel,
      SUGGESTED_USERS_QUERY_KEYS.mobile,
      SUGGESTED_USERS_QUERY_KEYS.paginatedPrefix,
      ["authUser"],
    ],
    successToast: "Kullanıcı takip edildi",
  });

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200 &&
      !isFetching &&
      hasMore &&
      !isLoading
    ) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore, isLoading]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-base-200/40 via-base-100 to-base-100 pb-24 pt-0 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-base-300/50 bg-base-100/80 shadow-sm backdrop-blur-xl dark:bg-base-100/90">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3.5 sm:px-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-circle btn-ghost btn-sm shrink-0 text-base-content/80 transition hover:bg-base-200 hover:text-base-content"
            aria-label="Geri"
          >
            <IoArrowBack className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent shadow-inner ring-1 ring-accent/15">
              <LuSparkles className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-base-content sm:text-xl">
                Kimi takip etmeli?
              </h1>
              <p className="truncate text-xs text-base-content/55 sm:text-[13px]">
                İlgi alanlarına göre öneriler
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-5">
        {!(isLoading && page === 1) && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-base-300/50 bg-base-100/80 px-4 py-3.5 shadow-sm ring-1 ring-black/[0.03] dark:bg-base-100/60 dark:ring-white/[0.06]">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
              <LuUsers className="h-4 w-4" strokeWidth={2} />
            </div>
            <p className="text-sm leading-relaxed text-base-content/70">
              Yeni içerikler ve sohbetler keşfetmek için önerilen profilleri takip edebilirsin. Profil fotoğrafına
              tıklayarak detaya gidebilirsin.
            </p>
          </div>
        )}

        {isLoading && page === 1 ? (
          <SuggestionsPageLoadingSkeleton />
        ) : allUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-base-300/60 bg-gradient-to-b from-base-100 to-base-200/25 px-6 py-16 text-center shadow-lg ring-1 ring-black/5 dark:to-base-300/20 dark:ring-white/5">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent/15 via-accent/8 to-transparent text-accent shadow-inner ring-1 ring-accent/20">
              <LuUsers className="h-10 w-10 opacity-90" strokeWidth={1.75} />
            </div>
            <p className="mb-2 text-lg font-semibold text-base-content">Henüz öneri yok</p>
            <p className="max-w-sm text-sm leading-relaxed text-base-content/55">
              Şu an gösterilecek yeni profil bulunmuyor. Takip ettikçe burası yenilenecek.
            </p>
          </div>
        ) : (
          <section className="overflow-hidden rounded-3xl border border-base-300/60 bg-gradient-to-b from-base-100 via-base-100 to-base-200/25 shadow-xl ring-1 ring-black/5 dark:via-base-100 dark:to-base-300/20 dark:ring-white/5">
            <div className="border-b border-base-300/40 bg-gradient-to-r from-accent/[0.08] to-transparent px-4 py-4 sm:px-5">
              <h2 className="text-[15px] font-bold tracking-tight text-base-content">Önerilen profiller</h2>
              <p className="mt-0.5 text-xs text-base-content/55">Senin için seçildi · {allUsers.length} kişi</p>
            </div>

            <div className="divide-y divide-base-300/45">
              {allUsers.map((user) => (
                <SuggestedUserRow
                  key={user._id}
                  user={user}
                  profileHref={`/profile/${user.username}`}
                  variant="page"
                  isFollowLoading={loadingUserId === user._id}
                  isFollowing={isFollowed(user._id) || isFollowingUser(authUser, user._id)}
                  onFollowClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    follow(user._id);
                  }}
                />
              ))}
            </div>

            {isFetching && page > 1 && (
              <div className="flex justify-center border-t border-base-300/40 py-6">
                <LoadingSpinner size="md" />
              </div>
            )}

            {!hasMore && allUsers.length > 0 && (
              <div className="border-t border-base-300/40 bg-base-200/20 px-4 py-6 text-center dark:bg-base-300/10">
                <p className="text-sm font-medium text-base-content/65">Tüm önerileri görüntüledin</p>
                <p className="mt-1 text-xs text-base-content/45">Yeni öneriler için daha sonra tekrar bak</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default SuggestionsPage;
