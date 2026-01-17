import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchUsersPaginated } from "../../api/users";
import { searchPosts } from "../../api/posts";
import Post from "../../components/common/Post";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { LuSearch, LuUser, LuFileText } from "react-icons/lu";
import { Link } from "react-router-dom";
import useFollow from "../../hooks/useFollow";
import { useAuth } from "../../contexts/AuthContext";

const UserResultItem = ({ user }) => {
  const { follow, unfollow, isPending } = useFollow(user._id);
  const { authUser } = useAuth();

  const amIFollowing = authUser?.following?.some(
    (userId) => userId._id === user._id || userId === user._id
  ) || false;

  return (
    <Link
      to={`/profile/${user.username}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200/50 transition-all duration-200 group"
    >
      <div className="avatar flex-shrink-0">
        <div className="w-12 h-12 rounded-full ring-2 ring-base-300 group-hover:ring-primary transition-all duration-300">
          <img
            src={user.profileImage || defaultProfilePicture}
            className="w-full h-full rounded-full object-cover"
            alt={user.fullname}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
          {user.fullname}
        </p>
        <p className="text-xs text-base-content/60 truncate">@{user.username}</p>
        {user.bio && (
          <p className="text-xs text-base-content/70 mt-1 line-clamp-2">{user.bio}</p>
        )}
      </div>
      {authUser?._id !== user._id && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (amIFollowing) {
              unfollow();
            } else {
              follow();
            }
          }}
          disabled={isPending}
          className={`btn btn-sm rounded-full px-4 flex-shrink-0 ${
            amIFollowing
              ? "btn-outline"
              : "btn-primary text-white"
          }`}
        >
          {isPending ? (
            <LoadingSpinner size="xs" />
          ) : amIFollowing ? (
            "Takibi Bırak"
          ) : (
            "Takip Et"
          )}
        </button>
      )}
    </Link>
  );
};

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);

  // User search state
  const [userPage, setUserPage] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [userHasMore, setUserHasMore] = useState(false);

  // Post search state
  const [postPage, setPostPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [postHasMore, setPostHasMore] = useState(false);

  // Fetch users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["searchUsers", query, userPage],
    queryFn: () => searchUsersPaginated(query, userPage, 5),
    enabled: !!query && query.trim().length > 0,
  });

  // Fetch posts
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["searchPosts", query, postPage],
    queryFn: () => searchPosts(query, postPage, 5),
    enabled: !!query && query.trim().length > 0,
  });

  // Update users when data changes
  useEffect(() => {
    if (usersData) {
      if (userPage === 1) {
        setAllUsers(usersData.users || []);
      } else {
        setAllUsers((prev) => [...prev, ...(usersData.users || [])]);
      }
      setUserHasMore(usersData.hasMore || false);
    }
  }, [usersData, userPage]);

  // Update posts when data changes
  useEffect(() => {
    if (postsData) {
      if (postPage === 1) {
        setAllPosts(postsData.posts || []);
      } else {
        setAllPosts((prev) => [...prev, ...(postsData.posts || [])]);
      }
      setPostHasMore(postsData.hasMore || false);
    }
  }, [postsData, postPage]);

  // Reset when query changes
  useEffect(() => {
    setUserPage(1);
    setPostPage(1);
    setAllUsers([]);
    setAllPosts([]);
    setSearchInput(query);
    
    // Check if cached data exists for the new query and use it immediately
    if (query && query.trim().length > 0) {
      const cachedUsersData = queryClient.getQueryData(["searchUsers", query, 1]);
      const cachedPostsData = queryClient.getQueryData(["searchPosts", query, 1]);
      
      if (cachedUsersData) {
        setAllUsers(cachedUsersData.users || []);
        setUserHasMore(cachedUsersData.hasMore || false);
      }
      
      if (cachedPostsData) {
        setAllPosts(cachedPostsData.posts || []);
        setPostHasMore(cachedPostsData.hasMore || false);
      }
    }
  }, [query, queryClient]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const loadMoreUsers = () => {
    setUserPage((prev) => prev + 1);
  };

  const loadMorePosts = () => {
    setPostPage((prev) => prev + 1);
  };

  if (!query || query.trim().length === 0) {
    return (
      <div className="w-full min-h-screen pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Ara..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-base-200/50 border border-base-300/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
            </div>
          </form>

          <div className="text-center py-12">
            <LuSearch className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
            <p className="text-base-content/60">Arama yapmak için bir şeyler yazın</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Ara..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full bg-base-200/50 border border-base-300/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            />
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
          </div>
        </form>

        {/* Users Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <LuUser className="w-5 h-5 text-base-content/60" />
            <h2 className="text-lg font-bold text-base-content">Kullanıcılar</h2>
            {isLoadingUsers && userPage === 1 && (
              <LoadingSpinner size="sm" />
            )}
          </div>

          {!isLoadingUsers && userPage === 1 && allUsers.length === 0 && (
            <p className="text-base-content/60 text-center py-8">Kullanıcı bulunamadı</p>
          )}

          <div className="space-y-3">
            {allUsers.map((user) => (
              <UserResultItem key={user._id} user={user} />
            ))}
          </div>

          {userHasMore && (
            <button
              onClick={loadMoreUsers}
              disabled={isLoadingUsers}
              className="w-full mt-4 py-2 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isLoadingUsers ? (
                <LoadingSpinner size="sm" />
              ) : (
                "Daha fazla kullanıcı göster"
              )}
            </button>
          )}
        </div>

        {/* Posts Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <LuFileText className="w-5 h-5 text-base-content/60" />
            <h2 className="text-lg font-bold text-base-content">Gönderiler</h2>
            {isLoadingPosts && postPage === 1 && (
              <LoadingSpinner size="sm" />
            )}
          </div>

          {!isLoadingPosts && postPage === 1 && allPosts.length === 0 && (
            <p className="text-base-content/60 text-center py-8">Gönderi bulunamadı</p>
          )}

          <div className="space-y-4">
            {allPosts.map((post) => (
              <Post key={post._id} post={post} />
            ))}
          </div>

          {postHasMore && (
            <button
              onClick={loadMorePosts}
              disabled={isLoadingPosts}
              className="w-full mt-4 py-2 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isLoadingPosts ? (
                <LoadingSpinner size="sm" />
              ) : (
                "Daha fazla gönderi göster"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
