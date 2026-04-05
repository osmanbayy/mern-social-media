import { IoLocationOutline } from "react-icons/io5";

/**
 * @param {{ name: string, lat?: number, lon?: number, className?: string, onNavigate?: boolean }} props
 */
export default function PostLocationLine({ name, lat, lon, className = "", onNavigate = true }) {
  const href =
    lat != null && lon != null
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`
      : null;

  const inner = (
    <>
      <IoLocationOutline className="h-4 w-4 shrink-0 text-primary" aria-hidden />
      <span className="min-w-0 truncate">{name}</span>
    </>
  );

  if (onNavigate && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`mb-2 inline-flex max-w-full items-center gap-1.5 rounded-lg px-0 py-0.5 text-sm text-primary hover:underline ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={`mb-2 flex max-w-full items-center gap-1.5 text-sm text-primary/90 ${className}`}>
      {inner}
    </div>
  );
}
