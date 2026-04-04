import { FaArrowLeft } from "react-icons/fa6";
import ProfileMoreMenu from "./ProfileMoreMenu";
import VerifiedBadge from "../common/VerifiedBadge";

export default function ProfileStickyHeader({
  fullname,
  verified,
  postCount,
  isMyProfile,
  theme,
  dropdownTriggerRef,
  dropdownMenuRef,
  onBack,
  onShareOpen,
  onBlockOpen,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-base-300/60 bg-base-100/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-5">
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm shrink-0"
          aria-label="Geri"
          onClick={onBack}
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 pr-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h1 className="truncate text-lg font-bold leading-tight tracking-tight">{fullname}</h1>
            <VerifiedBadge verified={verified} size="sm" />
          </div>
          <p className="text-xs text-base-content/55 sm:text-[13px]">{postCount || 0} gönderi</p>
        </div>
        {!isMyProfile && (
          <ProfileMoreMenu
            theme={theme}
            dropdownTriggerRef={dropdownTriggerRef}
            dropdownMenuRef={dropdownMenuRef}
            onShareOpen={onShareOpen}
            onBlockOpen={onBlockOpen}
          />
        )}
      </div>
    </header>
  );
}
