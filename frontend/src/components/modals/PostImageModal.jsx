import { useState, useEffect } from "react";

const PostImageModal = ({ post }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const modalId = post && post._id ? `image_modal${post._id}` : null;

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

  const handleClose = () => {
    setIsOpen(false);
    const modal = document.getElementById(modalId);
    if (modal && modal.close) modal.close();
  };

  if (!post || !post._id || !isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="relative max-w-screen-sm w-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={post.img} 
          className="w-full h-auto object-contain rounded-lg" 
          alt="Gönderi Resmi"
          style={{ maxHeight: '90vh' }}
          draggable="false"
        />
      </div>
    </div>
  );
};

export default PostImageModal;
