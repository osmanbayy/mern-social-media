import { FaArrowLeft } from "react-icons/fa6";
import { LuEllipsisVertical } from "react-icons/lu";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { formatChatLastSeen } from "../../utils/chatFormatting";

export default function ChatPageHeader({
  selectionMode,
  exitSelectionMode,
  navigate,
  selectedMessageIds,
  isBulkDeleting,
  onBulkDelete,
  otherUser,
  headerBarClass,
  conversationId,
  isCompose,
  isClearing,
  onClearChat,
  onOpenChatSettings,
  onEnterSelectionMode,
}) {
  return (
    <header className={headerBarClass}>
      <div className="flex w-full min-w-0 max-w-full items-center gap-1 px-1 py-2 sm:px-2 sm:py-2.5">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle shrink-0"
          aria-label={selectionMode ? "İptal" : "Geri"}
          onClick={() => {
            if (selectionMode) exitSelectionMode();
            else navigate("/messages", { replace: true });
          }}
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>
        {selectionMode ? (
          <>
            <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-base-content">
              Mesaj seç
            </p>
            <button
              type="button"
              className="btn btn-error btn-sm shrink-0 rounded-xl px-3 font-semibold"
              disabled={selectedMessageIds.length === 0 || isBulkDeleting}
              onClick={onBulkDelete}
            >
              {isBulkDeleting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                `Sil (${selectedMessageIds.length})`
              )}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="flex min-w-0 max-w-full flex-1 items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition-colors hover:bg-base-200/70"
              onClick={() => otherUser && navigate(`/profile/${otherUser.username}`)}
            >
              <div className="relative shrink-0">
                <div className="avatar">
                  <div className="w-11 h-11 rounded-full ring-2 ring-base-300/80 ring-offset-2 ring-offset-base-100">
                    <img
                      src={otherUser?.profileImage || defaultProfilePicture}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold leading-tight text-base-content">
                  {otherUser?.fullname || otherUser?.username || "…"}
                </p>
                <p className="truncate text-xs text-base-content/50">@{otherUser?.username}</p>
                <p className="truncate text-[11px] font-medium leading-tight text-primary/90">
                  {otherUser?.online
                    ? "Çevrimiçi"
                    : otherUser?.lastSeen
                      ? `Son görülme: ${formatChatLastSeen(otherUser.lastSeen)}`
                      : "Çevrimdışı"}
                </p>
              </div>
            </button>
            <div className="dropdown dropdown-end shrink-0">
              <button
                type="button"
                tabIndex={0}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Sohbet menüsü"
                aria-haspopup="menu"
              >
                <LuEllipsisVertical className="h-5 w-5" />
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu z-40 mt-1 w-52 rounded-2xl border border-base-300/50 bg-base-100 p-2 shadow-lg"
                role="menu"
              >
                <li>
                  <button
                    type="button"
                    className="rounded-xl text-left font-medium"
                    role="menuitem"
                    onClick={onOpenChatSettings}
                  >
                    Sohbet ayarları
                  </button>
                </li>
                {conversationId && !isCompose ? (
                  <>
                    <li>
                      <button
                        type="button"
                        className="rounded-xl text-left font-medium"
                        role="menuitem"
                        onClick={onEnterSelectionMode}
                      >
                        Mesaj seç
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="rounded-xl text-left font-medium text-error"
                        role="menuitem"
                        disabled={isClearing}
                        onClick={onClearChat}
                      >
                        {isClearing ? "Temizleniyor…" : "Sohbeti temizle"}
                      </button>
                    </li>
                  </>
                ) : null}
              </ul>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
