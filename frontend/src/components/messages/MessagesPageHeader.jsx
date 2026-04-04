import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { LuChevronRight, LuMessageSquare } from "react-icons/lu";

export default function MessagesPageHeader({ requestCount, onBack }) {
  return (
    <header className="sticky top-0 z-30 border-b border-base-300/50 bg-base-100/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm shrink-0 md:hidden"
            onClick={onBack}
            aria-label="Geri"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent shadow-inner ring-1 ring-accent/10">
              <LuMessageSquare className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-base-content sm:text-xl">
                Mesajlar
              </h1>
              <p className="truncate text-xs text-base-content/55 sm:text-sm">Sohbetlerin tek yerde</p>
            </div>
          </div>
        </div>

        <Link
          to="/messages/requests"
          className={`btn btn-sm shrink-0 gap-1.5 rounded-full font-semibold shadow-sm transition ${
            requestCount > 0
              ? "btn-accent"
              : "btn-ghost border border-base-300/60 bg-base-100 hover:border-accent/30"
          }`}
        >
          İstekler
          {requestCount > 0 && (
            <span className="badge badge-sm border-0 bg-base-100/25 text-inherit">{requestCount}</span>
          )}
          <LuChevronRight className="h-4 w-4 opacity-70" />
        </Link>
      </div>
    </header>
  );
}
