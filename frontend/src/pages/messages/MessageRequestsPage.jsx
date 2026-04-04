import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  getIncomingMessageRequests,
  acceptMessageRequest,
  declineMessageRequest,
} from "../../api/messages";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import MessageSharePreview from "../../components/messages/MessageSharePreview";
import { FaArrowLeft } from "react-icons/fa6";
import { LuBell, LuUserPlus } from "react-icons/lu";
import toast from "react-hot-toast";
import {
  invalidateAfterMessageRequestAccepted,
  invalidateAfterMessageRequestDeclined,
} from "../../utils/queryInvalidation";
import { MessageRequestsSkeleton } from "../../components/skeletons";

const MessageRequestsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({
    queryKey: ["messageRequests"],
    queryFn: getIncomingMessageRequests,
  });

  const { mutate: accept, isPending: accepting } = useMutation({
    mutationFn: acceptMessageRequest,
    onSuccess: (data, requestId) => {
      queryClient.setQueryData(["messageRequests"], (old) =>
        Array.isArray(old) ? old.filter((r) => String(r._id) !== String(requestId)) : old
      );
      invalidateAfterMessageRequestAccepted(queryClient);
      toast.success("İstek kabul edildi");
      if (data?.conversation?._id) {
        navigate(`/messages/chat/${data.conversation._id}`, { replace: true });
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const { mutate: decline, isPending: declining } = useMutation({
    mutationFn: declineMessageRequest,
    onSuccess: (_data, requestId) => {
      queryClient.setQueryData(["messageRequests"], (old) =>
        Array.isArray(old) ? old.filter((r) => String(r._id) !== String(requestId)) : old
      );
      invalidateAfterMessageRequestDeclined(queryClient);
      toast.success("İstek reddedildi");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-base-200/40 via-base-100 to-base-100 dark:from-base-300/20">
      <header className="sticky top-0 z-30 border-b border-base-300/50 bg-base-100/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm shrink-0"
            onClick={() => navigate(-1)}
            aria-label="Mesajlara dön"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent ring-1 ring-accent/10">
              <LuUserPlus className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-base-content sm:text-xl">Mesaj istekleri</h1>
              <p className="text-xs text-base-content/55 sm:text-sm">Sadece sen onaylayınca sohbet başlar</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 py-4 sm:px-4 sm:py-6">
        {isLoading && <MessageRequestsSkeleton />}

        {!isLoading && (!requests || requests.length === 0) && (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:py-20">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent ring-1 ring-accent/15">
              <LuBell className="h-10 w-10 text-accent" strokeWidth={1.75} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-base-content">Bekleyen istek yok</h2>
            <p className="max-w-sm text-sm leading-relaxed text-base-content/60">
              Biri ilk mesajını gönderdiğinde burada görünecek; kabul edince sohbet açılır.
            </p>
          </div>
        )}

        {!isLoading && requests?.length > 0 && (
          <ul className="flex flex-col gap-3">
            {requests.map((r) => (
              <li
                key={r._id}
                className="overflow-hidden rounded-2xl border border-base-300/45 bg-base-100/90 p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <Link to={`/profile/${r.from?.username}`} className="avatar shrink-0">
                    <div className="h-14 w-14 rounded-full ring-2 ring-base-300/70 transition hover:ring-accent/35 sm:h-16 sm:w-16">
                      <img
                        src={r.from?.profileImage || defaultProfilePicture}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/profile/${r.from?.username}`}
                      className="font-semibold text-base-content hover:text-accent"
                    >
                      {r.from?.fullname || r.from?.username}
                    </Link>
                    {r.share?.kind ? (
                      <MessageSharePreview share={r.share} mine={false} className="mt-2" />
                    ) : null}
                    {r.text != null &&
                    String(r.text).replace(/\u2060/g, "").trim() ? (
                      <p
                        className={`whitespace-pre-wrap break-words text-sm leading-relaxed text-base-content/75 ${r.share?.kind ? "mt-3" : "mt-2"}`}
                      >
                        {r.text}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-base-300/35 pt-4">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm rounded-full px-5"
                    disabled={declining || accepting}
                    onClick={() => decline(r._id)}
                  >
                    Reddet
                  </button>
                  <button
                    type="button"
                    className="btn btn-accent btn-sm rounded-full px-6 font-semibold shadow-sm"
                    disabled={accepting || declining}
                    onClick={() => accept(r._id)}
                  >
                    Kabul et
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default MessageRequestsPage;
