import { CiImageOn } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import { LiaTelegram } from "react-icons/lia";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { useNavigate } from "react-router-dom";
import MentionDropdown from "../../components/common/MentionDropdown";
import EmojiPickerButton from "../../components/common/EmojiPickerButton";
import { useCreatePostForm } from "../../hooks/useCreatePostForm";

const CreatePost = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { authUser } = useAuth();

  const {
    text,
    img,
    showPicker,
    setShowPicker,
    imgRef,
    textareaRef,
    showMentionDropdown,
    mentionQuery,
    mentionPosition,
    handleTextChange,
    handleSelectUser,
    closeMentionDropdown,
    handleEmojiSelect,
    handleSubmit,
    handleImgChange,
    clearImage,
    isPending,
    isError,
    error,
    disabledSubmit,
  } = useCreatePostForm();

  return (
    <div className="border-b border-base-300/40 bg-gradient-to-b from-base-100 via-base-100 to-base-200/30 backdrop-blur-md">
      <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-4">
        <div className="relative overflow-visible rounded-2xl border border-base-300/45 bg-gradient-to-b from-base-100 to-base-200/40 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.06)] transition-[box-shadow,border-color] duration-300 hover:border-primary/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_-8px_rgba(0,0,0,0.08)] dark:from-base-200/90 dark:to-base-300/50 dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] dark:hover:border-primary/30">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <form
            onSubmit={handleSubmit}
            className="relative flex flex-col gap-3 p-4 sm:flex-row sm:gap-4 sm:p-5"
          >
            <div className="flex shrink-0 justify-center sm:block">
              <button
                type="button"
                className="group/avatar relative"
                onClick={() => navigate(`/profile/${authUser.username}`)}
                aria-label="Profiline git"
              >
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary/40 via-primary/10 to-transparent opacity-0 blur-sm transition-opacity duration-300 group-hover/avatar:opacity-100" />
                  <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-base-300/60 ring-offset-2 ring-offset-base-100 transition-all duration-300 group-hover/avatar:ring-primary/50 sm:h-12 sm:w-12">
                    <img
                      src={authUser?.profileImage || defaultProfilePicture}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </button>
            </div>

            <div className="relative min-w-0 flex-1">
              <div className="relative rounded-xl border border-transparent bg-base-200/35 transition-colors focus-within:border-primary/25 focus-within:bg-base-200/50 focus-within:shadow-[0_0_0_3px_oklch(48%_0.11_254_/_0.12)] dark:bg-base-300/25 dark:focus-within:bg-base-300/35">
                <textarea
                  ref={textareaRef}
                  className="textarea max-h-52 min-h-[5.5rem] w-full resize-none rounded-xl border-none bg-transparent px-3 py-3 text-[15px] leading-relaxed text-base-content placeholder:text-base-content/45 focus:outline-none sm:min-h-[6rem] sm:px-4 sm:py-3.5 sm:text-base modern-input"
                  placeholder="Neler oluyor?"
                  value={text}
                  onChange={handleTextChange}
                  rows={3}
                />
                {showMentionDropdown && (
                  <MentionDropdown
                    show={showMentionDropdown}
                    position={mentionPosition}
                    searchQuery={mentionQuery}
                    onSelectUser={handleSelectUser}
                    onClose={closeMentionDropdown}
                  />
                )}
              </div>

              {img && (
                <div className="relative mt-3 overflow-hidden rounded-xl border border-base-300/40 bg-base-200/20 shadow-inner">
                  <button
                    type="button"
                    className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-base-content/85 text-base-100 shadow-md backdrop-blur-sm transition-transform hover:scale-105 hover:bg-base-content"
                    onClick={clearImage}
                    aria-label="Görseli kaldır"
                  >
                    <IoCloseSharp className="h-5 w-5" />
                  </button>
                  <img
                    src={img}
                    className="max-h-80 w-full object-cover sm:max-h-96"
                    alt="Önizleme"
                  />
                </div>
              )}

              <div className="mt-3 flex flex-col gap-3 border-t border-base-300/35 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={imgRef}
                    onChange={handleImgChange}
                  />
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-200/60 text-base-content/70 transition-colors hover:bg-primary/15 hover:text-primary dark:bg-base-300/40"
                    onClick={() => imgRef.current?.click()}
                    aria-label="Görsel ekle"
                  >
                    <CiImageOn className="h-5 w-5" />
                  </button>

                  <EmojiPickerButton
                    theme={theme}
                    onEmojiClick={handleEmojiSelect}
                    showPicker={showPicker}
                    setShowPicker={setShowPicker}
                    buttonClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-base-200/60 transition-colors hover:bg-primary/15 dark:bg-base-300/40"
                    iconClassName={theme === "dark" ? "fill-amber-400/95" : "fill-sky-500"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={disabledSubmit}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-content shadow-lg shadow-primary/25 transition-[transform,box-shadow,opacity] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 sm:ml-auto sm:w-auto sm:min-w-[7.5rem]"
                >
                  {isPending ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <>
                      Paylaş
                      <LiaTelegram className="h-4 w-4 opacity-90" />
                    </>
                  )}
                </button>
              </div>

              {isError && (
                <p className="mt-2 text-sm text-error" role="alert">
                  {error.message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
