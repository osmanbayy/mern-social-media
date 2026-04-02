import { GoBlocked, GoMute } from "react-icons/go";
import { LuShare2 } from "react-icons/lu";
import { CiFlag1 } from "react-icons/ci";
import { HiDotsHorizontal } from "react-icons/hi";

export default function ProfileMoreMenu({
  theme,
  dropdownTriggerRef,
  dropdownMenuRef,
  onShareOpen,
  onBlockOpen,
}) {
  return (
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
          onClick={onShareOpen}
        >
          <span className="rounded-none flex whitespace-nowrap cursor-pointer gap-2 px-4 py-3">
            <LuShare2 className="shrink-0" /> <span>Profili Paylaş</span>
          </span>
        </li>
        <li className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg">
          <span className="rounded-none flex whitespace-nowrap cursor-pointer gap-2 px-4 py-3">
            <GoMute /> <span>Sessize Al</span>
          </span>
        </li>
        <li
          className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg"
          onClick={onBlockOpen}
        >
          <span className="rounded-none flex whitespace-nowrap cursor-pointer gap-2 px-4 py-3">
            <GoBlocked /> <span>Engelle</span>
          </span>
        </li>
        <li>
          <span
            className="rounded-none whitespace-nowrap flex gap-2 px-4 py-3 cursor-default opacity-70"
            onClick={(e) => e.preventDefault()}
          >
            <CiFlag1 /> Bildir
          </span>
        </li>
      </ul>
    </div>
  );
}
