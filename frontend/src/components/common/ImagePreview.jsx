import { IoCloseSharp } from "react-icons/io5";

const ImagePreview = ({ imageUrl, onRemove }) => {
  if (!imageUrl) return null;

  return (
    <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-base-300/50 group">
      <button
        type="button"
        className="absolute top-2 right-2 z-10 text-white bg-black/70 hover:bg-black/90 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110"
        onClick={onRemove}
      >
        <IoCloseSharp className="w-5 h-5" />
      </button>
      <img
        src={imageUrl}
        className="w-full h-auto max-h-96 object-cover"
        alt="Preview"
      />
    </div>
  );
};

export default ImagePreview;
