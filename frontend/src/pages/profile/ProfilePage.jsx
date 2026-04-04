import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import Posts from "../../components/common/Posts";
import { ProfileHeaderSkeleton } from "../../components/skeletons";
import ProfileImageModal from "../../components/modals/ProfileImageModal";
import CoverImageModal from "../../components/modals/CoverImageModal";
import BlockUserDialog from "../../components/modals/BlockUserDialog";
import ImageCropModal from "../../components/modals/ImageCropModal";
import ShareModal from "../../components/modals/ShareModal";
import { getUserProfile, blockUser } from "../../api/users";
import { invalidateAfterBlockOrProfileDamage } from "../../utils/queryInvalidation";
import { formatMemberSinceDate } from "../../utils/date";
import useFollow from "../../hooks/useFollow";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import useProfileImage from "../../hooks/useProfileImage";
import { FEED_TYPES } from "../../constants/feedTypes";
import { useTheme } from "../../contexts/ThemeContext";
import { useProfileConversationLink } from "../../hooks/useProfileConversationLink";
import ProfileNotFound from "../../components/profile/ProfileNotFound";
import ProfileStickyHeader from "../../components/profile/ProfileStickyHeader";
import ProfileHeroCard from "../../components/profile/ProfileHeroCard";
import ProfileFeedTabs from "../../components/profile/ProfileFeedTabs";

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

  const { authUser, isAccountVerified } = useAuth();
  const { theme } = useTheme();

  const { data: user, isLoading, isRefetching } = useQuery({
    queryKey: ["user", username],
    queryFn: () => getUserProfile(username),
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { follow, isPending: isFollowPending } = useFollow(user?._id);
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

  const { loadingConversations, messageLinkTo, messageLinkState } = useProfileConversationLink({
    authUser,
    isAccountVerified,
    isMyProfile,
    profileUser: user,
  });

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
    if (username) navigate(`/profile/${username}/followers`);
  };

  const handleFollowingClick = (e) => {
    e.stopPropagation();
    if (username) navigate(`/profile/${username}/following`);
  };

  const handleUpdateProfile = async () => {
    await updateProfile({ coverImg, profileImage });
    resetImages();
  };

  const handleBlockUser = async () => {
    if (!user?._id) return;

    setIsBlocking(true);
    try {
      await blockUser(user._id);
      await invalidateAfterBlockOrProfileDamage(queryClient, username);
      setShowBlockDialog(false);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error blocking user:", error);
      }
    } finally {
      setIsBlocking(false);
    }
  };

  const handleBlockClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBlockDialog(true);
  };

  const handleShareModalOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dropdownMenuRef.current?.blur();
    dropdownTriggerRef.current?.blur();
    document.activeElement?.blur();

    setTimeout(() => setShowShareModal(true), 100);
  };

  useEffect(() => {
    if (showShareModal && dropdownTriggerRef.current) {
      dropdownTriggerRef.current.blur();
      document.activeElement?.blur();
    }
  }, [showShareModal]);

  const showUpdateButton = !!(coverImg || profileImage) && isMyProfile;

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-b from-base-200/30 via-base-100 to-base-100 pb-24 dark:from-base-300/12 lg:pb-0">
        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}

        {!isLoading && !isRefetching && !user && (
          <ProfileNotFound onBack={() => navigate(-1)} />
        )}

        {!isLoading && !isRefetching && user && (
          <>
            <ShareModal
              user={user}
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
            />

            <ProfileStickyHeader
              fullname={user?.fullname}
              verified={user?.isAccountVerified}
              postCount={user?.postCount}
              isMyProfile={isMyProfile}
              theme={theme}
              dropdownTriggerRef={dropdownTriggerRef}
              dropdownMenuRef={dropdownMenuRef}
              onBack={() => navigate(-1)}
              onShareOpen={handleShareModalOpen}
              onBlockOpen={handleBlockClick}
            />

            <main className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4 sm:px-5">
              <ProfileHeroCard
                user={user}
                isMyProfile={isMyProfile}
                coverImg={coverImg}
                profileImage={profileImage}
                coverImgRef={coverImgRef}
                profileImgRef={profileImgRef}
                onCoverClick={handleCoverImageClick}
                onProfileImgClick={handleProfileImageClick}
                onCoverFileChange={handleImgChange}
                onProfileFileChange={handleImgChange}
                onEditProfileNavigate={() => navigate("/edit-profile")}
                onUpdateProfile={handleUpdateProfile}
                showUpdateButton={showUpdateButton}
                isUpdatingProfile={isUpdatingProfile}
                loadingConversations={loadingConversations}
                messageLinkTo={messageLinkTo}
                messageLinkState={messageLinkState}
                amIFollowing={amIFollowing}
                onFollow={follow}
                isFollowPending={isFollowPending}
                memberSinceDate={memberSinceDate}
                onFollowingClick={handleFollowingClick}
                onFollowersClick={handleFollowersClick}
              />

              <ProfileFeedTabs feedType={feedType} onFeedTypeChange={setFeedType} />

              <div className="mt-3">
                <Posts feedType={feedType} username={username} userId={user?._id} />
              </div>
            </main>
          </>
        )}
      </div>

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

      {user && !isMyProfile && (
        <BlockUserDialog
          isOpen={showBlockDialog}
          onClose={() => setShowBlockDialog(false)}
          onConfirm={handleBlockUser}
          userName={user?.username}
          isBlocking={isBlocking}
        />
      )}

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
