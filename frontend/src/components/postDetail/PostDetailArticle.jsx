import { Link } from "react-router-dom";
import { LuPin } from "react-icons/lu";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import MentionText from "../common/MentionText";
import PostActions from "../common/PostActions";
import PostOptions from "../postOptions/PostOptions";
import VerifiedBadge from "../common/VerifiedBadge";
import PostLocationLine from "../common/PostLocationLine";
import PostPollBlock from "../common/PostPollBlock";
import { useAuth } from "../../contexts/AuthContext";

const stopPropagation = (e) => e.stopPropagation();

export default function PostDetailArticle({
  post,
  postOwner,
  theme,
  formattedDate,
  isLiked,
  isSaved,
  isMyPost,
  isDeletingPost,
  isPinning,
  onLikePost,
  onSavePost,
  onEditPost,
  onRequestDeletePost,
  onPinPost,
  onOpenImage,
}) {
  const { authUser } = useAuth();

  return (
    <div className="border-b border-base-300/50">
      <div className="flex items-start gap-4 p-5">
        {postOwner ? (
          <Link
            to={`/profile/${postOwner.username}`}
            className="avatar flex-shrink-0"
            onClick={stopPropagation}
          >
            <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-base-300 transition-all duration-300 hover:ring-primary">
              <img
                src={postOwner.profileImage || defaultProfilePicture}
                alt={postOwner.fullname || "Kullanıcı"}
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
        ) : (
          <div className="avatar flex-shrink-0">
            <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-base-300">
              <img
                src={defaultProfilePicture}
                alt="Silinmiş Kullanıcı"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {post?.isPinned && (
            <div className="mb-1 flex items-center gap-1 text-xs text-base-content/60">
              <LuPin className="h-3 w-3" />
              <span>Başa sabitlendi</span>
            </div>
          )}

          <div className="mb-1 flex flex-wrap items-start gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              {postOwner ? (
                <>
                  <div className="flex min-w-0 max-w-full items-center gap-1">
                    <Link
                      to={`/profile/${postOwner.username}`}
                      className="truncate font-bold hover:underline"
                      onClick={stopPropagation}
                    >
                      {postOwner.fullname || "Kullanıcı"}
                    </Link>
                    <VerifiedBadge user={postOwner} size="sm" />
                  </div>
                  <span className="flex-shrink-0 whitespace-nowrap text-sm text-base-content/60">
                    <Link
                      to={`/profile/${postOwner.username}`}
                      className="hover:underline"
                      onClick={stopPropagation}
                    >
                      @{postOwner.username}
                    </Link>
                    <span className="mx-1">·</span>
                    <span>{formattedDate}</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="truncate font-bold">Silinmiş Kullanıcı</span>
                  <span className="flex-shrink-0 whitespace-nowrap text-sm text-base-content/60">
                    <span className="mx-1">·</span>
                    <span>{formattedDate}</span>
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-shrink-0" onClick={stopPropagation}>
              <PostOptions
                post={post}
                postOwner={postOwner}
                isMyPost={isMyPost}
                isHidden={false}
                isDeleting={isDeletingPost}
                isHiding={false}
                isUnhiding={false}
                isPinning={isPinning}
                onEdit={onEditPost}
                onDelete={onRequestDeletePost}
                onHide={() => {}}
                onUnhide={() => {}}
                onPin={onPinPost}
                theme={theme}
              />
            </div>
          </div>

          {post.text ? (
            <p className="mb-3 text-[15px] leading-relaxed text-base-content">
              <MentionText text={post.text} />
            </p>
          ) : null}

          {post.location?.name && (
            <PostLocationLine
              name={post.location.name}
              lat={post.location.lat}
              lon={post.location.lon}
              className="mb-3"
            />
          )}

          {post.poll?.options?.length >= 2 && (
            <div className="mb-3">
              <PostPollBlock post={post} authUserId={authUser?._id} />
            </div>
          )}

          {post.img && (
            <button
              type="button"
              className="group/image mb-4 w-full overflow-hidden rounded-2xl border border-base-300/50 text-left transition-all duration-300 hover:border-base-300"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onOpenImage();
              }}
            >
              <img
                src={post.img}
                className="pointer-events-none max-h-[600px] w-full cursor-pointer object-contain transition-transform duration-500 group-hover/image:scale-[1.01]"
                alt="Gönderi Resmi"
              />
            </button>
          )}

          <PostActions
            post={post}
            isLiked={isLiked}
            isSaved={isSaved}
            isLiking={false}
            isSaving={false}
            onLike={onLikePost}
            onSave={onSavePost}
            onComment={() => {}}
            onRepost={() => {}}
            showCounts={true}
          />
        </div>
      </div>
    </div>
  );
}
