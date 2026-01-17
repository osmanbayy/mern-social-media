import { CiImageOn } from "react-icons/ci";
import { useRef, useState } from "react";
import { LiaTelegram } from "react-icons/lia";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import useMention from "../../hooks/useMention";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import MentionDropdown from "./MentionDropdown";
import ImagePreview from "./ImagePreview";
import EmojiPickerButton from "./EmojiPickerButton";
import { createPost } from "../../api/posts";
import { optimizeImage, isImageFile } from "../../utils/imageOptimizer";

const PostCreate = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const imgRef = useRef(null);
  const textareaRef = useRef(null);
  const theme = useTheme();

  // Mention functionality
  const {
    showMentionDropdown,
    mentionQuery,
    mentionPosition,
    handleTextChange,
    handleSelectUser,
    closeMentionDropdown,
  } = useMention(text, setText, textareaRef);

  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleEmojiClick = (emojiObject) => {
    setText((prevText) => prevText + emojiObject.emoji);
  };

  const { mutate: createPostMutation, isPending, isError, error } = useMutation({
    mutationFn: ({ text, img }) => createPost({ text, img }),
    onSuccess: () => {
      setText("");
      setImg(null);
      toast.success("Gönderi paylaşıldı.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPostMutation({ text, img });
  };

  const handleImgChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isImageFile(file)) {
      toast.error("Lütfen bir resim dosyası seçin.");
      return;
    }

    try {
      // Optimize image if it's over 10MB
      const optimizedImage = await optimizeImage(file, 9);
      setImg(optimizedImage);
    } catch (error) {
      toast.error(error.message || "Resim yüklenirken bir hata oluştu.");
      if (imgRef.current) imgRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImg(null);
    if (imgRef.current) {
      imgRef.current.value = null;
    }
  };

  return (
    <div className="w-full flex p-5 items-start gap-4 border-b border-base-300/50 bg-base-100/50 backdrop-blur-sm">
      <div className="avatar flex-shrink-0">
        <div className="w-10 h-10 rounded-full ring-2 ring-base-300 hover:ring-primary transition-all duration-300">
          <img 
            src={authUser?.profileImage || defaultProfilePicture}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>
      <form
        className="relative flex flex-col gap-3 w-full"
        onSubmit={handleSubmit}
      >
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
        <ImagePreview imageUrl={img} onRemove={handleRemoveImage} />

        <div className="flex justify-between items-center border-t border-base-300/50 pt-3">
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-full hover:bg-primary/10 transition-all duration-200 cursor-pointer group">
              <CiImageOn
                className="w-5 h-5 text-base-content/60 group-hover:text-primary transition-colors"
                onClick={() => imgRef.current.click()}
              />
            </div>
            <EmojiPickerButton
              theme={theme}
              onEmojiClick={handleEmojiClick}
              showPicker={showPicker}
              setShowPicker={setShowPicker}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <button 
            className="btn btn-primary rounded-full btn-sm text-white px-6 hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={isPending || (!text.trim() && !img)}
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                Paylaş <LiaTelegram className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        {isError && (
          <div className="text-error text-sm mt-2">{error.message}</div>
        )}
      </form>
    </div>
  );
};
export default PostCreate;
