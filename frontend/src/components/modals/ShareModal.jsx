import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  LuX,
  LuCopy,
  LuCheck,
  LuMessageSquare,
  LuChevronRight,
  LuArrowLeft,
} from "react-icons/lu";
import toast from "react-hot-toast";
import { getShareOptions } from "../../constants/shareOptions";
import { useAuth } from "../../contexts/AuthContext";
import { getFollowers } from "../../api/users";
import { sendMessage } from "../../api/messages";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";

const ShareModal = ({ post, postOwner, user, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState("share");
  const [dmSearch, setDmSearch] = useState("");
  const navigate = useNavigate();
  const { authUser, isLoggedIn } = useAuth();

  const isUserShare = !!user && !post;

  useEffect(() => {
    if (!isOpen) {
      setStep("share");
      setDmSearch("");
    }
  }, [isOpen]);

  const shareUrl = isUserShare
    ? `${window.location.origin}/profile/${user.username}`
    : `${window.location.origin}/post/${post._id}`;

  const shareText = isUserShare
    ? `${user.fullname || user.username} kullanıcısının profilini paylaş`
    : postOwner
      ? `${postOwner.fullname || postOwner.username} tarafından paylaşıldı: ${post.text?.substring(0, 100)}${post.text?.length > 100 ? "..." : ""}`
      : post.text?.substring(0, 100) || "Bu gönderiyi paylaş";

  const sharePayload = useMemo(() => {
    if (isUserShare) {
      const uid = user?._id ?? user?.id;
      return { kind: "profile", userId: uid != null ? String(uid) : "" };
    }
    const pid = post?._id ?? post?.id;
    return { kind: "post", postId: pid != null ? String(pid) : "" };
  }, [isUserShare, user, post]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Link kopyalanamadı");
    }
  };

  const shareOptions = getShareOptions(shareUrl, shareText, copyToClipboard);

  const { data: followersRaw, isLoading: loadingFollowers } = useQuery({
    queryKey: ["followers", authUser?.username],
    queryFn: () => getFollowers(authUser.username),
    enabled: isOpen && step === "dm" && !!authUser?.username,
  });

  const followers = useMemo(() => {
    if (!followersRaw || !Array.isArray(followersRaw)) return [];
    const q = dmSearch.trim().toLowerCase();
    return followersRaw.filter((f) => {
      if (!f?._id || String(f._id) === String(authUser?._id)) return false;
      if (!q) return true;
      const u = (f.username || "").toLowerCase();
      const fn = (f.fullname || "").toLowerCase();
      return u.includes(q) || fn.includes(q);
    });
  }, [followersRaw, dmSearch, authUser?._id]);

  const { mutate: sendDm, isPending: sendingDm } = useMutation({
    mutationFn: (toUserId) =>
      sendMessage(toUserId, { share: sharePayload }),
    onSuccess: (data) => {
      onClose();
      if (data?.pending || data?.request) {
        toast.success(
          "Mesaj isteği gönderildi. Karşı taraf kabul edince sohbette görünür."
        );
        return;
      }
      const cid = data?.conversationId;
      if (cid) {
        navigate(`/messages/chat/${cid}`);
        toast.success("Gönderildi");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative max-h-[min(90vh,640px)] w-full max-w-md overflow-hidden rounded-2xl border border-base-300/50 bg-base-100 p-6 shadow-2xl animate-dropdownFadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 btn btn-sm btn-circle btn-ghost hover:bg-base-200/50 transition-all duration-200"
        >
          <LuX className="w-4 h-4" />
        </button>

        {step === "share" ? (
          <>
            <div className="mb-6 pr-10">
              <h3 className="mb-2 font-bold text-xl text-base-content">Paylaş</h3>
              <p className="text-sm text-base-content/70">
                {isUserShare ? "Profili paylaş" : "Gönderiyi paylaş"}
              </p>
            </div>

            {isLoggedIn && authUser?.username && (
              <button
                type="button"
                onClick={() => setStep("dm")}
                className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-base-300/60 bg-base-200/35 py-3 pl-4 pr-3 text-left transition hover:bg-base-200/70"
              >
                <LuMessageSquare className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-base-content">DM ile gönder</p>
                  <p className="text-xs text-base-content/55">
                    Takipçilerinden birini seç
                  </p>
                </div>
                <LuChevronRight className="h-5 w-5 shrink-0 text-base-content/40" />
              </button>
            )}

            <div className="mb-6 grid grid-cols-3 gap-3">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      option.action();
                      onClose();
                    }}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 ${option.color} ${option.hoverColor} text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-semibold">{option.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-base-300/50 pt-4">
              <div className="flex items-center gap-3 rounded-xl border border-base-300/30 bg-base-200/50 p-3">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs text-base-content/60">
                    {isUserShare ? "Profil linki" : "Gönderi linki"}
                  </p>
                  <p className="truncate font-mono text-sm text-base-content">
                    {shareUrl}
                  </p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`btn btn-sm ${copied ? "btn-success" : "btn-primary"} transition-all duration-200`}
                >
                  {copied ? (
                    <>
                      <LuCheck className="h-4 w-4" />
                      <span>Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <LuCopy className="h-4 w-4" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 pr-10">
              <button
                type="button"
                onClick={() => setStep("share")}
                className="btn btn-ghost btn-sm btn-circle shrink-0"
                aria-label="Geri"
              >
                <LuArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-base-content">DM ile gönder</h3>
                <p className="text-xs text-base-content/60">Takipçilerinden seç</p>
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
                  {dmSearch.trim()
                    ? "Eşleşen takipçi yok."
                    : "Henüz takipçin yok veya liste boş."}
                </p>
              ) : (
                <ul className="divide-y divide-base-300/30">
                  {followers.map((f) => (
                    <li key={f._id}>
                      <button
                        type="button"
                        disabled={sendingDm}
                        onClick={() => sendDm(f._id)}
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
                          <p className="truncate font-semibold text-base-content">
                            {f.fullname || f.username}
                          </p>
                          <p className="truncate text-sm text-base-content/55">
                            @{f.username}
                          </p>
                        </div>
                        {sendingDm ? (
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
          </>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
