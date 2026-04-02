import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
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
import { LuShare2, LuMessageSquare, LuUser } from "react-icons/lu";
import { CiFlag1 } from "react-icons/ci";
import { getUserProfile, blockUser } from "../../api/users";
import { getConversations } from "../../api/messages";
import { formatMemberSinceDate } from "../../utils/date";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import defaultCoverPicture from "../../assets/default-cover.jpg";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import useProfileImage from "../../hooks/useProfileImage";
import { FEED_TYPES } from "../../constants/feedTypes";
import { SlUserFollow, SlUserUnfollow } from "react-icons/sl";
import { useTheme } from "../../contexts/ThemeContext";

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

  const { data: user, isLoading, isRefetching } = useQuery({
    queryKey: ["user", username],
    queryFn: () => getUserProfile(username),
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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

  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: !!authUser && !!isAccountVerified && !isMyProfile && !!user?._id,
  });

  const conversationWithProfileUser = useMemo(() => {
    if (!conversations?.length || !user?._id) return null;
    const target = String(user._id);
    return (
      conversations.find((c) => {
        if (c.otherUser?._id && String(c.otherUser._id) === target) return true;
        return c.participants?.some((p) => String(p) === target);
      }) ?? null
    );
  }, [conversations, user?._id]);

  const messageLinkTo = conversationWithProfileUser
    ? `/messages/chat/${conversationWithProfileUser._id}`
    : `/messages/chat/new/${user?._id}`;

  const amIFollowing = authUser?.following?.includes(user?._id) || false;
  const { theme } = useTheme();

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

  const tabClass = (tabType) => {
    const on = feedType === tabType;
    return `min-w-0 flex-1 rounded-lg px-2 py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
      on
        ? "bg-base-100 text-accent shadow-sm ring-1 ring-base-300/40 dark:bg-base-200/90"
        : "text-base-content/55 hover:bg-base-100/60 hover:text-base-content"
    }`;
  };

  const handleShareModalOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.blur();
    }
    if (dropdownTriggerRef.current) {
      dropdownTriggerRef.current.blur();
    }
    if (document.activeElement) {
      document.activeElement.blur();
    }

    setTimeout(() => {
      setShowShareModal(true);
    }, 100);
  };

  useEffect(() => {
    if (showShareModal && dropdownTriggerRef.current) {
      dropdownTriggerRef.current.blur();
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  }, [showShareModal]);

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-b from-base-200/30 via-base-100 to-base-100 pb-24 dark:from-base-300/12 lg:pb-0">
        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}

        {!isLoading && !isRefetching && !user && (
          <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <LuUser className="h-8 w-8" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-base-content">Kullanıcı bulunamadı</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-base-content/60">
              Bu profil mevcut değil veya kaldırılmış olabilir.
            </p>
            <button
              type="button"
              className="btn btn-sm mt-8 rounded-xl px-6"
              onClick={() => navigate(-1)}
            >
              Geri dön
            </button>
          </div>
        )}

        {!isLoading && !isRefetching && user && (
          <>
            <ShareModal
              user={user}
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
            />

            <header className="sticky top-0 z-30 border-b border-base-300/60 bg-base-100/90 shadow-sm backdrop-blur-xl">
              <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-5">
                <button
                  type="button"
                  className="btn btn-circle btn-ghost btn-sm shrink-0"
                  aria-label="Geri"
                  onClick={() => navigate(-1)}
                >
                  <FaArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1 pr-1">
                  <h1 className="truncate text-lg font-bold leading-tight tracking-tight">{user?.fullname}</h1>
                  <p className="text-xs text-base-content/55 sm:text-[13px]">{user?.postCount || 0} gönderi</p>
                </div>
                {!isMyProfile && (
                  <div className="dropdown dropdown-end shrink-0">
                    <button
                      ref={dropdownTriggerRef}
                      type="button"
                      tabIndex={0}
                      className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:bg-base-200/80"
                      aria-label="Daha fazla"
                    >
                      <HiDotsHorizontal className="size-5" />
                    </button>
                    <ul
                      ref={dropdownMenuRef}
                      tabIndex={0}
                      className={`dropdown-content rounded-xl border border-base-300/50 menu bg-base-100/95 backdrop-blur-xl z-[100] font-semibold min-w-60 max-w-[min(15rem,calc(100vw-1rem))] p-2 shadow-2xl transition-all duration-200 ease-out ${
                        theme === "dark"
                          ? "shadow-black/40 ring-1 ring-white/10"
                          : "shadow-black/20 ring-1 ring-black/5"
                      }`}
                      style={{
                        boxShadow:
                          theme === "dark"
                            ? "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                            : "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                        animation: "dropdownFadeIn 0.2s ease-out",
                      }}
                    >
                      <li
                        className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg"
                        onClick={handleShareModalOpen}
                      >
                        <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                          <LuShare2 /> <span>Profili Paylaş</span>
                        </a>
                      </li>
                      <li className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg">
                        <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                          <GoMute /> <span>Sessize Al</span>
                        </a>
                      </li>
                      <li
                        className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg"
                        onClick={handleBlockClick}
                      >
                        <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                          <GoBlocked /> <span>Engelle</span>
                        </a>
                      </li>
                      <li>
                        <a href="" className="rounded-none whitespace-nowrap" onClick={(e) => e.preventDefault()}>
                          <CiFlag1 /> Bildir{" "}
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </header>

            <main className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4 sm:px-5">
              {/* Tek kart: kapak üstte kırpımlı; kart overflow-visible — avatar kesilmez */}
              <section className="overflow-visible rounded-2xl border border-base-300/45 bg-base-100/90 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm dark:border-base-300/35 dark:bg-base-200/25 dark:ring-white/[0.04]">
                <div className="relative h-40 overflow-hidden rounded-t-2xl bg-base-200 sm:h-44">
                  <img
                    src={coverImg || user?.coverImg || defaultCoverPicture}
                    className="h-full w-full cursor-pointer object-cover"
                    alt=""
                    onClick={handleCoverImageClick}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-100/85 via-base-100/10 to-transparent dark:from-base-300/60"
                    aria-hidden
                  />

                  {isMyProfile && (
                    <button
                      type="button"
                      className="absolute right-3 top-3 rounded-full border border-white/20 bg-base-100/90 px-3 py-1.5 text-xs font-semibold text-base-content shadow-md backdrop-blur-md transition hover:bg-base-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        coverImgRef.current?.click();
                      }}
                    >
                      Kapak düzenle
                    </button>
                  )}
                </div>

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

                <div className="relative px-4 pb-5 pt-0 sm:px-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                    <div className="-mt-12 flex shrink-0 sm:-mt-14">
                      <div className="relative">
                        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-base-100 bg-base-100 shadow-lg ring-1 ring-base-300/25 dark:border-base-200 dark:ring-base-300/20 sm:h-28 sm:w-28">
                          <img
                            src={profileImage || user?.profileImage || defaultProfilePicture}
                            alt={user?.fullname}
                            className="h-full w-full cursor-pointer object-cover"
                            onClick={handleProfileImageClick}
                          />
                        </div>
                        {isMyProfile && (
                          <button
                            type="button"
                            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-base-300/70 bg-base-100 text-base-content shadow-md transition hover:bg-base-200 dark:border-base-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              profileImgRef.current?.click();
                            }}
                            aria-label="Profil fotoğrafını düzenle"
                          >
                            <MdEdit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 sm:pb-0.5">
                      {isMyProfile ? (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm rounded-xl border-base-300/60 px-4 font-semibold hover:border-accent/50 hover:bg-accent/5"
                          onClick={() => navigate("/edit-profile")}
                        >
                          Profili düzenle
                        </button>
                      ) : (
                        <>
                          {loadingConversations ? (
                            <span
                              className="btn btn-sm btn-disabled pointer-events-none rounded-xl px-4"
                              title="Yükleniyor…"
                            >
                              <LoadingSpinner size="sm" />
                            </span>
                          ) : (
                            <Link
                              to={messageLinkTo}
                              state={
                                !conversationWithProfileUser && user
                                  ? {
                                      messagePeer: {
                                        _id: user._id,
                                        username: user.username,
                                        fullname: user.fullname,
                                        profileImage: user.profileImage,
                                      },
                                    }
                                  : undefined
                              }
                              className="btn btn-outline btn-sm rounded-xl border-base-300/60 px-4 font-semibold hover:border-accent/50"
                              title={conversationWithProfileUser ? "Sohbete devam et" : "Mesaj gönder"}
                            >
                              <LuMessageSquare className="size-4" />
                              <span className="hidden sm:inline">Mesaj</span>
                            </Link>
                          )}
                          <button
                            type="button"
                            className={`btn btn-sm rounded-xl px-5 font-semibold ${
                              amIFollowing
                                ? "btn-outline border-base-300/60 hover:border-error/50 hover:bg-error/5 hover:text-error"
                                : "btn-primary"
                            }`}
                            onClick={() => follow(user?._id)}
                            disabled={isPending}
                          >
                            {isPending && <LoadingSpinner size="sm" />}
                            {!isPending && amIFollowing && (
                              <span className="flex items-center gap-2">
                                <SlUserUnfollow className="size-3.5" /> Takibi Bırak
                              </span>
                            )}
                            {!isPending && !amIFollowing && (
                              <span className="flex items-center gap-2">
                                <SlUserFollow className="size-3.5" /> Takip Et
                              </span>
                            )}
                          </button>
                        </>
                      )}

                      {(coverImg || profileImage) && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm rounded-xl px-5 font-semibold"
                          onClick={handleUpdateProfile}
                          disabled={isUpdatingProfile}
                        >
                          {isUpdatingProfile ? <LoadingSpinner size="sm" /> : "Güncelle"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-base-300/35 pt-5">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-base-content sm:text-[1.35rem]">{user?.fullname}</h2>
                      <p className="mt-0.5 text-[15px] text-base-content/55">@{user?.username}</p>
                    </div>

                    {user?.bio && (
                      <p className="text-[15px] leading-relaxed text-base-content/90">{user?.bio}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-base-content/55">
                      {user?.link && (
                        <a
                          href={user?.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-full items-center gap-1.5 font-medium text-accent hover:underline"
                        >
                          <FaLink className="h-3.5 w-3.5 shrink-0 opacity-80" />
                          <span className="truncate">{user?.link.replace(/^https?:\/\//, "")}</span>
                        </a>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <IoCalendarOutline className="h-4 w-4 shrink-0 opacity-80" />
                        {memberSinceDate}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-5 pt-1 text-sm">
                      <button
                        type="button"
                        className="rounded-lg px-1 py-0.5 transition hover:bg-base-200/60"
                        onClick={handleFollowingClick}
                      >
                        <span className="font-bold tabular-nums text-base-content">{user?.following?.length || 0}</span>
                        <span className="text-base-content/55"> Takip</span>
                      </button>
                      <button
                        type="button"
                        className="rounded-lg px-1 py-0.5 transition hover:bg-base-200/60"
                        onClick={handleFollowersClick}
                      >
                        <span className="font-bold tabular-nums text-base-content">{user?.followers?.length || 0}</span>
                        <span className="text-base-content/55"> Takipçi</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Sekmeler — kartın dışında, gönderi akışıyla hizalı */}
              <div className="mt-5 rounded-xl bg-base-200/45 p-1 ring-1 ring-base-300/35 dark:bg-base-300/20">
                <div className="flex gap-1">
                  <button type="button" className={tabClass(FEED_TYPES.POSTS)} onClick={() => setFeedType(FEED_TYPES.POSTS)}>
                    Gönderiler
                  </button>
                  <button type="button" className={tabClass(FEED_TYPES.LIKES)} onClick={() => setFeedType(FEED_TYPES.LIKES)}>
                    Beğeniler
                  </button>
                </div>
              </div>

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
