import { useState, useEffect, useRef } from "react";
import { LuBadgeCheck } from "react-icons/lu";
import { VERIFIED_PROFILE_TOOLTIP } from "../../constants/verifiedUser";
import { isUserVerified } from "../../utils/userVerification";

const SIZE_CLASS = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-[1.125rem] w-[1.125rem]",
};

/**
 * E-postası doğrulanmış kullanıcılar için rozet. Masaüstünde hover ile, mobilde dokunuşla tooltip.
 * @param {object | null} props.user — doğrudan kullanıcı nesnesi (tercih edilen)
 * @param {boolean} [props.verified] — açık boolean; `user` yoksa kullanılır
 */
const VerifiedBadge = ({ user, verified: verifiedProp, size = "md", className = "" }) => {
  const verified = verifiedProp !== undefined ? verifiedProp : isUserVerified(user);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", close, true);
    return () => document.removeEventListener("click", close, true);
  }, [open]);

  if (!verified) return null;

  const iconClass = SIZE_CLASS[size] ?? SIZE_CLASS.md;

  return (
    <span ref={wrapRef} className={`inline-flex shrink-0 items-center ${className}`}>
      <button
        type="button"
        className={`tooltip tooltip-bottom z-10 inline-flex shrink-0 items-center justify-center rounded-full p-0.5 text-sky-500 outline-none transition hover:bg-sky-500/10 focus-visible:ring-2 focus-visible:ring-sky-500/35 dark:text-sky-400 ${open ? "tooltip-open" : ""}`}
        data-tip={VERIFIED_PROFILE_TOOLTIP}
        aria-label={VERIFIED_PROFILE_TOOLTIP}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
            setOpen((v) => !v);
          }
        }}
      >
        <LuBadgeCheck className={iconClass} strokeWidth={2.5} aria-hidden />
      </button>
    </span>
  );
};

export default VerifiedBadge;
