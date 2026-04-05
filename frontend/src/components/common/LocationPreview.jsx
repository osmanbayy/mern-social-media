import { IoCloseSharp } from "react-icons/io5";

/**
 * @param {{ place: { name: string } | null | undefined, onRemove: () => void, className?: string }} props
 */
export default function LocationPreview({ place, onRemove, className = "" }) {
  if (!place?.name) return null;

  return (
    <div
      className={`mt-2 flex items-center gap-2 rounded-lg border border-base-300/35 bg-base-200/25 py-1.5 pl-2.5 pr-1 dark:bg-base-300/20 ${className}`.trim()}
    >
      <p className="min-w-0 flex-1 truncate text-xs text-base-content/90 sm:text-sm">{place.name}</p>
      <button
        type="button"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-base-content/55 transition hover:bg-base-300/50 hover:text-base-content"
        onClick={onRemove}
        aria-label="Konumu kaldır"
      >
        <IoCloseSharp className="h-4 w-4" />
      </button>
    </div>
  );
}
