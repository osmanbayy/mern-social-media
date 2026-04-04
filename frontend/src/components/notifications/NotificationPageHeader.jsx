import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { LuBell, LuCheckCheck, LuSettings, LuTrash2 } from "react-icons/lu";

export default function NotificationPageHeader({
  unreadCount,
  onMarkAllRead,
  onDeleteAll,
  isMarkingAllRead,
  isDeletingAll,
}) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-base-300/45 bg-base-100/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-circle btn-ghost btn-sm shrink-0"
            aria-label="Geri"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent ring-1 ring-accent/15">
              <LuBell className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-base-content">Bildirimler</h1>
              <p className="truncate text-xs text-base-content/50 sm:text-sm">
                {unreadCount > 0 ? (
                  <span className="font-medium text-accent">{unreadCount} okunmamış</span>
                ) : (
                  "Hepsi güncel"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-circle btn-ghost btn-sm border border-base-300/40"
            aria-label="Bildirim seçenekleri"
          >
            <LuSettings className="h-5 w-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[90] mt-2 min-w-[14rem] overflow-hidden rounded-2xl border border-base-300/50 bg-base-100/98 p-1.5 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:bg-base-200/95 dark:ring-white/10"
          >
            {unreadCount > 0 && (
              <li>
                <button
                  type="button"
                  onClick={() => onMarkAllRead()}
                  disabled={isMarkingAllRead}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-accent/10 hover:text-accent disabled:opacity-50"
                >
                  <LuCheckCheck className="h-5 w-5 shrink-0" />
                  Tümünü okundu işaretle
                </button>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => onDeleteAll()}
                disabled={isDeletingAll}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-error transition hover:bg-error/10 disabled:opacity-50"
              >
                <LuTrash2 className="h-5 w-5 shrink-0" />
                Tümünü sil
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
