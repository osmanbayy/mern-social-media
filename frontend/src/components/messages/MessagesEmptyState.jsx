import { Link } from "react-router-dom";
import { LuInbox, LuSparkles } from "react-icons/lu";

export default function MessagesEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:py-20">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent ring-1 ring-accent/15">
        <LuInbox className="h-10 w-10 text-accent" strokeWidth={1.75} />
      </div>
      <h2 className="mb-2 text-xl font-bold tracking-tight text-base-content">Henüz sohbet yok</h2>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-base-content/60">
        Birinin profilinden mesaj göndererek veya bildirimlerinden yanıtlayarak sohbet başlatabilirsin.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          to="/suggestions"
          className="btn btn-accent btn-md gap-2 rounded-full px-6 shadow-md"
        >
          <LuSparkles className="h-4 w-4" />
          Kişi keşfet
        </Link>
        <Link to="/" className="btn btn-outline btn-md rounded-full border-base-300/70">
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}
