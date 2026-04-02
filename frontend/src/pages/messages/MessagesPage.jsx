import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getConversations, getIncomingMessageRequests } from "../../api/messages";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { FaArrowLeft } from "react-icons/fa6";
import { LuChevronRight, LuInbox, LuMessageSquare, LuSparkles } from "react-icons/lu";

const formatListTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};

const ConversationSkeleton = () => (
  <div className="flex animate-pulse items-center gap-3 rounded-2xl border border-base-300/30 bg-base-100/50 p-3.5">
    <div className="skeleton h-14 w-14 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="skeleton h-4 w-2/5 rounded-full" />
      <div className="skeleton h-3 w-4/5 rounded-full" />
    </div>
    <div className="skeleton h-3 w-10 shrink-0 rounded-full" />
  </div>
);

const MessagesPage = () => {
  const navigate = useNavigate();
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });
  const { data: requests } = useQuery({
    queryKey: ["messageRequests"],
    queryFn: getIncomingMessageRequests,
  });

  const requestCount = requests?.length ?? 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-base-200/40 via-base-100 to-base-100 dark:from-base-300/20">
      <header className="sticky top-0 z-30 border-b border-base-300/50 bg-base-100/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-sm shrink-0 md:hidden"
              onClick={() => navigate(-1)}
              aria-label="Geri"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent shadow-inner ring-1 ring-accent/10">
                <LuMessageSquare className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-base-content sm:text-xl">Mesajlar</h1>
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

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 py-4 sm:px-4 sm:py-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </div>
        )}

        {!isLoading && (!conversations || conversations.length === 0) && (
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
        )}

        {!isLoading && conversations?.length > 0 && (
          <ul className="flex flex-col gap-2.5 sm:gap-3">
            {conversations.map((c) => {
              const t = formatListTime(c.lastMessageAt);
              return (
                <li key={c._id}>
                  <Link
                    to={`/messages/chat/${c._id}`}
                    className="group flex items-center gap-3 rounded-2xl border border-base-300/45 bg-base-100/90 p-3 shadow-sm transition-all duration-200 hover:border-accent/25 hover:bg-base-100 hover:shadow-md active:scale-[0.99] sm:p-3.5"
                  >
                    <div className="avatar shrink-0">
                      <div className="h-14 w-14 rounded-full ring-2 ring-base-300/70 transition-[box-shadow] duration-200 group-hover:ring-accent/35 sm:h-[3.75rem] sm:w-[3.75rem]">
                        <img
                          src={c.otherUser?.profileImage || defaultProfilePicture}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="mb-0.5 flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-base-content group-hover:text-accent">
                          {c.otherUser?.fullname || c.otherUser?.username || "Kullanıcı"}
                        </p>
                        {t && (
                          <time
                            dateTime={c.lastMessageAt}
                            className="shrink-0 text-[11px] font-medium text-base-content/45 tabular-nums sm:text-xs"
                          >
                            {t}
                          </time>
                        )}
                      </div>
                      <p className="line-clamp-2 text-sm text-base-content/55">
                        {c.lastMessagePreview?.trim() || (
                          <span className="italic text-base-content/35">Mesaj yok</span>
                        )}
                      </p>
                    </div>
                    <LuChevronRight className="h-5 w-5 shrink-0 text-base-content/25 transition group-hover:translate-x-0.5 group-hover:text-accent/70" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};

export default MessagesPage;
