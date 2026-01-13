import { useState } from "react";
import { LuX, LuCopy, LuCheck } from "react-icons/lu";
import toast from "react-hot-toast";
import { getShareOptions } from "../../constants/shareOptions";

const ShareModal = ({ post, postOwner, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  const postUrl = `${window.location.origin}/post/${post._id}`;
  const shareText = postOwner 
    ? `${postOwner.fullname || postOwner.username} tarafından paylaşıldı: ${post.text?.substring(0, 100)}${post.text?.length > 100 ? '...' : ''}`
    : post.text?.substring(0, 100) || 'Bu gönderiyi paylaş';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success('Link kopyalandı!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Link kopyalanamadı');
    }
  };

  const shareOptions = getShareOptions(postUrl, shareText, copyToClipboard);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-base-100 rounded-2xl border border-base-300/50 shadow-2xl max-w-md w-full p-6 animate-dropdownFadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 btn btn-sm btn-circle btn-ghost hover:bg-base-200/50 transition-all duration-200"
        >
          <LuX className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="font-bold text-xl text-base-content mb-2">Paylaş</h3>
          <p className="text-sm text-base-content/70">Gönderiyi paylaş</p>
        </div>

        {/* Share Options Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => {
                  option.action();
                  onClose();
                }}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl ${option.color} ${option.hoverColor} text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-semibold">{option.name}</span>
              </button>
            );
          })}
        </div>

        {/* Copy Link Section */}
        <div className="border-t border-base-300/50 pt-4">
          <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-xl border border-base-300/30">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-base-content/60 mb-1">Gönderi Linki</p>
              <p className="text-sm font-mono text-base-content truncate">{postUrl}</p>
            </div>
            <button
              onClick={copyToClipboard}
              className={`btn btn-sm ${copied ? 'btn-success' : 'btn-primary'} transition-all duration-200`}
            >
              {copied ? (
                <>
                  <LuCheck className="w-4 h-4" />
                  <span>Kopyalandı</span>
                </>
              ) : (
                <>
                  <LuCopy className="w-4 h-4" />
                  <span>Kopyala</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
