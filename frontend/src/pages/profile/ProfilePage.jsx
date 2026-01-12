import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "../../components/modals/EditProfileModal";
import ProfileImageModal from "../../components/modals/ProfileImageModal";
import CoverImageModal from "../../components/modals/CoverImageModal";
import FollowersModal from "../../components/modals/FollowersModal";
import FollowingModal from "../../components/modals/FollowingModal";
import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { getUserProfile } from "../../api/users";
import { formatMemberSinceDate } from "../../utils/date";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import defaultCoverPicture from "../../assets/default-cover.jpg";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import useProfileImage from "../../hooks/useProfileImage";

const ProfilePage = () => {
  const [feedType, setFeedType] = useState("posts");
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  const { username } = useParams();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const {
    data: user,
    isLoading,
    refetch: refetchUser,
    isRefetching,
  } = useQuery({
    queryKey: ["user", username],
    queryFn: () => getUserProfile(username),
  });

  const { follow, isPending } = useFollow(user?._id);

  const { updateProfile, isUpdatingProfile } = useUpdateProfile();

  const {
    coverImg,
    profileImage,
    coverImgRef,
    profileImgRef,
    handleImgChange,
    resetImages,
  } = useProfileImage();

  const isMyProfile = authUser?._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following?.includes(user?._id) || false;

  const handleProfileImageClick = (e) => {
    e.stopPropagation();
    if (user?._id) {
      document.getElementById(`profile_image_modal${user._id}`).showModal();
    }
  };

  const handleCoverImageClick = (e) => {
    e.stopPropagation();
    if (user?._id) {
      document.getElementById(`cover_image_modal${user._id}`).showModal();
    }
  };

  const handleFollowersClick = (e) => {
    e.stopPropagation();
    setIsFollowersModalOpen(true);
    if (user?._id) {
      document.getElementById(`followers_modal${user._id}`).showModal();
    }
  };

  const handleFollowingClick = (e) => {
    e.stopPropagation();
    setIsFollowingModalOpen(true);
    if (user?._id) {
      document.getElementById(`following_modal${user._id}`).showModal();
    }
  };

  const handleUpdateProfile = async () => {
    await updateProfile({ coverImg, profileImage });
    resetImages();
  };

  useEffect(() => {
    if (username) {
      refetchUser();
    }
  }, [username, refetchUser]);

  return (
    <>
      <div className="flex-[4_4_0] border-r border-base-300/50 min-h-screen pb-20 lg:pb-0">
        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
        {!isLoading && !isRefetching && !user && (
          <p className="text-center text-lg mt-4">Kullanıcı bulunamadı.</p>
        )}

        {!isLoading && !isRefetching && user && (
          <>
            {/* Üst başlık - Twitter benzeri */}
            <div className="sticky top-0 z-20 flex items-center gap-4 px-4 py-2 border-b border-base-300 bg-base-100/95 backdrop-blur-md">
              <Link
                to="/"
                className="p-2 rounded-full hover:bg-base-200 transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">
                  {user?.fullname}
                </span>
                <span className="text-xs text-base-content/60">
                  {user?.posts?.length || 0} gönderi
                </span>
              </div>
            </div>

            {/* Kapak resmi */}
            <div className="relative">
              <div className="h-52 w-full bg-base-200">
                <img
                  src={user?.coverImg || defaultCoverPicture}
                  className="h-full w-full object-cover"
                  alt="cover"
                  onClick={handleCoverImageClick}
                />
              </div>

              {isMyProfile && (
                <button
                  type="button"
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs border border-base-300 bg-base-100/90 hover:bg-base-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    coverImgRef.current?.click();
                  }}
                >
                  Kapak fotoğrafını düzenle
                </button>
              )}

              <input
                type="file"
                hidden
                accept="image/*"
                ref={coverImgRef}
                onChange={(e) => handleImgChange(e, "coverImg")}
              />
              <input
                type="file"
                hidden
                accept="image/*"
                ref={profileImgRef}
                onChange={(e) => handleImgChange(e, "profileImage")}
              />

              {/* Profil fotoğrafı */}
              <div className="absolute -bottom-16 left-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-base-100 bg-base-100 overflow-hidden">
                    <img
                      src={user?.profileImage || defaultProfilePicture}
                      alt={user?.fullname}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={handleProfileImageClick}
                    />
                  </div>
                  {isMyProfile && (
                    <button
                      type="button"
                      className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-base-100 border border-base-300 flex items-center justify-center text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        profileImgRef.current?.click();
                      }}
                    >
                      <MdEdit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Kapak ile içerik arası boşluk */}
            <div className="h-16" />

            {/* Profil aksiyonları (Takip / Profili düzenle / Güncelle) */}
            <div className="flex justify-end px-4 mb-3 gap-2">
              {isMyProfile ? (
                <EditProfileModal authUser={authUser} />
              ) : (
                <button
                  className={`btn btn-sm rounded-full px-4 ${
                    amIFollowing ? "btn-outline" : "btn-primary text-white"
                  }`}
                  onClick={() => follow(user?._id)}
                  disabled={isPending}
                >
                  {isPending && <LoadingSpinner size="sm" />}
                  {!isPending && amIFollowing && "Takibi Bırak"}
                  {!isPending && !amIFollowing && "Takip Et"}
                </button>
              )}

              {(coverImg || profileImage) && (
                <button
                  className="btn btn-sm rounded-full px-4"
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Güncelle"
                  )}
                </button>
              )}
            </div>

            {/* Profil bilgileri */}
            <div className="px-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-lg">{user?.fullname}</span>
                <span className="text-sm text-base-content/60">
                  @{user?.username}
                </span>
              </div>

              {user?.bio && (
                <p className="text-sm leading-relaxed">{user?.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                {user?.link && (
                  <a
                    href={user?.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    <FaLink className="w-4 h-4" />
                    <span>{user?.link.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
                <div className="flex items-center gap-1">
                  <IoCalendarOutline className="w-4 h-4" />
                  <span>{memberSinceDate}</span>
                </div>
              </div>

              <div className="flex gap-4 text-sm">
                <button
                  type="button"
                  className="flex items-center gap-1 hover:underline"
                  onClick={handleFollowingClick}
                >
                  <span className="font-bold">
                    {user?.following?.length || 0}
                  </span>
                  <span className="text-base-content/60">Takip</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:underline"
                  onClick={handleFollowersClick}
                >
                  <span className="font-bold">
                    {user?.followers?.length || 0}
                  </span>
                  <span className="text-base-content/60">Takipçi</span>
                </button>
              </div>
            </div>

            {/* Sekmeler */}
            <div className="mt-4 border-b border-base-300 flex">
              <button
                className={`flex-1 py-3 text-sm font-medium hover:bg-base-200 transition-colors ${
                  feedType === "posts"
                    ? "border-b-2 border-primary text-primary"
                    : "text-base-content/70"
                }`}
                onClick={() => setFeedType("posts")}
              >
                Gönderiler
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium hover:bg-base-200 transition-colors ${
                  feedType === "likes"
                    ? "border-b-2 border-primary text-primary"
                    : "text-base-content/70"
                }`}
                onClick={() => setFeedType("likes")}
              >
                Beğeniler
              </button>
            </div>
          </>
        )}

        {/* Gönderiler listesi */}
        <Posts feedType={feedType} username={username} userId={user?._id} />
      </div>

      {/* Profile Image Modal */}
      <ProfileImageModal
        user={user}
        isMyProfile={isMyProfile}
        profileImgRef={profileImgRef}
      />

      {/* Cover Image Modal */}
      <CoverImageModal
        user={user}
        isMyProfile={isMyProfile}
        coverImgRef={coverImgRef}
      />

      {/* Followers Modal */}
      <FollowersModal
        user={user}
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
      />

      {/* Following Modal */}
      <FollowingModal
        user={user}
        authUser={authUser}
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
      />
    </>
  );
};
export default ProfilePage;
