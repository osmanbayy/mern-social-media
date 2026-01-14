import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft } from "react-icons/fa6";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { getUserProfile, getFollowers, getFollowing } from "../../api/users";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import UserRowSkeleton from "../../components/skeletons/UserRowSkeleton";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFollow from "../../hooks/useFollow";

const UserRow = ({
  item,
  authUser,
  navigate,
  showMutualLabel = false,
  showNotFollowingBackLabel = false,
}) => {
  const { follow, isPending } = useFollow(item._id);

  const iFollowThem = authUser?.following?.includes(item._id);
  const theyFollowMe = item?.followers?.includes?.(authUser?._id);
  const isMutual = iFollowThem && theyFollowMe;

  const handleClickProfile = () => {
    navigate(`/profile/${item.username}`);
  };

  const handleFollowClick = (e) => {
    e.stopPropagation();
    follow();
  };

  return (
    <button
      type="button"
      className="flex w-full items-center justify-between px-4 py-3 hover:bg-base-200/70 transition-colors text-left"
      onClick={handleClickProfile}
    >
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={item.profileImage || defaultProfilePicture}
              alt={item.fullname}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-semibold text-sm">{item.fullname}</span>
          <span className="text-xs text-base-content/60">@{item.username}</span>
          {showMutualLabel && isMutual && (
            <span className="mt-0.5 text-[11px] text-emerald-500">
              Birbirinizi takip ediyorsunuz
            </span>
          )}
          {showNotFollowingBackLabel && !theyFollowMe && (
            <span className="mt-0.5 text-[11px] text-rose-500">
              Seni takip etmiyor
            </span>
          )}
        </div>
      </div>

      {authUser?._id !== item._id && (
        <button
          type="button"
          className={`btn btn-xs rounded-full px-3 ${
            iFollowThem ? "btn-outline" : "btn-primary text-white"
          }`}
          onClick={handleFollowClick}
          disabled={isPending}
        >
          {isPending
            ? "İşleniyor..."
            : iFollowThem
            ? "Takibi Bırak"
            : "Sen de takip et"}
        </button>
      )}
    </button>
  );
};

const ProfileFollowersPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialTab = location.pathname.endsWith("/following")
    ? "following"
    : "followers";
  const [activeTab, setActiveTab] = useState(initialTab);

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const {
    data: user,
    isLoading: isUserLoading,
    isRefetching: isUserRefetching,
  } = useQuery({
    queryKey: ["user", username],
    queryFn: () => getUserProfile(username),
  });

  const {
    data: followers,
    isLoading: isFollowersLoading,
  } = useQuery({
    queryKey: ["followers", username],
    queryFn: () => getFollowers(username),
    enabled: !!username,
  });

  const {
    data: followings,
    isLoading: isFollowingLoading,
  } = useQuery({
    queryKey: ["followings", username],
    queryFn: () => getFollowing(username),
    enabled: !!username,
  });

  const isSelf = authUser?._id === user?._id;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/profile/${username}/${tab}`, { replace: true });
  };

  const renderList = (
    items,
    emptyText,
    isLoadingList,
    options = { showMutualLabel: false, showNotFollowingBackLabel: false }
  ) => {
    if (isLoadingList) {
      return (
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, index) => (
            <UserRowSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <p className="text-center text-sm text-base-content/60 py-10">
          {emptyText}
        </p>
      );
    }

    return (
      <div className="flex flex-col">
        {items.map((item) => (
          <UserRow
            key={item._id}
            item={item}
            authUser={authUser}
            navigate={navigate}
            showMutualLabel={options.showMutualLabel}
            showNotFollowingBackLabel={options.showNotFollowingBackLabel}
          />
        ))}
      </div>
    );
  };

  if (isUserLoading || isUserRefetching) {
    return (
      <div className="w-full min-h-screen pb-20 lg:pb-0">
        <ProfileHeaderSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-[4_4_0] border-r border-base-300/50 min-h-screen pb-20 lg:pb-0 flex items-center justify-center">
        <p className="text-lg">Kullanıcı bulunamadı.</p>
      </div>
    );
  }

  const pageTitle =
    activeTab === "followers" ? "Takipçiler" : "Takip edilen hesaplar";

  return (
    <div className="flex-[4_4_0] border-r border-base-300/50 min-h-screen pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-4 px-4 py-2 border-b border-base-300 bg-base-100/95 backdrop-blur-md">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-base-200 transition-colors"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight">{user.fullname}</span>
          <span className="text-xs text-base-content/60">{pageTitle}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-base-300 flex">
        <button
          className={`flex-1 py-3 text-sm font-medium hover:bg-base-200 transition-colors ${
            activeTab === "followers"
              ? "border-b-2 border-primary text-primary"
              : "text-base-content/70"
          }`}
          onClick={() => handleTabChange("followers")}
        >
          Takipçiler
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium hover:bg-base-200 transition-colors ${
            activeTab === "following"
              ? "border-b-2 border-primary text-primary"
              : "text-base-content/70"
          }`}
          onClick={() => handleTabChange("following")}
        >
          Takip edilenler
        </button>
      </div>

      {/* Content */}
      <div className="px-0">
        {activeTab === "followers" ? (
          renderList(followers, "Henüz takipçi yok.", isFollowersLoading, {
            showMutualLabel: isSelf,
            showNotFollowingBackLabel: false,
          })
        ) : (
          renderList(followings, "Takip edilen hesap yok.", isFollowingLoading, {
            showMutualLabel: false,
            showNotFollowingBackLabel: isSelf,
          })
        )}
      </div>
    </div>
  );
};

export default ProfileFollowersPage;

