import { LuLogOut } from "react-icons/lu";

export default function DesktopSidebarLogoutButton({ onLogoutClick }) {
  return (
    <div className="mt-auto border-t border-base-300/40 pt-4">
      <button
        type="button"
        onClick={onLogoutClick}
        className="btn btn-ghost btn-sm h-11 w-full justify-start gap-3 rounded-xl border border-transparent font-medium text-base-content/75 hover:border-base-300/50 hover:bg-error/5 hover:text-error"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200/50">
          <LuLogOut className="h-[1.2rem] w-[1.2rem]" />
        </span>
        Çıkış yap
      </button>
    </div>
  );
}
