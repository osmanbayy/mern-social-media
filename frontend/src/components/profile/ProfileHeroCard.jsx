import { Link } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { LuMessageSquare } from "react-icons/lu";
import { SlUserFollow, SlUserUnfollow } from "react-icons/sl";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultCoverPicture from "../../assets/default-cover.jpg";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import ProfileBioStats from "./ProfileBioStats";

export default function ProfileHeroCard({
  user,
  isMyProfile,
  coverImg,
  profileImage,
  coverImgRef,
  profileImgRef,
  onCoverClick,
  onProfileImgClick,
  onCoverFileChange,
  onProfileFileChange,
  onEditProfileNavigate,
  onUpdateProfile,
  showUpdateButton,
  isUpdatingProfile,
  loadingConversations,
  messageLinkTo,
  messageLinkState,
  amIFollowing,
  onFollow,
  isFollowPending,
  memberSinceDate,
  onFollowingClick,
  onFollowersClick,
}) {
  return (
    <section className="overflow-visible rounded-2xl border border-base-300/45 bg-base-100/90 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm dark:border-base-300/35 dark:bg-base-200/25 dark:ring-white/[0.04]">
      <div className="relative h-40 overflow-hidden rounded-t-2xl bg-base-200 sm:h-44">
        <img
          src={coverImg || user?.coverImg || defaultCoverPicture}
          className="h-full w-full cursor-pointer object-cover"
          alt=""
          onClick={onCoverClick}
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
        onChange={(e) => onCoverFileChange(e, "coverImg")}
      />
      <input
        type="file"
        hidden
        accept="image/*"
        ref={profileImgRef}
        onChange={(e) => onProfileFileChange(e, "profileImage")}
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
                  onClick={onProfileImgClick}
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
                onClick={onEditProfileNavigate}
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
                    state={messageLinkState}
                    className="btn btn-outline btn-sm rounded-xl border-base-300/60 px-4 font-semibold hover:border-accent/50"
                    title={messageLinkTo.includes("/new/") ? "Mesaj gönder" : "Sohbete devam et"}
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
                  onClick={() => onFollow(user?._id)}
                  disabled={isFollowPending}
                >
                  {isFollowPending && <LoadingSpinner size="sm" />}
                  {!isFollowPending && amIFollowing && (
                    <span className="flex items-center gap-2">
                      <SlUserUnfollow className="size-3.5" /> Takibi Bırak
                    </span>
                  )}
                  {!isFollowPending && !amIFollowing && (
                    <span className="flex items-center gap-2">
                      <SlUserFollow className="size-3.5" /> Takip Et
                    </span>
                  )}
                </button>
              </>
            )}

            {showUpdateButton && (
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-xl px-5 font-semibold"
                onClick={onUpdateProfile}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? <LoadingSpinner size="sm" /> : "Güncelle"}
              </button>
            )}
          </div>
        </div>

        <ProfileBioStats
          fullname={user?.fullname}
          username={user?.username}
          bio={user?.bio}
          link={user?.link}
          memberSinceDate={memberSinceDate}
          followingCount={user?.following?.length || 0}
          followersCount={user?.followers?.length || 0}
          onFollowingClick={onFollowingClick}
          onFollowersClick={onFollowersClick}
        />
      </div>
    </section>
  );
}
