import { MdEdit } from "react-icons/md";
import { useState, useEffect } from "react";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";

const ProfileImageModal = ({ user, isMyProfile, profileImgRef, profileImage }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const modalId = user ? `profile_image_modal${user._id}` : null;

  useEffect(() => {
    if (!modalId) return;
    
    // Create a dummy element for showModal API compatibility
    let modalElement = document.getElementById(modalId);
    if (!modalElement) {
      modalElement = document.createElement('div');
      modalElement.id = modalId;
      modalElement.style.display = 'none';
      document.body.appendChild(modalElement);
    }

    // Override showModal
    modalElement.showModal = function() {
      setIsOpen(true);
    };

    // Override close
    modalElement.close = function() {
      setIsOpen(false);
    };

    // Listen for custom events
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    
    modalElement.addEventListener('open', handleOpen);
    modalElement.addEventListener('close', handleClose);

    return () => {
      modalElement.removeEventListener('open', handleOpen);
      modalElement.removeEventListener('close', handleClose);
    };
  }, [modalId]);

  const handleEditClick = async () => {
    profileImgRef.current?.click();
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    const modal = document.getElementById(modalId);
    if (modal && modal.close) modal.close();
  };

  if (!user || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
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
