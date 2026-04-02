import { CiImageOn } from "react-icons/ci";
import { LiaTelegram } from "react-icons/lia";
import { useNavigate } from "react-router-dom";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import MentionDropdown from "./MentionDropdown";
import ImagePreview from "./ImagePreview";
import EmojiPickerButton from "./EmojiPickerButton";
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
  } = useCreatePostForm({ onPosted: () => navigate("/") });

  return (
    <div className="w-full flex p-5 items-start gap-4 border-b border-base-300/50 bg-base-100/50 backdrop-blur-sm">
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

        <div className="flex justify-between items-center border-t border-base-300/50 pt-3">
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-full hover:bg-primary/10 transition-all duration-200 cursor-pointer group">
              <CiImageOn
                className="w-5 h-5 text-base-content/60 group-hover:text-primary transition-colors"
                onClick={() => imgRef.current?.click()}
              />
            </div>
            <EmojiPickerButton
              theme={theme}
              onEmojiClick={handleEmojiSelect}
              showPicker={showPicker}
              setShowPicker={setShowPicker}
            />
          </div>
          <input type="file" accept="image/*" hidden ref={imgRef} onChange={handleImgChange} />
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
        {isError && <div className="text-error text-sm mt-2">{error.message}</div>}
      </form>
    </div>
  );
};

export default PostCreate;
