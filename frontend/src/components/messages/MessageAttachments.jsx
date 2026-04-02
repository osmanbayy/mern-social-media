import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { LuFileText, LuMaximize2, LuDownload } from "react-icons/lu";
import MessageMediaLightbox from "./MessageMediaLightbox";
import { downloadMediaFile } from "../../utils/downloadMedia";

/**
 * @param {{ attachments: Array<{ url: string; mimeType?: string; originalName?: string; kind?: string }>; mine?: boolean }} props
 */
export default function MessageAttachments({ attachments, mine }) {
  const [lightbox, setLightbox] = useState(null);

  const openLightbox = useCallback((item) => {
    setLightbox({
      url: item.url,
      mimeType: item.mimeType,
      originalName: item.originalName,
      kind: item.kind,
    });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const handleDownload = useCallback(async (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    const t = toast.loading("İndiriliyor…");
    try {
      const blobOk = await downloadMediaFile(item.url, item.originalName);
      toast.dismiss(t);
      toast.success(
        blobOk
          ? "İndirildi"
          : "Dosya yeni sekmede açıldı; oradan kaydedebilirsiniz."
      );
    } catch (err) {
      toast.dismiss(t);
      toast.error(err?.message || "İndirilemedi");
    }
  }, []);

  if (!Array.isArray(attachments) || attachments.length === 0) return null;

  return (
    <>
      <MessageMediaLightbox media={lightbox} onClose={closeLightbox} />
      <div
        className={`mt-2 flex w-full min-w-0 max-w-full flex-col gap-2 ${
          mine ? "items-end" : "items-start"
        }`}
      >
        {attachments.map((a, i) => {
          const url = String(a?.url || "");
          const mime = String(a?.mimeType || "");
          const isVideo = mime.startsWith("video/");
          const isImageKind = a?.kind === "image" && !isVideo;
          const isImageMime = mime.startsWith("image/");
          const showAsImage = isImageKind || isImageMime;

          if (isVideo) {
            return (
              <div
                key={`${url}-${i}`}
                className="relative max-w-[min(100%,18rem)] overflow-hidden rounded-xl bg-black/80 ring-1 ring-base-300/40"
              >
                <video
                  src={url}
                  controls
                  className="max-h-64 w-full object-contain"
                  playsInline
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    openLightbox(a);
                  }}
                />
                <button
                  type="button"
                  className="absolute left-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70"
                  aria-label="İndir"
                  onClick={(e) => handleDownload(e, a)}
                >
                  <LuDownload className="h-4 w-4" strokeWidth={2.25} />
                </button>
                <button
                  type="button"
                  className="absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70"
                  aria-label="Tam ekran"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(a);
                  }}
                >
                  <LuMaximize2 className="h-4 w-4" strokeWidth={2.25} />
                </button>
              </div>
            );
          }

          if (showAsImage) {
            return (
              <div
                key={`${url}-${i}`}
                className="relative max-w-[min(100%,18rem)]"
              >
                <button
                  type="button"
                  className="block w-full overflow-hidden rounded-xl p-0 ring-1 ring-base-300/40 transition hover:ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => openLightbox(a)}
                >
                  <img
                    src={url}
                    alt=""
                    className="max-h-72 w-full object-cover"
                    loading="lazy"
                  />
                </button>
                <button
                  type="button"
                  className="absolute left-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-base-300/50 bg-base-100/90 text-base-content shadow-md backdrop-blur-sm transition hover:bg-primary hover:text-primary-content"
                  aria-label="İndir"
                  onClick={(e) => handleDownload(e, a)}
                >
                  <LuDownload className="h-4 w-4" strokeWidth={2.25} />
                </button>
              </div>
            );
          }

          const name = String(a?.originalName || "Dosya").slice(0, 80);
          return (
            <div
              key={`${url}-${i}`}
              className="flex max-w-[min(100%,18rem)] items-stretch overflow-hidden rounded-xl border border-base-300/60 bg-base-200/50"
            >
              <button
                type="button"
                className={`flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-sm font-medium text-base-content transition-colors hover:bg-base-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  mine ? "text-right" : "text-left"
                }`}
                onClick={() => openLightbox(a)}
              >
                <LuFileText className="h-5 w-5 shrink-0 opacity-70" />
                <span className="min-w-0 flex-1 truncate">{name}</span>
                <LuMaximize2
                  className="h-4 w-4 shrink-0 opacity-50"
                  aria-hidden
                />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm shrink-0 rounded-none border-l border-base-300/50 px-2.5 sm:px-3"
                aria-label="İndir"
                onClick={(e) => handleDownload(e, a)}
              >
                <LuDownload className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
