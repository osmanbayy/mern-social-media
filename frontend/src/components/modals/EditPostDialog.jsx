import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { LuSquarePen, LuX } from "react-icons/lu";
import { LiaTelegram } from "react-icons/lia";
import EmojiPicker from "emoji-picker-react";

import LoadingSpinner from "../common/LoadingSpinner";
import { editPost } from "../../api/posts";
import { invalidatePostsFeed } from "../../utils/invalidatePostsFeed";
import useMention from "../../hooks/useMention";
import MentionDropdown from "../common/MentionDropdown";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";

const EditPostDialog = ({ post, onClose, modalId = "edit_post_modal" }) => {
  const [text, setText] = useState(post.text || "");
  const [img, setImg] = useState(post.img || "");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef(null);
  const imgRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const queryClient = useQueryClient();
  const { authUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const closeAndNotify = useCallback(() => {
    setIsOpen(false);
    setShowPicker(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    let modalElement = document.getElementById(modalId);
    if (!modalElement) {
      modalElement = document.createElement("div");
      modalElement.id = modalId;
      modalElement.style.display = "none";
      document.body.appendChild(modalElement);
    }

    modalElement.showModal = function () {
      setIsOpen(true);
    };

    modalElement.close = function () {
      setIsOpen(false);
    };

    const handleOpen = () => setIsOpen(true);
    const handleCloseEvt = () => {
      setIsOpen(false);
      onClose();
    };

    modalElement.addEventListener("open", handleOpen);
    modalElement.addEventListener("close", handleCloseEvt);

    return () => {
      modalElement.removeEventListener("open", handleOpen);
      modalElement.removeEventListener("close", handleCloseEvt);
    };
  }, [modalId, onClose]);

  const {
    showMentionDropdown,
    mentionQuery,
    mentionPosition,
    handleTextChange,
    handleSelectUser,
    closeMentionDropdown,
  } = useMention(text, setText, textareaRef);

  useEffect(() => {
    if (!isOpen) return;
    const t = requestAnimationFrame(() => textareaRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [isOpen]);

  useEffect(() => {
    if (!showPicker) return;
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showPicker]);

  useEffect(() => {
    if (!showPicker || !emojiButtonRef.current || !emojiPickerRef.current) return;
    const button = emojiButtonRef.current;
    const picker = emojiPickerRef.current;
    const buttonRect = button.getBoundingClientRect();
    const pickerRect = picker.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let left = 0;
    let top = buttonRect.height + 8;
    let transform = "";
    if (buttonRect.left + pickerRect.width > viewportWidth) {
      left = viewportWidth - buttonRect.right;
      transform = "translateX(-100%)";
    }
    if (buttonRect.bottom + pickerRect.height > viewportHeight) {
      top = -(pickerRect.height + 8);
      transform = transform ? `${transform} translateY(-100%)` : "translateY(-100%)";
    }
    picker.style.left = `${left}px`;
    picker.style.top = `${top}px`;
    picker.style.transform = transform || "";
  }, [showPicker]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeAndNotify();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeAndNotify]);

  const { mutate: editPostMutation, isPending: isEditing } = useMutation({
    mutationFn: () => editPost(post._id, { text, img }),
    onSuccess: () => {
      toast.success("Gönderi güncellendi.");
      invalidatePostsFeed(queryClient);
      queryClient.invalidateQueries({ queryKey: ["post", post._id] });
      closeAndNotify();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir resim dosyası seçin.");
      return;
    }

    setIsImageUploading(true);
    try {
      const { optimizeImage } = await import("../../utils/imageOptimizer");
      const optimizedImage = await optimizeImage(file, 9);
      setImg(optimizedImage);
      toast.success("Görsel hazır.");
    } catch (error) {
      toast.error(error.message || "Görsel yüklenemedi.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !img) {
      toast.error("Gönderi boş olamaz.");
      return;
    }
    editPostMutation();
  };

  const handleRemoveImage = () => {
    setImg("");
    if (imgRef.current) imgRef.current.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-[2px] transition-opacity dark:bg-black/70"
        onClick={closeAndNotify}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-post-title"
        className="relative flex max-h-[min(92vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-base-300/60 bg-base-100/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-base-300/40 bg-gradient-to-br from-accent/12 via-base-100 to-base-100 px-4 py-4 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent ring-4 ring-accent/10">
              <LuSquarePen className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 id="edit-post-title" className="text-lg font-bold tracking-tight text-base-content">
                Gönderiyi düzenle
              </h2>
              <p className="truncate text-sm text-base-content/60">
                Metni ve görseli güncelle; bahsetmeler aynı şekilde çalışır.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost shrink-0 text-base-content/70 hover:bg-base-200/80"
            onClick={closeAndNotify}
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          <div className="flex flex-1 gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
            <button
              type="button"
              className="avatar shrink-0 pt-1"
              onClick={() => authUser?.username && navigate(`/profile/${authUser.username}`)}
            >
              <div className="h-10 w-10 rounded-full ring-2 ring-base-300/80 transition hover:ring-accent/50">
                <img
                  src={authUser?.profileImage || defaultProfilePicture}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </button>

            <div className="relative min-w-0 flex-1">
              <textarea
                ref={textareaRef}
                className="textarea min-h-[120px] w-full resize-none border-none bg-transparent px-0 py-1 text-base leading-relaxed text-base-content placeholder:text-base-content/45 focus:outline-none modern-input"
                placeholder="Ne düşünüyorsun?"
                value={text}
                onChange={handleTextChange}
                rows={5}
              />
              <MentionDropdown
                show={showMentionDropdown}
                position={mentionPosition}
                searchQuery={mentionQuery}
                onSelectUser={handleSelectUser}
                onClose={closeMentionDropdown}
              />

              {img && (
                <div className="relative mt-3 w-full max-w-md overflow-hidden rounded-2xl border border-base-300/50">
                  <button
                    type="button"
                    className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90 hover:scale-105"
                    onClick={handleRemoveImage}
                  >
                    <IoCloseSharp className="h-5 w-5" />
                  </button>
                  <img src={img} alt="" className="max-h-80 w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-base-300/50 bg-base-200/30 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={imgRef}
                  onChange={handleImageUpload}
                  disabled={isImageUploading || isEditing}
                />
                <button
                  type="button"
                  className="rounded-full p-2 transition hover:bg-accent/10 disabled:opacity-50"
                  disabled={isImageUploading || isEditing}
                  onClick={() => imgRef.current?.click()}
                  aria-label="Görsel ekle"
                >
                  {isImageUploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <CiImageOn className="h-5 w-5 text-base-content/55" />
                  )}
                </button>

                <div className="relative">
                  <button
                    type="button"
                    ref={emojiButtonRef}
                    className="rounded-full p-2 transition hover:bg-accent/10"
                    onClick={() => setShowPicker((v) => !v)}
                    aria-label="Emoji"
                  >
                    <BsEmojiSmileFill
                      className={`h-5 w-5 ${theme === "dark" ? "fill-yellow-400" : "fill-blue-500"}`}
                    />
                  </button>
                  {showPicker && (
                    <>
                      <div
                        className="fixed inset-0 z-[100] bg-black/20 md:hidden"
                        onClick={() => setShowPicker(false)}
                      />
                      <div
                        ref={emojiPickerRef}
                        className="absolute z-[110] max-h-[min(440px,70vh)] overflow-hidden rounded-2xl border border-base-300/50 bg-base-100 shadow-2xl animate-dropdownFadeIn"
                        style={{
                          maxWidth: "calc(100vw - 2rem)",
                          maxHeight: "calc(100vh - 200px)",
                        }}
                      >
                        <div className="max-h-[400px] overflow-y-auto md:hidden">
                          <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            theme={theme === "dark" ? "dark" : "nord"}
                            width={typeof window !== "undefined" ? Math.min(window.innerWidth - 32, 352) : 320}
                            height={400}
                            previewConfig={{ showPreview: false }}
                            searchDisabled={false}
                            skinTonesDisabled
                          />
                        </div>
                        <div className="hidden md:block">
                          <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            theme={theme === "dark" ? "dark" : "nord"}
                            width={352}
                            height={435}
                            previewConfig={{ showPreview: true }}
                            searchDisabled={false}
                            skinTonesDisabled
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm rounded-full px-4 font-medium"
                  onClick={closeAndNotify}
                  disabled={isEditing}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn btn-accent btn-sm gap-1.5 rounded-full px-5 font-semibold shadow-md transition hover:shadow-lg disabled:opacity-50"
                  disabled={isEditing || (!text.trim() && !img)}
                >
                  {isEditing ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <>
                      Kaydet
                      <LiaTelegram className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostDialog;
