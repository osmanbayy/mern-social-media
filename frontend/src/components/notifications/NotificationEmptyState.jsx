import { LuSparkles } from "react-icons/lu";

export default function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center sm:py-24">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent/25 via-accent/10 to-transparent ring-1 ring-accent/20">
        <LuSparkles className="h-10 w-10 text-accent" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-base-content">Henüz bildirim yok</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-base-content/55">
        Beğeni, yorum, takip ve mesajlar burada görünecek.
      </p>
    </div>
  );
}
