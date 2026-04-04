import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SuggestedUserRow from "../components/common/SuggestedUserRow";
import { getSuggestedUsers } from "../api/users";
import { SUGGESTED_USERS_QUERY_KEYS } from "../constants/suggestedUsersQueries";
import { useFollowSuggestedUserMutation } from "../hooks/useFollowSuggestedUserMutation";
import { IoArrowBack } from "react-icons/io5";

const SuggestionsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // 10 kullanıcı per page

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["suggestedUsersPage", page], // Farklı query key kullan
    queryFn: () => getSuggestedUsers(page, limit),
    enabled: hasMore,
  });

  useEffect(() => {
    if (data) {
      const users = Array.isArray(data) ? data : data.users || [];
      const hasMoreData = Array.isArray(data) ? false : (data.hasMore || false);
      
      if (page === 1) {
        // First page - replace all users
        setAllUsers(users);
      } else {
        // Subsequent pages - append users
        setAllUsers((prev) => {
          // Avoid duplicates
          const existingIds = new Set(prev.map(u => u._id));
          const newUsers = users.filter(u => !existingIds.has(u._id));
          return [...prev, ...newUsers];
        });
      }
      
      setHasMore(hasMoreData);
    }
  }, [data, page]);

  const { follow, loadingUserId } = useFollowSuggestedUserMutation({
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

  // Scroll to top when page first loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-base-100/95 backdrop-blur-xl border-b border-base-300/50 px-5 py-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 transition-all duration-200 hover:scale-110"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-xl">Kimi takip etmeli?</h2>
      </div>

      {/* Users List */}
      <div className="p-5">
        {isLoading && page === 1 ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : allUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 shadow-lg">
              <span className="text-5xl">👥</span>
            </div>
            <p className="text-base-content/80 font-semibold text-lg mb-2">
              Henüz öneri yok
            </p>
            <p className="text-base-content/50 text-sm">
              Tüm kullanıcıları zaten takip ediyorsunuz.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {allUsers.map((user) => (
              <SuggestedUserRow
                key={user._id}
                user={user}
                profileHref={`/profile/${user.username}`}
                variant="page"
                isFollowLoading={loadingUserId === user._id}
                onFollowClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  follow(user._id);
                }}
              />
            ))}
          </div>
        )}

        {/* Loading indicator for pagination */}
        {isFetching && page > 1 && (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="md" />
          </div>
        )}

        {/* End of list message */}
        {!hasMore && allUsers.length > 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-base-content/60 text-sm">
              Tüm önerileri görüntülediniz
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsPage;
