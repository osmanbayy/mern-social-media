import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { LuX, LuExternalLink, LuFileText, LuDownload } from "react-icons/lu";
import { downloadMediaFile } from "../../utils/downloadMedia";

/**
 * Sohbet ekleri için tam ekran önizleme (Escape / arka plan tıklaması ile kapanır)
 * @param {{ media: { url: string; mimeType?: string; originalName?: string; kind?: string } | null; onClose: () => void }} props
 */
export default function MessageMediaLightbox({ media, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const downloadBusyRef = useRef(false);

  const handleDownload = useCallback(async () => {
    if (!media || downloadBusyRef.current) return;
    downloadBusyRef.current = true;
    setDownloading(true);
    const t = toast.loading("İndiriliyor…");
    try {
      const blobOk = await downloadMediaFile(media.url, media.originalName);
      toast.dismiss(t);
      toast.success(
        blobOk
          ? "İndirildi"
          : "Dosya yeni sekmede açıldı; oradan kaydedebilirsiniz."
      );
    } catch (e) {
      toast.dismiss(t);
      toast.error(e?.message || "İndirilemedi");
    } finally {
      downloadBusyRef.current = false;
      setDownloading(false);
    }
  }, [media]);

  useEffect(() => {
    if (!media) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [media, onClose]);

  if (!media) return null;

  const url = String(media.url || "");
  const mime = String(media.mimeType || "");
  const name = String(media.originalName || "Dosya").slice(0, 120);

  const isVideo = mime.startsWith("video/");
  const isImageKind = media.kind === "image" && !isVideo;
  const isImageMime = mime.startsWith("image/");
  const showAsImage = isImageKind || isImageMime;
  const isPdf =
    !isVideo &&
    !showAsImage &&
    (mime === "application/pdf" ||
      mime.includes("pdf") ||
      /\.pdf($|\?)/i.test(url));

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex flex-col bg-black/92 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Medya önizleme"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 sm:px-4">
        <p className="min-w-0 flex-1 truncate text-center text-sm font-medium text-white/95 sm:text-left">
          {name}
        </p>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          <button
            type="button"
            disabled={downloading}
            className="btn btn-ghost btn-sm gap-1.5 rounded-xl border border-white/15 text-white hover:bg-white/10 disabled:opacity-50"
            onClick={handleDownload}
          >
            {downloading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <LuDownload className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">İndir</span>
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm gap-1.5 rounded-xl border border-white/15 text-white hover:bg-white/10"
          >
            <LuExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Yeni sekmede aç</span>
          </a>
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm text-white hover:bg-white/15"
            aria-label="Kapat"
            onClick={onClose}
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className="flex min-h-0 flex-1 cursor-default items-center justify-center overflow-hidden p-2 sm:p-4"
        onClick={handleBackdropClick}
        role="presentation"
      >
        {showAsImage ? (
          <img
            src={url}
            alt=""
            className="max-h-[calc(100dvh-4.5rem)] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}

        {isVideo ? (
          <video
            src={url}
            controls
            playsInline
            className="max-h-[calc(100dvh-4.5rem)] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}

        {isPdf ? (
          <iframe
            title={name}
            src={url}
            className="h-[min(100dvh-5rem,calc(100dvh-4.5rem))] w-full max-w-6xl rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}

        {!showAsImage && !isVideo && !isPdf ? (
          <div
            className="flex max-w-md flex-col items-center gap-6 rounded-2xl border border-white/15 bg-base-100/95 px-8 py-10 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <LuFileText className="h-16 w-16 text-primary/80" />
            <p className="text-base font-semibold text-base-content">{name}</p>
            <p className="text-sm text-base-content/60">
              Bu dosya türü burada önizlenemiyor. Yeni sekmede açabilirsiniz.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={downloading}
                className="btn btn-outline btn-primary rounded-xl"
                onClick={handleDownload}
              >
                {downloading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <LuDownload className="h-4 w-4" />
                )}
                İndir
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary rounded-xl"
              >
                <LuExternalLink className="h-4 w-4" />
                Dosyayı aç
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
