import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createPost } from "../api/posts";
import { invalidatePostsFeed } from "../utils/queryInvalidation";
import useMention from "./useMention";

/**
 * @param {{ onPosted?: () => void }} [options] — Tam sayfa `/create-post` gibi akışlarda ek işlem (ör. yönlendirme)
 */
export function useCreatePostForm(options = {}) {
  const { onPosted } = options;
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

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

  const buildPollPayload = () => {
    if (!pollEnabled) return undefined;
    const opts = pollOptions.map((s) => s.trim()).filter(Boolean);
    if (opts.length < 2) return undefined;
    const payload = { options: opts.map((t) => ({ text: t })) };
    const q = pollQuestion.trim();
    if (q) payload.question = q;
    return payload;
  };

  const {
    mutate: createPostMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: ({ text: t, img: image, location, poll }) => {
      const payload = { text: t };
      if (image) payload.img = image;
      if (poll) payload.poll = poll;
      if (location) payload.location = location;
      return createPost(payload);
    },
    onSuccess: () => {
      setText("");
      setImg(null);
      setSelectedPlace(null);
      setPollEnabled(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
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
    const poll = buildPollPayload();
    createPostMutation({
      text,
      img,
      poll,
      location: selectedPlace || undefined,
    });
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

  const pollPayloadOk = buildPollPayload();
  const canSubmit = Boolean(
    text.trim() ||
      img ||
      selectedPlace?.name ||
      pollPayloadOk
  );
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
    selectedPlace,
    setSelectedPlace,
    pollEnabled,
    setPollEnabled,
    pollQuestion,
    setPollQuestion,
    pollOptions,
    setPollOptions,
  };
}
