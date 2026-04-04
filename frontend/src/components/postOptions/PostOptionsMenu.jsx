import { BsEmojiFrown } from "react-icons/bs";
import { SlUserFollow, SlUserUnfollow } from "react-icons/sl";
import { FaTrash } from "react-icons/fa";
import { TbEdit } from "react-icons/tb";
import { LuPin, LuEyeOff, LuShare2 } from "react-icons/lu";
import { MdOutlineShowChart } from "react-icons/md";
import { GoBlocked, GoMute } from "react-icons/go";
import { CiFlag1 } from "react-icons/ci";
import LoadingSpinner from "../common/LoadingSpinner";
import { postOptionsMenuClassName, postOptionsMenuStyle, POST_OPTIONS_ITEM_HOVER } from "./postOptionsTheme";
import { MenuAnchorContent, MenuLoadingInline, MenuRow } from "./PostOptionsMenuPrimitives";

const stop = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

export default function PostOptionsMenu({
  theme,
  post,
  postOwner,
  isMyPost,
  isHidden,
  isDeleting,
  isHiding,
  isUnhiding,
  isPinning,
  amIFollowing,
  followPending,
  follow,
  unfollow,
  onShare,
  onUnhide,
  onDelete,
  onEdit,
  onPin,
  onHide,
  onBlock,
}) {
  return (
    <ul
      tabIndex={0}
      className={postOptionsMenuClassName(theme)}
      style={postOptionsMenuStyle(theme)}
      role="menu"
    >
      <MenuRow onClick={onShare}>
        <MenuAnchorContent icon={LuShare2} label="Paylaş" />
      </MenuRow>

      {isHidden ? (
        <MenuRow
          onClick={(e) => {
            stop(e);
            onUnhide();
          }}
        >
          {isUnhiding ? (
            <MenuLoadingInline message="Görünür Hale Getiriliyor..." />
          ) : (
            <MenuAnchorContent icon={LuEyeOff} label="Görünür Hale Getir" />
          )}
        </MenuRow>
      ) : null}

      {isMyPost ? (
        <li
          className={POST_OPTIONS_ITEM_HOVER}
          onClick={(e) => {
            stop(e);
            onDelete?.();
          }}
        >
          {!isDeleting ? (
            <div className="flex cursor-pointer items-center gap-2">
              <FaTrash /> <span>Gönderiyi Sil</span>
            </div>
          ) : (
            <LoadingSpinner size="sm" />
          )}
        </li>
      ) : null}

      {isMyPost ? (
        <li
          className={POST_OPTIONS_ITEM_HOVER}
          onClick={(e) => {
            stop(e);
            onEdit();
          }}
        >
          <div className="flex cursor-pointer items-center gap-2">
            <TbEdit className="size-5" /> <span>Düzenle</span>
          </div>
        </li>
      ) : null}

      {isMyPost ? (
        <MenuRow
          onClick={(e) => {
            stop(e);
            onPin?.();
          }}
        >
          {isPinning ? (
            <MenuLoadingInline message="Yükleniyor..." />
          ) : (
            <MenuAnchorContent
              icon={LuPin}
              label={post?.isPinned ? "Sabitlemeyi Kaldır" : "Profilde Başa Sabitle"}
            />
          )}
        </MenuRow>
      ) : null}

      {isMyPost ? (
        <li className={POST_OPTIONS_ITEM_HOVER}>
          <button
            type="button"
            className="flex w-full cursor-default items-center gap-2 rounded-none text-left"
            disabled
          >
            <MdOutlineShowChart /> <span>Görünürlüğü Düzenle</span>
          </button>
        </li>
      ) : null}

      {!isMyPost && !isHidden ? (
        <MenuRow
          onClick={(e) => {
            stop(e);
            onHide();
          }}
        >
          {isHiding ? (
            <MenuLoadingInline message="Gizleniyor..." />
          ) : (
            <MenuAnchorContent icon={BsEmojiFrown} label="Bu gönderi ilgimi çekmiyor" />
          )}
        </MenuRow>
      ) : null}

      {!isMyPost ? (
        <MenuRow
          onClick={(e) => {
            stop(e);
            if (amIFollowing) unfollow();
            else follow();
          }}
        >
          {followPending ? (
            <MenuLoadingInline message="Yükleniyor..." />
          ) : (
            <span className="flex cursor-pointer items-center whitespace-nowrap rounded-none">
              {amIFollowing ? (
                <>
                  <SlUserUnfollow /> <span>Takipten Çık</span>
                </>
              ) : (
                <>
                  <SlUserFollow /> <span>Takip et</span>
                </>
              )}
              <span className="ml-1 text-base-content/60">@{postOwner.username}</span>
            </span>
          )}
        </MenuRow>
      ) : null}

      {!isMyPost ? (
        <li className={POST_OPTIONS_ITEM_HOVER}>
          <button
            type="button"
            className="flex w-full cursor-default items-center gap-1 rounded-none text-left whitespace-nowrap"
            disabled
          >
            <GoMute /> Sessize Al{" "}
            <span className="text-gray-500">@{postOwner.username}</span>
          </button>
        </li>
      ) : null}

      {!isMyPost ? (
        <MenuRow onClick={onBlock}>
          <span className="flex cursor-pointer items-center whitespace-nowrap rounded-none">
            <GoBlocked /> Engelle{" "}
            <span className="text-base-content/60">@{postOwner.username}</span>
          </span>
        </MenuRow>
      ) : null}

      {!isMyPost ? (
        <li className={POST_OPTIONS_ITEM_HOVER}>
          <button
            type="button"
            className="flex w-full cursor-default items-center gap-1 rounded-none text-left whitespace-nowrap"
            disabled
          >
            <CiFlag1 /> Bildir{" "}
          </button>
        </li>
      ) : null}
    </ul>
  );
}
