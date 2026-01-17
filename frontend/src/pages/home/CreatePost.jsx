import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { LiaTelegram } from "react-icons/lia";
import EmojiPicker from "emoji-picker-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { toast } from "react-hot-toast";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../api/posts";
import useMention from "../../hooks/useMention";
import MentionDropdown from "../../components/common/MentionDropdown";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const navigate = useNavigate();

  const [showPicker, setShowPicker] = useState(false);
  const imgRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Mention functionality
  const {
    showMentionDropdown,
    mentionQuery,
    mentionPosition,
    handleTextChange,
    handleSelectUser,
    closeMentionDropdown,
  } = useMention(text, setText, textareaRef);

  const { theme } = useTheme();
  const { authUser } = useAuth();
  const queryClient = useQueryClient();

  const handleEmojiClick = (emojiObject) => {
    setText((prevText) => prevText + emojiObject.emoji);
  };

  // Close emoji picker when clicking outside
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

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPicker]);

  // Calculate emoji picker position
  useEffect(() => {
    if (!showPicker || !emojiButtonRef.current || !emojiPickerRef.current) return;

    const button = emojiButtonRef.current;
    const picker = emojiPickerRef.current;
    const buttonRect = button.getBoundingClientRect();
    const pickerRect = picker.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = 0;
    let top = buttonRect.height + 8; // mt-2 equivalent
    let transform = '';

    // Check if picker would overflow on the right
    if (buttonRect.left + pickerRect.width > viewportWidth) {
      left = viewportWidth - buttonRect.right;
      transform = 'translateX(-100%)';
    }

    // Check if picker would overflow on the bottom (mobile)
    if (buttonRect.bottom + pickerRect.height > viewportHeight) {
      top = -(pickerRect.height + 8);
      transform = transform ? `${transform} translateY(-100%)` : 'translateY(-100%)';
    }

    picker.style.left = `${left}px`;
    picker.style.top = `${top}px`;
    if (transform) {
      picker.style.transform = transform;
    }
  }, [showPicker]);

  const {
    mutate: createPostMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: ({ text, img }) => createPost({ text, img }),
    onSuccess: () => {
      setText("");
      setImg(null);
      toast.success("Gönderi paylaşıldı.");
      queryClient.invalidateQueries("posts");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
      createPostMutation({ text, img });
  };

  const handleImgChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir resim dosyası seçin.");
      return;
    }

    try {
      // Optimize image if it's over 10MB
      const { optimizeImage, isImageFile } = await import("../../utils/imageOptimizer");
      if (!isImageFile(file)) {
        toast.error("Lütfen bir resim dosyası seçin.");
        return;
      }
      const optimizedImage = await optimizeImage(file, 9);
      setImg(optimizedImage);
    } catch (error) {
      toast.error(error.message || "Resim yüklenirken bir hata oluştu.");
    }
  };

  return (
    <div className="flex p-5 items-start gap-4 border-b border-base-300/50 bg-base-100/50 backdrop-blur-sm">
      <div className="avatar flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full ring-2 ring-base-300 hover:ring-primary transition-all duration-300 cursor-pointer"
          onClick={() => navigate(`/profile/${authUser.username}`)}
        >
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
        {img && (
          <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-base-300/50 group">
            <button
              type="button"
              className="absolute top-2 right-2 z-10 text-white bg-black/70 hover:bg-black/90 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110"
              onClick={() => {
                setImg(null);
                imgRef.current.value = null;
              }}
            >
              <IoCloseSharp className="w-5 h-5" />
            </button>
            <img
              src={img}
              className="w-full h-auto max-h-96 object-cover"
              alt="Preview"
            />
          </div>
        )}

        <div className="flex justify-between items-center border-t border-base-300/50 pt-3">
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-full hover:bg-primary/10 transition-all duration-200 cursor-pointer group">
              <CiImageOn
                className="w-5 h-5 text-base-content/60 group-hover:text-primary transition-colors"
                onClick={() => imgRef.current.click()}
              />
            </div>
            <div className="relative">
              <div 
                ref={emojiButtonRef}
                className="p-2 rounded-full hover:bg-primary/10 transition-all duration-200 cursor-pointer group"
              >
                <BsEmojiSmileFill
                  onClick={() => setShowPicker(!showPicker)}
                  className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 ${
                    theme === "dark" ? "fill-yellow-400" : "fill-blue-500"
                  }`}
                />
              </div>
              {showPicker && (
                <>
                  {/* Backdrop for mobile */}
                  <div 
                    className="fixed inset-0 z-[50] md:hidden bg-black/20"
                    onClick={() => setShowPicker(false)}
                  />
                  <div 
                    ref={emojiPickerRef}
                    className="absolute z-[60] shadow-2xl rounded-2xl overflow-hidden bg-base-100 border border-base-300/50 animate-dropdownFadeIn"
                    style={{
                      maxWidth: 'calc(100vw - 2rem)',
                      maxHeight: 'calc(100vh - 200px)',
                    }}
                  >
                    <div className="md:hidden max-h-[400px] overflow-y-auto">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={theme === "dark" ? "dark" : "nord"}
                        width="100%"
                        height={400}
                        previewConfig={{ showPreview: false }}
                        searchDisabled={false}
                        skinTonesDisabled={true}
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
                        skinTonesDisabled={true}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
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
        {isError && <div className="text-error text-sm mt-2">{error.message}</div>}
      </form>
    </div>
  );
};
export default CreatePost;
