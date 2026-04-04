import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { invalidatePostsFeed } from "../../utils/queryInvalidation";
import OSSvg from "../svgs/OS";

export default function DesktopSidebarLogo() {
  const queryClient = useQueryClient();

  return (
    <Link
      to="/"
      className="group mb-5 flex items-center gap-2 rounded-2xl px-2 py-1.5 transition hover:bg-base-200/50"
      onClick={() => invalidatePostsFeed(queryClient)}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-base-200/50 ring-1 ring-base-300/60 transition group-hover:ring-accent/35">
        <OSSvg className="h-8 w-8" />
      </div>
      <span className="desktop-sidebar-label hidden text-2xl font-bold tracking-wider text-base-content lg:inline">
        OnSekiz
      </span>
    </Link>
  );
}
