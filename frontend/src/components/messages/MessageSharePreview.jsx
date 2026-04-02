import { useNavigate } from "react-router-dom";
import { LuArrowUpRight, LuUserRound } from "react-icons/lu";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";

/**
 * DM / mesaj isteğinde gönderi veya profil önizlemesi.
 */
const MessageSharePreview = ({ share, mine, className = "" }) => {
  const navigate = useNavigate();

  if (!share?.kind) return null;

  const shellMine =
    "w-full text-left shadow-lg ring-1 transition duration-200 hover:brightness-[1.03] active:scale-[0.99] " +
    "rounded-2xl overflow-hidden " +
    "border border-primary-content/20 bg-primary-content/[0.11] ring-primary-content/15";

  const shellTheirs =
    "w-full text-left shadow-lg ring-1 transition duration-200 hover:bg-base-200/40 active:scale-[0.99] " +
    "rounded-2xl overflow-hidden " +
    "border border-base-300/55 bg-base-100 ring-black/[0.04] dark:ring-white/[0.06]";

  const shell = mine ? shellMine : shellTheirs;

  const footMine =
    "flex items-center gap-2 border-t border-primary-content/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-primary-content/65";
  const footTheirs =
    "flex items-center gap-2 border-t border-base-300/50 bg-base-200/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/45";

  if (share.kind === "post") {
    const p = share.post;
    if (!p?._id) {
      return (
        <div
          className={`${shell} px-3 py-3 text-sm ${mine ? "text-primary-content/75" : "text-base-content/65"} ${className}`}
        >
          Bu gönderi kullanılamıyor.
        </div>
      );
    }
    const author = typeof p.user === "object" ? p.user : null;
    const snippet = (p.text || "").trim();
    const displayName = author?.fullname || author?.username || "Gönderi";
    const handle = author?.username ? `@${author.username}` : null;
    const hasImage = Boolean(p.img);

    return (
      <button
        type="button"
        className={`${shell} ${className}`}
        onClick={() => navigate(`/post/${p._id}`)}
      >
        {hasImage ? (
          <div className="relative max-h-52 w-full overflow-hidden bg-base-300/25">
            <img
              src={p.img}
              alt=""
              className="max-h-52 w-full object-cover object-center"
            />
            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${
                mine ? "from-primary/90 to-transparent" : "from-base-100/95 to-transparent"
              }`}
            />
          </div>
        ) : null}

        <div className={`${hasImage ? "px-3 pb-1 pt-3" : "px-3.5 pb-1 pt-3.5"}`}>
          <div className="flex gap-3">
            <div className="avatar shrink-0">
              <div
                className={`h-10 w-10 rounded-full ring-2 ${
                  mine ? "ring-primary-content/25" : "ring-base-300/70"
                }`}
              >
                <img
                  src={author?.profileImage || defaultProfilePicture}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-[15px] font-semibold leading-tight ${
                  mine ? "text-primary-content" : "text-base-content"
                }`}
              >
                {displayName}
              </p>
              {handle ? (
                <p
                  className={`mt-0.5 truncate text-[13px] ${
                    mine ? "text-primary-content/65" : "text-base-content/50"
                  }`}
                >
                  {handle}
                </p>
              ) : null}
            </div>
          </div>

          {(snippet || !hasImage) && (
            <p
              className={`mt-3 line-clamp-5 text-left text-[14px] leading-relaxed ${
                mine ? "text-primary-content/88" : "text-base-content/80"
              }`}
            >
              {snippet || (hasImage ? "" : "Gönderi")}
            </p>
          )}
        </div>

        <div className={mine ? footMine : footTheirs}>
          <LuArrowUpRight className="size-3.5 shrink-0 opacity-80" aria-hidden />
          <span>Gönderiyi aç</span>
        </div>
      </button>
    );
  }

  if (share.kind === "profile") {
    const u = share.profileUser;
    if (!u?._id || !u.username) {
      return (
        <div
          className={`${shell} px-3 py-3 text-sm ${mine ? "text-primary-content/75" : "text-base-content/65"} ${className}`}
        >
          Bu profil kullanılamıyor.
        </div>
      );
    }
    const bio = (u.bio || "").trim();
    return (
      <button
        type="button"
        className={`${shell} ${className}`}
        onClick={() => navigate(`/profile/${u.username}`)}
      >
        <div className="flex gap-4 px-4 py-4">
          <div className="avatar shrink-0">
            <div
              className={`h-16 w-16 rounded-2xl ring-2 ${
                mine ? "ring-primary-content/25" : "ring-base-300/70"
              }`}
            >
              <img
                src={u.profileImage || defaultProfilePicture}
                alt=""
                className="h-full w-full rounded-2xl object-cover"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p
              className={`text-[16px] font-bold leading-tight tracking-tight ${
                mine ? "text-primary-content" : "text-base-content"
              }`}
            >
              {u.fullname || u.username}
            </p>
            <p
              className={`mt-1 text-[14px] font-medium ${
                mine ? "text-primary-content/65" : "text-base-content/55"
              }`}
            >
              @{u.username}
            </p>
            {bio ? (
              <p
                className={`mt-2 line-clamp-3 text-[13px] leading-snug ${
                  mine ? "text-primary-content/75" : "text-base-content/65"
                }`}
              >
                {bio}
              </p>
            ) : null}
          </div>
        </div>

        <div className={mine ? footMine : footTheirs}>
          <LuUserRound className="size-3.5 shrink-0 opacity-80" aria-hidden />
          <span>Profili görüntüle</span>
        </div>
      </button>
    );
  }

  return null;
};

export default MessageSharePreview;
