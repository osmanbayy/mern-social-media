import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import VerifiedBadge from "../common/VerifiedBadge";

export default function ProfileBioStats({
  fullname,
  verified,
  username,
  bio,
  link,
  memberSinceDate,
  followingCount,
  followersCount,
  onFollowingClick,
  onFollowersClick,
}) {
  return (
    <div className="mt-5 space-y-3 border-t border-base-300/35 pt-5">
      <div>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <h2 className="truncate text-xl font-bold tracking-tight text-base-content sm:text-[1.35rem]">{fullname}</h2>
          <VerifiedBadge verified={verified} size="md" />
        </div>
        <p className="mt-0.5 text-[15px] text-base-content/55">@{username}</p>
      </div>

      {bio && <p className="text-[15px] leading-relaxed text-base-content/90">{bio}</p>}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-base-content/55">
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 font-medium text-accent hover:underline"
          >
            <FaLink className="h-3.5 w-3.5 shrink-0 opacity-80" />
            <span className="truncate">{link.replace(/^https?:\/\//, "")}</span>
          </a>
        )}
        <span className="inline-flex items-center gap-1.5">
          <IoCalendarOutline className="h-4 w-4 shrink-0 opacity-80" />
          {memberSinceDate}
        </span>
      </div>

      <div className="flex flex-wrap gap-5 pt-1 text-sm">
        <button
          type="button"
          className="rounded-lg px-1 py-0.5 transition hover:bg-base-200/60"
          onClick={onFollowingClick}
        >
          <span className="font-bold tabular-nums text-base-content">{followingCount}</span>
          <span className="text-base-content/55"> Takip</span>
        </button>
        <button
          type="button"
          className="rounded-lg px-1 py-0.5 transition hover:bg-base-200/60"
          onClick={onFollowersClick}
        >
          <span className="font-bold tabular-nums text-base-content">{followersCount}</span>
          <span className="text-base-content/55"> Takipçi</span>
        </button>
      </div>
    </div>
  );
}
