import { FaArrowLeft } from "react-icons/fa6";

export default function EditProfileHeader({ onBack }) {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-base-300/50 bg-base-100/95 px-4 py-3 backdrop-blur-md">
      <button
        type="button"
        onClick={onBack}
        className="rounded-full p-2 transition-colors hover:bg-base-200"
      >
        <FaArrowLeft className="h-5 w-5" />
      </button>
      <div className="flex flex-col">
        <span className="text-lg font-bold leading-tight">Profili Düzenle</span>
        <span className="text-xs text-base-content/60">Bilgilerini güncelle</span>
      </div>
    </div>
  );
}
