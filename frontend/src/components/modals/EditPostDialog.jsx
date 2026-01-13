import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";
import { editPost } from "../../api/posts";
import useMention from "../../hooks/useMention";
import MentionDropdown from "../common/MentionDropdown";

const EditPostDialog = ({ post, onClose, modalId = "edit_post_modal" }) => {
  const [text, setText] = useState(post.text || "");
  const [img, setImg] = useState(post.img || "");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const textareaRef = useRef(null);

  const queryClient = useQueryClient();

  // Mention functionality
  const {
    showMentionDropdown,
    mentionQuery,
    mentionPosition,
    handleTextChange,
    handleSelectUser,
    closeMentionDropdown,
  } = useMention(text, setText, textareaRef);

  // Edit post mutation
  const { mutate: editPostMutation, isPending: isEditing } = useMutation({
    mutationFn: () => editPost(post._id, { text, img }),
    onSuccess: () => {
      toast.success("Gönderi başarıyla düzenlendi.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resim boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    setIsImageUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setImg(base64String);
        toast.success("Resim başarıyla yüklendi.");
        setIsImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Resim yüklenirken bir hata oluştu.");
      setIsImageUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !img) {
      toast.error("Gönderiniz boş olamaz.");
      return;
    }
    editPostMutation();
  };

  const handleRemoveImage = () => {
    setImg("");
  };

  return (
    <dialog id={modalId} className="modal border-none outline-none">
      <div className="modal-box rounded shadow-2xl max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Gönderiyi Düzenle</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              className="textarea w-full p-3 rounded-lg text-md resize-none border focus:outline-none border-gray-700 bg-base-200"
              placeholder="Ne düşünüyorsun?"
              value={text}
              onChange={handleTextChange}
              rows={2}
            />
            <MentionDropdown
              show={showMentionDropdown}
              position={mentionPosition}
              searchQuery={mentionQuery}
              onSelectUser={handleSelectUser}
              onClose={closeMentionDropdown}
            />
          </div>

          {img && (
            <div className="relative">
              <img
                src={img}
                alt="Post image"
                className="w-full max-h-80 object-contain rounded-lg border border-gray-700"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/80 cursor-pointer text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isImageUploading}
              />
              <div className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
                {isImageUploading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{isImageUploading ? "Yükleniyor..." : "Resim Ekle"}</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isEditing}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isEditing || (!text.trim() && !img)}
            >
              {isEditing ? <LoadingSpinner size="sm" /> : "Güncelle"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button className="outline-none">Kapat</button>
      </form>
    </dialog>
  );
};

export default EditPostDialog;
