import { LuX } from "react-icons/lu";

const PostImageViewer = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative max-w-screen-sm w-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 btn btn-sm btn-circle btn-ghost bg-black/50 text-white hover:bg-black/70"
        >
          <LuX className="w-4 h-4" />
        </button>
        <img 
          src={imageUrl} 
          className="w-full h-auto object-contain rounded-lg" 
          alt="Gönderi Resmi"
          style={{ maxHeight: '90vh' }}
          draggable="false"
        />
      </div>
    </div>
  );
};

export default PostImageViewer;
