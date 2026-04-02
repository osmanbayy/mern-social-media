import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LuX, LuChevronRight } from "react-icons/lu";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { getFollowers } from "../../api/users";
import { sendMessage } from "../../api/messages";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { buildForwardPayload } from "../../utils/messageChat";

export default function ForwardMessageModal({ isOpen, onClose, message, excludeUserId }) {
  const [dmSearch, setDmSearch] = useState("");
  const navigate = useNavigate();
  const { authUser } = useAuth();

  useEffect(() => {
    if (!isOpen) setDmSearch("");
  }, [isOpen]);

  const { data: followersRaw, isLoading: loadingFollowers } = useQuery({
    queryKey: ["followers", authUser?.username],
    queryFn: () => getFollowers(authUser.username),
    enabled: isOpen && !!authUser?.username,
  });

  const followers = useMemo(() => {
    if (!followersRaw || !Array.isArray(followersRaw)) return [];
    const q = dmSearch.trim().toLowerCase();
    const ex = excludeUserId != null ? String(excludeUserId) : "";
    return followersRaw.filter((f) => {
      if (!f?._id || String(f._id) === String(authUser?._id)) return false;
      if (ex && String(f._id) === ex) return false;
      if (!q) return true;
      const u = (f.username || "").toLowerCase();
      const fn = (f.fullname || "").toLowerCase();
      return u.includes(q) || fn.includes(q);
    });
  }, [followersRaw, dmSearch, authUser?._id, excludeUserId]);

  const { mutate: forwardTo, isPending } = useMutation({
    mutationFn: (toUserId) => {
      const payload = buildForwardPayload(message);
      if (!payload) {
        throw new Error("Bu mesaj iletilemez.");
      }
      return sendMessage(toUserId, payload);
    },
    onSuccess: (data) => {
      onClose();
      if (data?.pending || data?.request) {
        toast.success("İstek gönderildi; kabul edilince iletilir.");
        return;
      }
      const cid = data?.conversationId;
      if (cid) {
        navigate(`/messages/chat/${cid}`);
        toast.success("İletildi");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative max-h-[min(90vh,520px)] w-full max-w-md overflow-hidden rounded-2xl border border-base-300/50 bg-base-100 p-5 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-circle btn-ghost btn-sm absolute right-3 top-3"
          aria-label="Kapat"
        >
          <LuX className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-2 pr-10">
          <div className="min-w-0">
            <h3 className="font-bold text-lg text-base-content">Mesajı ilet</h3>
            <p className="text-xs text-base-content/55">Takipçilerinden birine gönder</p>
          </div>
        </div>

        <label className="mb-3 block">
          <span className="sr-only">Ara</span>
          <input
            type="search"
            autoComplete="off"
            placeholder="Kişi ara…"
            value={dmSearch}
            onChange={(e) => setDmSearch(e.target.value)}
            className="input input-bordered input-sm w-full rounded-xl border-base-300/70 bg-base-200/40"
          />
        </label>

        <div className="scrollbar-hide max-h-[min(50vh,360px)] overflow-y-auto rounded-xl border border-base-300/40 bg-base-200/20">
          {loadingFollowers ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : followers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-base-content/55">
              {dmSearch.trim() ? "Eşleşen kişi yok." : "İletilecek takipçi bulunamadı."}
            </p>
          ) : (
            <ul className="divide-y divide-base-300/30">
              {followers.map((f) => (
                <li key={f._id}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => forwardTo(f._id)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-base-200/60 disabled:opacity-50"
                  >
                    <div className="avatar shrink-0">
                      <div className="h-11 w-11 rounded-full ring-1 ring-base-300/60">
                        <img
                          src={f.profileImage || defaultProfilePicture}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-base-content">{f.fullname || f.username}</p>
                      <p className="truncate text-sm text-base-content/55">@{f.username}</p>
                    </div>
                    {isPending ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      <LuChevronRight className="h-5 w-5 shrink-0 text-base-content/35" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
