import { LuUserX } from "react-icons/lu";

export default function FollowListNotFoundState({ onGoHome }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200/80 ring-1 ring-base-300/50 dark:bg-base-300/40">
        <LuUserX className="h-7 w-7 text-base-content/50" strokeWidth={1.75} />
      </div>
      <p className="text-base font-semibold text-base-content">Kullanıcı bulunamadı</p>
      <p className="mt-1 max-w-sm text-sm text-base-content/55">Profil mevcut değil veya kaldırılmış olabilir.</p>
      {onGoHome ? (
        <button type="button" className="btn btn-primary btn-sm mt-6 rounded-full" onClick={onGoHome}>
          Ana sayfa
        </button>
      ) : null}
    </div>
  );
}
