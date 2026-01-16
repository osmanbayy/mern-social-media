import { useState, useEffect } from "react";
import { LuDownload, LuX } from "react-icons/lu";
import toast from "react-hot-toast";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    // Check if user has dismissed the prompt before
    const hasSeenPrompt = localStorage.getItem("pwa-install-dismissed");
    if (hasSeenPrompt) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      toast.success("Uygulama yükleniyor...");
    } else {
      toast.error("Yükleme iptal edildi");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 animate-in slide-in-from-top-5 duration-300">
      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-2xl p-4 flex items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-base-content mb-1">
            Uygulamayı İndir
          </h3>
          <p className="text-sm text-base-content/70">
            OnSekiz'i cihazına yükle ve daha hızlı erişim sağla
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="btn btn-primary btn-sm rounded-full"
          >
            <LuDownload className="w-4 h-4" />
            Yükle
          </button>
          <button
            onClick={handleDismiss}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
