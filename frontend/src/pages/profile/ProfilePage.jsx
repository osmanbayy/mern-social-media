import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import ProfileImageModal from "../../components/modals/ProfileImageModal";
import CoverImageModal from "../../components/modals/CoverImageModal";
import BlockUserDialog from "../../components/modals/BlockUserDialog";
import ImageCropModal from "../../components/modals/ImageCropModal";
import ShareModal from "../../components/modals/ShareModal";
import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { HiDotsHorizontal } from "react-icons/hi";
import { GoBlocked, GoMute } from "react-icons/go";
import { LuShare2 } from "react-icons/lu";
import { CiFlag1 } from "react-icons/ci";
import { getUserProfile, blockUser } from "../../api/users";
import { formatMemberSinceDate } from "../../utils/date";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import defaultCoverPicture from "../../assets/default-cover.jpg";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import useProfileImage from "../../hooks/useProfileImage";
import { FEED_TYPES } from "../../constants/feedTypes";

const ProfilePage = () => {
  const [feedType, setFeedType] = useState(FEED_TYPES.POSTS);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [showCoverImageModal, setShowCoverImageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const dropdownTriggerRef = useRef(null);
  const dropdownMenuRef = useRef(null);

  const { username } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    cropImageSrc,
    showCropModal,
    cropType,
    handleCropComplete,
    handleCropCancel,
  } = useProfileImage();

  const isMyProfile = authUser?._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following?.includes(user?._id) || false;

  const handleProfileImageClick = (e) => {
    e.stopPropagation();
    setShowProfileImageModal(true);
  };

  const handleCoverImageClick = (e) => {
    e.stopPropagation();
    setShowCoverImageModal(true);
  };

  const handleFollowersClick = (e) => {
    e.stopPropagation();
    if (username) {
      navigate(`/profile/${username}/followers`);
    }
  };

  const handleFollowingClick = (e) => {
    e.stopPropagation();
    if (username) {
      navigate(`/profile/${username}/following`);
    }
  };

  const handleUpdateProfile = async () => {
    await updateProfile({ coverImg, profileImage });
    resetImages();
    refetchUser();
  };

  const handleBlockUser = async () => {
    if (!user?._id) return;
    
    setIsBlocking(true);
    try {
      await blockUser(user._id);
      queryClient.invalidateQueries({ queryKey: ["user", username] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setShowBlockDialog(false);
    } catch (error) {
      console.error("Error blocking user:", error);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleBlockClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBlockDialog(true);
  };

  const getTabClassName = (tabType) => {
    const baseClasses = "flex-1 py-3 text-sm font-medium hover:bg-base-200 transition-colors";
    const activeClasses = "border-b-2 border-primary text-primary";
    const inactiveClasses = "text-base-content/70";
    
    return `${baseClasses} ${feedType === tabType ? activeClasses : inactiveClasses}`;
  };

  useEffect(() => {
    if (username) {
      refetchUser();
    }
  }, [username, refetchUser]);

  // Close dropdown when share modal opens
  useEffect(() => {
    if (showShareModal && dropdownTriggerRef.current) {
      dropdownTriggerRef.current.blur();
      // Force close by removing focus
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  }, [showShareModal]);

  return (
    <>
      <div className="w-full min-h-screen pb-20 lg:pb-0">
        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
        {!isLoading && !isRefetching && !user && (
          <p className="text-center text-lg mt-4">Kullanıcı bulunamadı.</p>
        )}

        {!isLoading && !isRefetching && user && (
          <>
            {/* Share Modal */}
            <ShareModal
              user={user}
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
            />

            {/* Üst başlık - Twitter benzeri */}
            <div className="sticky top-0 z-20 flex items-center gap-4 px-4 py-2 border-b border-base-300 bg-base-100/95 backdrop-blur-md">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-base-200 transition-colors"
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">
                  {user?.fullname}
                </span>
                <span className="text-xs text-base-content/60">
                  {user?.postCount || 0} gönderi
                </span>
              </div>
            </div>

            {/* Kapak resmi */}
            <div className="relative">
              <div className="h-52 w-full bg-base-200">
                <img
                  src={coverImg || user?.coverImg || defaultCoverPicture}
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
                      src={profileImage || user?.profileImage || defaultProfilePicture}
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
            <div className="flex justify-end items-center px-4 mb-3 gap-2">
              {isMyProfile ? (
                <button
                  className="btn btn-outline rounded-full btn-sm"
                  onClick={() => navigate("/edit-profile")}
                >
                  Bilgilerini Düzenle
                </button>
              ) : (
                <>
                  {/* 3 nokta dropdown */}
                  <div className="dropdown dropdown-left">
                    <button
                      ref={dropdownTriggerRef}
                      type="button"
                      className="btn btn-sm rounded-full btn-outline p-2 h-8 w-8 min-h-8 flex items-center justify-center outline-none"
                    >
                      <HiDotsHorizontal
                        tabIndex={0}
                        role="button"
                        className="size-5 cursor-pointer border-none outline-none"
                      />
                    </button>
                    <ul
                      ref={dropdownMenuRef}
                      tabIndex={0}
                      className="dropdown-content rounded-xl border border-base-300/50 menu bg-base-100/95 backdrop-blur-xl z-[100] font-semibold min-w-60 p-2 shadow-2xl transition-all duration-200 ease-out"
                    >
                      <li 
                        className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg"
                        onClick={handleBlockClick}
                      >
                        <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                          <GoBlocked /> <span>Engelle</span>
                        </a>
                      </li>
                      <li className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg">
                        <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                          <GoMute /> <span>Sessize Al</span>
                        </a>
                      </li>
                      <li 
                        className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // Close dropdown immediately
                          if (dropdownMenuRef.current) {
                            dropdownMenuRef.current.blur();
                          }
                          if (dropdownTriggerRef.current) {
                            dropdownTriggerRef.current.blur();
                          }
                          // Force close by removing focus
                          if (document.activeElement) {
                            document.activeElement.blur();
                          }
                          
                          // Small delay to ensure dropdown closes before modal opens
                          setTimeout(() => {
                            setShowShareModal(true);
                          }, 100);
                        }}
                      >
                        <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                          <LuShare2 /> <span>Profili Paylaş</span>
                        </a>
                      </li>
                      <li className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg">
                        <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                          <CiFlag1 /> <span>Bildir</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                  
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
                </>
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
                className={getTabClassName(FEED_TYPES.POSTS)}
                onClick={() => setFeedType(FEED_TYPES.POSTS)}
              >
                Gönderiler
              </button>
              <button
                className={getTabClassName(FEED_TYPES.LIKES)}
                onClick={() => setFeedType(FEED_TYPES.LIKES)}
              >
                Beğeniler
              </button>
            </div>

            {/* Orta içerik: gönderiler */}
            <div className="px-0">
              <Posts feedType={feedType} username={username} userId={user?._id} />
            </div>
          </>
        )}
      </div>

      {/* Profile Image Modal */}
      {user && (
        <ProfileImageModal
          user={user}
          isMyProfile={isMyProfile}
          profileImgRef={profileImgRef}
          profileImage={profileImage}
          isOpen={showProfileImageModal}
          onClose={() => setShowProfileImageModal(false)}
        />
      )}

      {/* Cover Image Modal */}
      {user && (
        <CoverImageModal
          user={user}
          isMyProfile={isMyProfile}
          coverImgRef={coverImgRef}
          coverImg={coverImg}
          isOpen={showCoverImageModal}
          onClose={() => setShowCoverImageModal(false)}
        />
      )}

      {/* Block User Dialog */}
      {!isMyProfile && (
        <BlockUserDialog
          isOpen={showBlockDialog}
          onClose={() => setShowBlockDialog(false)}
          onConfirm={handleBlockUser}
          userName={user?.username}
          isBlocking={isBlocking}
        />
      )}

      {/* Image Crop Modal */}
      <ImageCropModal
        imageSrc={cropImageSrc}
        isOpen={showCropModal}
        onClose={handleCropCancel}
        onCropComplete={handleCropComplete}
        aspectRatio={cropType === "profileImage" ? 1 : 16 / 9}
        cropShape={cropType === "profileImage" ? "round" : "rect"}
      />
    </>
  );
};
export default ProfilePage;
