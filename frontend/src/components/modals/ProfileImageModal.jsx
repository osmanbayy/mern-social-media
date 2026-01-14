import { MdEdit } from "react-icons/md";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";

const ProfileImageModal = ({ user, isMyProfile, profileImgRef, profileImage, isOpen = false, onClose }) => {
  const handleEditClick = async () => {
    profileImgRef.current?.click();
    onClose();
  };

  if (!user || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative bg-base-100 p-0 max-w-screen-sm w-full rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={profileImage || user?.profileImage || defaultProfilePicture}
          className="w-full object-contain rounded-lg"
          alt="Profile"
        />
        {isMyProfile && (
          <button
            type="button"
            onClick={handleEditClick}
            className="absolute top-3 right-3 flex items-center gap-1 bg-neutral/80 hover:bg-neutral p-3 rounded-full text-white transition-all duration-200 hover:scale-110"
          >
            <MdEdit className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileImageModal;
