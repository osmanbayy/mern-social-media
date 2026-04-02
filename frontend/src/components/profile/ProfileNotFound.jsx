import { LuUser } from "react-icons/lu";

export default function ProfileNotFound({ onBack }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
        <LuUser className="h-8 w-8" strokeWidth={2} />
      </div>
      <h2 className="text-lg font-bold tracking-tight text-base-content">Kullanıcı bulunamadı</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-base-content/60">
        Bu profil mevcut değil veya kaldırılmış olabilir.
      </p>
      <button type="button" className="btn btn-sm mt-8 rounded-xl px-6" onClick={onBack}>
        Geri dön
      </button>
    </div>
  );
}
