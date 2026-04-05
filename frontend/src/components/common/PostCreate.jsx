import { CiImageOn } from "react-icons/ci";
import { LiaTelegram } from "react-icons/lia";
import { useNavigate } from "react-router-dom";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import MentionDropdown from "./MentionDropdown";
import ImagePreview from "./ImagePreview";
import LocationPreview from "./LocationPreview";
import EmojiPickerButton from "./EmojiPickerButton";
import NearbyPlacePicker from "./NearbyPlacePicker";
import PostComposerPollFields, { PostComposerPollToggleButton } from "./PostComposerPollFields";
import { useCreatePostForm } from "../../hooks/useCreatePostForm";

/** Tam ekran `/create-post` rotası — paylaşımdan sonra ana sayfaya döner */
const PostCreate = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const { theme } = useTheme();

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
    selectedPlace,
    setSelectedPlace,
    pollEnabled,
    setPollEnabled,
    pollQuestion,
    setPollQuestion,
    pollOptions,
    setPollOptions,
  } = useCreatePostForm({ onPosted: () => navigate("/") });

  return (
    <div className="relative z-[8] flex w-full items-start gap-4 border-b border-base-300/50 bg-base-100/50 p-5 backdrop-blur-sm">
      <div className="avatar flex-shrink-0">
        <div className="w-10 h-10 rounded-full ring-2 ring-base-300 hover:ring-primary transition-all duration-300">
          <img
            src={authUser?.profileImage || defaultProfilePicture}
            className="w-full h-full rounded-full object-cover"
            alt=""
          />
        </div>
      </div>
      <form className="relative flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            className="textarea w-full px-2 py-2 text-base resize-none border-none outline-none focus:outline-none bg-transparent placeholder:text-base-content/50 modern-input"
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
        <ImagePreview imageUrl={img} onRemove={clearImage} />
        <LocationPreview
          place={selectedPlace}
          onRemove={() => setSelectedPlace(null)}
          className="max-w-md mx-auto w-full"
        />

        <div className="flex justify-between items-center border-t border-base-300/50 pt-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <input type="file" accept="image/*" hidden ref={imgRef} onChange={handleImgChange} />
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200/60 text-base-content/70 transition-colors hover:bg-primary/15 hover:text-primary dark:bg-base-300/40"
              onClick={() => imgRef.current?.click()}
              aria-label="Görsel ekle"
            >
              <CiImageOn className="h-5 w-5" />
            </button>
            <NearbyPlacePicker
              iconOnly
              value={selectedPlace}
              onChange={setSelectedPlace}
              disabled={isPending}
            />
            <PostComposerPollToggleButton
              enabled={pollEnabled}
              disabled={isPending}
              onToggle={setPollEnabled}
            />
            <EmojiPickerButton
              theme={theme}
              onEmojiClick={handleEmojiSelect}
              showPicker={showPicker}
              setShowPicker={setShowPicker}
              buttonClassName="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200/60 transition-colors hover:bg-primary/15 dark:bg-base-300/40"
              iconClassName={theme === "dark" ? "fill-amber-400/95" : "fill-sky-500"}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary rounded-full btn-sm text-white px-6 transition-transform duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={disabledSubmit}
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                Paylaş <LiaTelegram className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        {pollEnabled && (
          <PostComposerPollFields
            question={pollQuestion}
            onQuestionChange={setPollQuestion}
            options={pollOptions}
            onOptionsChange={setPollOptions}
            disabled={isPending}
          />
        )}
        {isError && <div className="text-error text-sm mt-2">{error.message}</div>}
      </form>
    </div>
  );
};

export default PostCreate;
