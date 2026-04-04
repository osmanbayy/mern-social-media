import { IoArrowBack } from "react-icons/io5";

export default function PostDetailToolbar({ onBack }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-base-300/50 bg-base-100/95 px-5 py-4 shadow-sm backdrop-blur-xl">
      <button
        type="button"
        onClick={onBack}
        className="btn btn-circle btn-ghost btn-sm transition-all duration-200 hover:scale-110 hover:bg-base-200"
      >
        <IoArrowBack className="h-5 w-5" />
      </button>
      <h2 className="text-xl font-bold">Gönderi</h2>
    </div>
  );
}
