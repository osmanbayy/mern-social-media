import { useCallback, useState } from "react";
import { scheduleDialogOpen } from "../utils/scheduleDialogOpen";

export function usePostDetailModals(post) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const editModalId = post?._id ? `edit_post_modal_${post._id}` : "";

  const openEditDialog = useCallback(() => {
    setShowEditDialog(true);
    if (editModalId) scheduleDialogOpen(editModalId);
  }, [editModalId]);

  const closeEditDialog = useCallback(() => {
    setShowEditDialog(false);
    const el = document.getElementById(editModalId);
    if (el?.close) el.close();
  }, [editModalId]);

  return {
    showEditDialog,
    showImageViewer,
    setShowImageViewer,
    showDeleteDialog,
    setShowDeleteDialog,
    openEditDialog,
    closeEditDialog,
  };
}
