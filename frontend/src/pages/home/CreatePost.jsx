import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { LiaTelegram } from "react-icons/lia";
import EmojiPicker from "emoji-picker-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  // Mention functionality
  const {
    showMentionDropdown,
    mentionQuery,
    mentionPosition,
    handleTextChange,
    handleSelectUser,
    closeMentionDropdown,
  } = useMention(text, setText, textareaRef);

  const getTheme = () => {
    const dataTheme = document.documentElement.getAttribute("data-theme");
    return dataTheme || localStorage.getItem("theme") || "dark";
  };

  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    const updateTheme = () => {
      setTheme(getTheme());
    };

    updateTheme();

    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const handleStorageChange = () => {
      setTheme(getTheme());
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const handleEmojiClick = (emojiObject) => {
    setText((prevText) => prevText + emojiObject.emoji);
  };

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

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
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
              <div className="p-2 rounded-full hover:bg-primary/10 transition-all duration-200 cursor-pointer group">
                <BsEmojiSmileFill
                  onClick={() => setShowPicker(!showPicker)}
                  className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 ${
                    theme === "dark" ? "fill-yellow-400" : "fill-blue-500"
                  }`}
                />
              </div>
              {showPicker && (
                <div className="absolute top-full left-0 z-20 mt-2 shadow-2xl rounded-2xl overflow-hidden">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={theme === "dark" ? "dark" : "light"}
                  />
                </div>
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
