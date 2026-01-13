import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import defaultProfilePicture from "../assets/avatar-placeholder.png";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { followUser, getSuggestedUsers } from "../api/users";
import toast from "react-hot-toast";
import { IoArrowBack } from "react-icons/io5";

const SuggestionsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState(null);
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

  const { mutate: follow } = useMutation({
    mutationFn: (userId) => followUser(userId),
    onMutate: (userId) => {
      setLoadingUserId(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedUsersPage"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setLoadingUserId(null);
      toast.success("Kullanıcı takip edildi");
    },
    onError: (error) => {
      toast.error(error.message);
      setLoadingUserId(null);
    },
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
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
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
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4 p-4 rounded-xl hover:bg-base-200/50 transition-all duration-300 group border border-base-300/50"
                key={user._id}
              >
                <div className="flex gap-3 items-center flex-1 min-w-0">
                  <div className="avatar flex-shrink-0">
                    <div className="w-12 h-12 rounded-full ring-2 ring-base-300 group-hover:ring-primary transition-all duration-300">
                      <img
                        src={user.profileImage || defaultProfilePicture}
                        className="w-full h-full rounded-full object-cover"
                        alt={user.fullname}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-semibold tracking-tight truncate group-hover:text-primary transition-colors">
                      {user.fullname}
                    </span>
                    <span className="text-sm text-base-content/60 truncate">
                      @{user.username}
                    </span>
                    {user.bio && (
                      <span className="text-sm text-base-content/50 mt-1 line-clamp-2">
                        {user.bio}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    className="btn btn-primary btn-sm rounded-full text-white hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                    disabled={loadingUserId === user._id}
                  >
                    {loadingUserId === user._id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Takip et"
                    )}
                  </button>
                </div>
              </Link>
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
