import { useState, useRef, useEffect } from "react";
import { BiRepost } from "react-icons/bi";
import { LuX } from "react-icons/lu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { retweetPost, quoteRetweet } from "../../api/posts";
import useMention from "../../hooks/useMention";
import MentionDropdown from "./MentionDropdown";
import EmojiPickerButton from "./EmojiPickerButton";
import ImagePreview from "./ImagePreview";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { useTheme } from "../../contexts/ThemeContext";

const RetweetDropdown = ({ post, isRetweeted, onClose }) => {
  const [quoteMode, setQuoteMode] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [quoteImg, setQuoteImg] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const imgRef = useRef(null);
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
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Retweet edilirken bir hata oluştu.");
    },
  });

  const { mutate: quoteRetweetMutation, isPending: isQuoteRetweeting } = useMutation({
    mutationFn: () => quoteRetweet(post._id, { text: quoteText, img: quoteImg }),
    onSuccess: () => {
      toast.success("Alıntı retweet paylaşıldı.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onClose();
      setQuoteMode(false);
      setQuoteText("");
      setQuoteImg(null);
    },
    onError: (error) => {
      toast.error(error.message || "Alıntı retweet paylaşılırken bir hata oluştu.");
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir resim dosyası seçin.");
      return;
    }

    try {
      // Optimize image if it's over 10MB
      const { optimizeImage } = await import("../../utils/imageOptimizer");
      const optimizedImage = await optimizeImage(file, 9);
      setQuoteImg(optimizedImage);
      toast.success("Resim başarıyla yüklendi.");
    } catch (error) {
      toast.error(error.message || "Resim yüklenirken bir hata oluştu.");
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
      toast.error("Alıntı metni veya resim gereklidir.");
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

  // If quote mode is active, show modal with quote form
  if (quoteMode) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          onClick={handleClose}
        />
        
        {/* Quote Retweet Modal - Twitter style */}
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-base-300/50">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <LuX className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-lg">Alıntı Retweet</h3>
              <button
                type="button"
                onClick={handleQuoteRetweet}
                disabled={isQuoteRetweeting || (!quoteText.trim() && !quoteImg)}
                className="btn btn-primary btn-sm rounded-full px-6"
              >
                {isQuoteRetweeting ? "Paylaşılıyor..." : "Paylaş"}
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Quote Form */}
              <div className="p-4 space-y-3">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={quoteText}
                    onChange={(e) => handleTextChange(e)}
                    placeholder="Ne düşünüyorsun?"
                    className="textarea textarea-bordered w-full min-h-[120px] resize-none text-lg"
                    maxLength={280}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-base-content/50">
                    {quoteText.length}/280
                  </div>
                </div>
                
                {quoteImg && (
                  <ImagePreview
                    image={quoteImg}
                    onRemove={handleRemoveImage}
                  />
                )}
              </div>
              
              {/* Original Post Preview */}
              <div className="border-t border-base-300/50 p-4">
                <div className="flex gap-3 items-start">
                  <div className="avatar flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-base-300">
                      <img 
                        src={post.user?.profileImage || defaultProfilePicture}
                        alt={post.user?.fullname || "Kullanıcı"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {post.user?.fullname || "Kullanıcı"}
                      </span>
                      <span className="text-sm text-base-content/60">
                        @{post.user?.username || "kullanici"}
                      </span>
                    </div>
                    {post.text && (
                      <p className="text-sm mb-2">{post.text}</p>
                    )}
                    {post.img && (
                      <img
                        src={post.img}
                        alt=""
                        className="w-full max-h-64 object-cover rounded-xl border border-base-300/50"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer with actions */}
            <div className="p-4 border-t border-base-300/50 flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  ref={imgRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <span className="btn btn-ghost btn-sm">📷</span>
              </label>
              <EmojiPickerButton
                theme={theme || "dark"}
                onEmojiClick={(emoji) =>
                  setQuoteText((prev) => prev + emoji.emoji)
                }
                showPicker={showEmojiPicker}
                setShowPicker={setShowEmojiPicker}
              />
            </div>
            
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
        </div>
      </>
    );
  }

  // Initial dropdown options - Twitter style
  return (
    <div 
      className="absolute bottom-full left-0 mb-2 bg-base-100 rounded-2xl border border-base-300/50 shadow-2xl z-[100] min-w-[200px] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-1">
        <button
          type="button"
          onClick={handleDirectRetweet}
          disabled={isDirectRetweeting}
          className="w-full px-4 py-3 text-left hover:bg-base-200/50 transition-colors flex items-center gap-3 text-sm font-medium"
        >
          <BiRepost className="w-5 h-5" />
          <span>Yeniden Gönder</span>
        </button>
        <button
          type="button"
          onClick={() => setQuoteMode(true)}
          className="w-full px-4 py-3 text-left hover:bg-base-200/50 transition-colors flex items-center gap-3 text-sm font-medium"
        >
          <BiRepost className="w-5 h-5" />
          <span>Alıntı Yap</span>
        </button>
      </div>
    </div>
  );
};

export default RetweetDropdown;
