import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createPost } from "../api/posts";
import { invalidatePostsFeed } from "../utils/invalidatePostsFeed";
import useMention from "./useMention";

/**
 * @param {{ onPosted?: () => void }} [options] — Tam sayfa `/create-post` gibi akışlarda ek işlem (ör. yönlendirme)
 */
export function useCreatePostForm(options = {}) {
  const { onPosted } = options;
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const imgRef = useRef(null);
  const textareaRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    showMentionDropdown,
    mentionQuery,
    mentionPosition,
    handleTextChange,
    handleSelectUser,
    closeMentionDropdown,
  } = useMention(text, setText, textareaRef);

  const {
    mutate: createPostMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: ({ text: t, img: image }) => {
      // Backend: img optional + isString — null JSON alanı hataya düşer; sadece varsa gönder
      const payload = { text: t };
      if (image) payload.img = image;
      return createPost(payload);
    },
    onSuccess: () => {
      setText("");
      setImg(null);
      toast.success("Gönderi paylaşıldı.");
      invalidatePostsFeed(queryClient);
      onPosted?.();
    },
  });

  const handleEmojiSelect = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createPostMutation({ text, img });
  };

  const handleImgChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir resim dosyası seçin.");
      return;
    }

    try {
      const { optimizeImage } = await import("../utils/imageOptimizer");
      const optimizedImage = await optimizeImage(file, 9);
      setImg(optimizedImage);
    } catch (err) {
      toast.error(err.message || "Resim yüklenirken bir hata oluştu.");
    }
  };

  const clearImage = () => {
    setImg(null);
    if (imgRef.current) imgRef.current.value = null;
  };

  const canSubmit = Boolean(text.trim() || img);
  const disabledSubmit = isPending || !canSubmit;

  return {
    text,
    setText,
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
  };
}
