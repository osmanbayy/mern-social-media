import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { uploadChatFile } from "../api/upload";

const MAX_PENDING_ATTACHMENTS = 5;

/**
 * Sohbet yazıcısı: bekleyen dosyalar, yükleme ve önizleme URL temizliği.
 */
export function usePendingChatAttachments() {
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const pendingAttachmentsRef = useRef(pendingAttachments);
  pendingAttachmentsRef.current = pendingAttachments;

  useEffect(() => {
    return () => {
      pendingAttachmentsRef.current.forEach((p) => {
        if (p.localPreviewUrl) URL.revokeObjectURL(p.localPreviewUrl);
      });
    };
  }, []);

  const removePendingAttachment = useCallback((clientId) => {
    setPendingAttachments((prev) => {
      const item = prev.find((x) => x.clientId === clientId);
      if (item?.localPreviewUrl) URL.revokeObjectURL(item.localPreviewUrl);
      return prev.filter((x) => x.clientId !== clientId);
    });
  }, []);

  const handleChatFiles = useCallback(async (e) => {
    const input = e.target;
    const files = Array.from(input.files || []);
    input.value = "";
    if (!files.length) return;

    for (const file of files) {
      const clientId = `c-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const isVisual =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const localPreviewUrl = isVisual ? URL.createObjectURL(file) : null;

      let added = false;
      setPendingAttachments((prev) => {
        if (prev.length >= MAX_PENDING_ATTACHMENTS) return prev;
        added = true;
        return [
          ...prev,
          {
            clientId,
            status: "uploading",
            localPreviewUrl,
            originalName: file.name,
            mimeType: file.type || "",
          },
        ];
      });

      if (!added) {
        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        break;
      }

      try {
        const u = await uploadChatFile(file);
        setPendingAttachments((prev) =>
          prev.map((item) =>
            item.clientId === clientId && item.status === "uploading"
              ? { clientId, status: "ready", ...u }
              : item
          )
        );
        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      } catch (err) {
        toast.error(err?.message || "Yüklenemedi");
        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        setPendingAttachments((prev) => prev.filter((item) => item.clientId !== clientId));
      }
    }
  }, []);

  const clearPendingAttachments = useCallback(() => {
    setPendingAttachments((prev) => {
      prev.forEach((p) => {
        if (p.localPreviewUrl) URL.revokeObjectURL(p.localPreviewUrl);
      });
      return [];
    });
  }, []);

  return {
    pendingAttachments,
    setPendingAttachments,
    removePendingAttachment,
    handleChatFiles,
    clearPendingAttachments,
    maxPendingAttachments: MAX_PENDING_ATTACHMENTS,
  };
}
