import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { BiRepost } from "react-icons/bi";
import { CiImageOn } from "react-icons/ci";
import { LuX } from "react-icons/lu";
import { LiaTelegram } from "react-icons/lia";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { retweetPost, quoteRetweet } from "../../api/posts";
import {
  invalidatePostsFeed,
  invalidateTrendingHashtags,
  invalidateUserProfiles,
} from "../../utils/queryInvalidation";
import useMention from "../../hooks/useMention";
import MentionDropdown from "./MentionDropdown";
import EmojiPickerButton from "./EmojiPickerButton";
import ImagePreview from "./ImagePreview";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { useTheme } from "../../contexts/ThemeContext";

const MENU_W = 232;
const Z_MENU = 100060;

const RetweetDropdown = ({ post, onClose, anchorRef }) => {
  const [quoteMode, setQuoteMode] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [quoteImg, setQuoteImg] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const textareaRef = useRef(null);
  const imgRef = useRef(null);
  const menuPanelRef = useRef(null);
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const {
    showMentionDropdown,
    mentionQuery,
    mentionPosition,
    handleTextChange,
    handleSelectUser,
    closeMentionDropdown,
  } = useMention(quoteText, setQuoteText, textareaRef);

  const { mutate: directRetweet, isPending: isDirectRetweeting } = useMutation({
    mutationFn: () => retweetPost(post._id),
    onSuccess: (data) => {
      toast.success(data.retweeted ? "Gönderi retweet edildi." : "Retweet geri alındı.");
      invalidatePostsFeed(queryClient);
      invalidateTrendingHashtags(queryClient);
      invalidateUserProfiles(queryClient);
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Retweet edilirken bir hata oluştu.");
    },
  });

  const { mutate: quoteRetweetMutation, isPending: isQuoteRetweeting } = useMutation({
    mutationFn: () => quoteRetweet(post._id, { text: quoteText, img: quoteImg }),
    onSuccess: () => {
      toast.success("Alıntı paylaşıldı.");
      invalidatePostsFeed(queryClient);
      invalidateTrendingHashtags(queryClient);
      invalidateUserProfiles(queryClient);
      onClose();
      setQuoteMode(false);
      setQuoteText("");
      setQuoteImg(null);
    },
    onError: (error) => {
      toast.error(error.message || "Alıntı paylaşılırken bir hata oluştu.");
    },
  });

  const updateMenuPosition = useCallback(() => {
    const el = anchorRef?.current;
    if (!el || quoteMode) return;
    const r = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(r.left, window.innerWidth - MENU_W - 8));
    const top = r.top - 8;
    setMenuStyle({
      position: "fixed",
      left: `${left}px`,
      top: `${top}px`,
      transform: "translateY(-100%)",
      width: `${MENU_W}px`,
      zIndex: Z_MENU,
    });
  }, [anchorRef, quoteMode]);

  useLayoutEffect(() => {
    updateMenuPosition();
  }, [updateMenuPosition]);

  useEffect(() => {
    if (quoteMode) return;
    const onScroll = () => updateMenuPosition();
    const onResize = () => updateMenuPosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [quoteMode, updateMenuPosition]);

  useEffect(() => {
    if (quoteMode) return;
    const onDown = (e) => {
      const t = e.target;
      if (anchorRef?.current?.contains(t)) return;
      if (menuPanelRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [quoteMode, onClose, anchorRef]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir resim dosyası seçin.");
      return;
    }
    try {
      const { optimizeImage } = await import("../../utils/imageOptimizer");
      const optimizedImage = await optimizeImage(file, 9);
      setQuoteImg(optimizedImage);
      toast.success("Görsel eklendi.");
    } catch (error) {
      toast.error(error.message || "Görsel yüklenemedi.");
    }
  };

  const handleRemoveImage = () => {
    setQuoteImg(null);
    if (imgRef.current) imgRef.current.value = "";
  };

  const handleDirectRetweet = () => {
    directRetweet();
  };

  const handleQuoteRetweet = () => {
    if (!quoteText.trim() && !quoteImg) {
      toast.error("Alıntı metni veya görsel gerekli.");
      return;
    }
    quoteRetweetMutation();
  };

  const handleClose = () => {
    setQuoteMode(false);
    setQuoteText("");
    setQuoteImg(null);
    onClose();
  };

  const handleOpenQuote = () => {
    setQuoteMode(true);
  };

  const quoteModal =
    quoteMode &&
    createPortal(
      <>
        <button
          type="button"
          aria-label="Kapat"
          className="fixed inset-0 z-[100069] bg-neutral-900/55 backdrop-blur-[2px] dark:bg-black/65"
          onClick={handleClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100070] flex items-center justify-center p-3 sm:p-4 pointer-events-none"
        >
          <div
            className="pointer-events-auto flex max-h-[min(92vh,680px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-base-300/60 bg-base-100/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-base-300/40 bg-gradient-to-br from-accent/12 via-base-100 to-base-100 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <BiRepost className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-base-content sm:text-lg">Alıntı gönder</h2>
                  <p className="truncate text-xs text-base-content/60 sm:text-sm">
                    Düşünceni ekle; gönderi aşağıda önizlenir.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost shrink-0"
                onClick={handleClose}
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 space-y-4 p-4 sm:p-5">
                <div className="relative overflow-visible">
                  <textarea
                    ref={textareaRef}
                    value={quoteText}
                    onChange={(e) => handleTextChange(e)}
                    placeholder="Yorumunu yaz…"
                    className="textarea min-h-[100px] w-full resize-none border-base-300/60 bg-base-200/30 text-base leading-relaxed focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    maxLength={280}
                    rows={4}
                  />
                  <span className="pointer-events-none absolute bottom-2 right-2 text-xs text-base-content/45">
                    {quoteText.length}/280
                  </span>
                  <MentionDropdown
                    show={showMentionDropdown}
                    position={mentionPosition}
                    searchQuery={mentionQuery}
                    onSelectUser={handleSelectUser}
                    onClose={closeMentionDropdown}
                  />
                </div>

                {quoteImg && (
                  <ImagePreview imageUrl={quoteImg} onRemove={handleRemoveImage} />
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-base-300/40 pt-3">
                  <input
                    ref={imgRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm gap-2 rounded-full"
                    onClick={() => imgRef.current?.click()}
                  >
                    <CiImageOn className="h-5 w-5" />
                    Görsel
                  </button>
                  <EmojiPickerButton
                    theme={theme || "dark"}
                    onEmojiClick={(emoji) => setQuoteText((p) => p + emoji.emoji)}
                    showPicker={showEmojiPicker}
                    setShowPicker={setShowEmojiPicker}
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto border-t border-base-300/40 px-4 pb-4 sm:px-5 sm:pb-5">
                <div className="rounded-xl border border-base-300/50 bg-base-200/25 p-3 sm:p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-base-content/50">
                    Alıntılanan gönderi
                  </p>
                  <div className="flex gap-3">
                    <div className="avatar shrink-0">
                      <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-base-300/80">
                        <img
                          src={post.user?.profileImage || defaultProfilePicture}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sm font-semibold">{post.user?.fullname || "Kullanıcı"}</span>
                        <span className="text-sm text-base-content/55">@{post.user?.username || "kullanici"}</span>
                      </div>
                      {post.text && (
                        <p className="text-sm leading-relaxed text-base-content/90">{post.text}</p>
                      )}
                      {post.img && (
                        <img
                          src={post.img}
                          alt=""
                          className="mt-2 max-h-52 w-full rounded-lg border border-base-300/40 object-cover"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-base-300/50 bg-base-200/30 px-4 py-3 sm:px-5">
              <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={handleClose}>
                İptal
              </button>
              <button
                type="button"
                onClick={handleQuoteRetweet}
                disabled={isQuoteRetweeting || (!quoteText.trim() && !quoteImg)}
                className="btn btn-accent btn-sm gap-1.5 rounded-full px-5 font-semibold shadow-md"
              >
                {isQuoteRetweeting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    Paylaş
                    <LiaTelegram className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </>,
      document.body
    );

  const menuPortal =
    !quoteMode &&
    menuStyle &&
    createPortal(
      <div
        ref={menuPanelRef}
        style={menuStyle}
        className="overflow-hidden rounded-2xl border border-base-300/60 bg-base-100/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          <button
            type="button"
            onClick={handleDirectRetweet}
            disabled={isDirectRetweeting}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-base-200/70 disabled:opacity-50"
          >
            <BiRepost className="h-5 w-5 shrink-0 text-accent" />
            <span>Yeniden gönder</span>
          </button>
          <button
            type="button"
            onClick={handleOpenQuote}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-base-200/70"
          >
            <BiRepost className="h-5 w-5 shrink-0 text-base-content/70" />
            <span>Alıntı yap</span>
          </button>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      {menuPortal}
      {quoteModal}
    </>
  );
};

export default RetweetDropdown;
