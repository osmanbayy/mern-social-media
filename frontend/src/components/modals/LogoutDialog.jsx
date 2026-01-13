import { LuLogOut, LuX } from "react-icons/lu";
import { useState, useEffect } from "react";

const LogoutDialog = ({ handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const modalId = "logout_modal";
    
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
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    const modal = document.getElementById("logout_modal");
    if (modal && modal.close) modal.close();
  };

  const handleConfirm = () => {
    handleLogout();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative bg-base-100/95 backdrop-blur-xl border border-base-300/50 shadow-2xl max-w-md w-full p-0 overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10 hover:bg-base-200/50 transition-all duration-200"
          onClick={handleClose}
        >
          <LuX className="w-4 h-4" />
        </button>
        
        {/* Header with icon */}
        <div className="flex flex-col items-center pt-8 pb-6 px-6 bg-gradient-to-br from-error/10 via-error/5 to-transparent border-b border-base-300/30">
          <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-4 ring-4 ring-error/10">
            <LuLogOut className="w-8 h-8 text-error" />
          </div>
          <h3 className="font-bold text-xl text-base-content mb-2">Çıkış Yap</h3>
          <p className="text-sm text-base-content/70 text-center">
            Hesabından çıkış yapmak istediğinden emin misin?
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-base text-base-content/80 text-center mb-6">
            Çıkış yaptıktan sonra tekrar giriş yapman gerekecek.
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost flex-1 hover:bg-base-200/50 transition-all duration-200 font-medium"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="btn btn-error flex-1 text-white hover:bg-error/90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <LuLogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutDialog;
