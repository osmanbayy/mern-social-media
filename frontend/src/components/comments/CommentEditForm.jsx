import { commentEditTextareaClass } from "./commentItemClasses";

export default function CommentEditForm({
  editingComment,
  onEditChange,
  onSubmit,
  onCancel,
  isSaving,
  canSave,
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <textarea
        className={commentEditTextareaClass}
        value={editingComment?.text || ""}
        onChange={(e) => onEditChange(e.target.value)}
        rows={3}
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
          İptal
        </button>
        <button
          type="submit"
          disabled={!canSave || isSaving}
          className="btn btn-primary btn-sm"
        >
          {isSaving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
