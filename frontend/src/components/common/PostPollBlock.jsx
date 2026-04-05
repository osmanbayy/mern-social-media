import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { votePoll } from "../../api/posts";
import { invalidatePostById, invalidatePostsFeed } from "../../utils/queryInvalidation";

/** @param {{ post: { _id: string, poll?: { question?: string, options?: { text: string, votes?: unknown[] }[] } }, authUserId?: string }} props */
export default function PostPollBlock({ post, authUserId }) {
  const queryClient = useQueryClient();
  const poll = post?.poll;
  const opts = poll?.options;
  if (!Array.isArray(opts) || opts.length < 2) return null;

  const total = opts.reduce((acc, o) => acc + (o.votes?.length || 0), 0);

  const { mutate, isPending } = useMutation({
    mutationFn: (optionIndex) => votePoll(post._id, optionIndex),
    onSuccess: (updated) => {
      invalidatePostsFeed(queryClient);
      if (updated?._id) invalidatePostById(queryClient, updated._id);
    },
    onError: (e) => toast.error(e.message || "Oy kullanılamadı."),
  });

  const userVoteIndex = authUserId
    ? opts.findIndex((o) => (o.votes || []).some((v) => {
        const id = typeof v === "object" && v?._id ? v._id : v;
        return id === authUserId;
      }))
    : -1;

  return (
    <div
      className="my-2 overflow-hidden rounded-xl border border-base-300/50 bg-base-200/30 dark:bg-base-300/25"
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label="Anket"
    >
      {poll.question && (
        <p className="border-b border-base-300/40 px-3 py-2 text-sm font-medium text-base-content">
          {poll.question}
        </p>
      )}
      <ul className="divide-y divide-base-300/40">
        {opts.map((o, i) => {
          const count = o.votes?.length || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isMine = userVoteIndex === i;
          return (
            <li key={i} className="relative">
              <button
                type="button"
                disabled={isPending || !authUserId}
                onClick={() => mutate(i)}
                className={`relative w-full overflow-hidden px-3 py-2.5 text-left text-sm transition-colors hover:bg-base-200/50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-base-300/40 ${
                  isMine ? "font-medium" : ""
                }`}
              >
                <span
                  className="absolute inset-y-0 left-0 bg-primary/15"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
                <span className="relative z-[1] flex items-center justify-between gap-2">
                  <span className="min-w-0 flex-1">{o.text}</span>
                  <span className="shrink-0 text-xs text-base-content/60">
                    {pct}% · {count}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-base-300/40 px-3 py-1.5 text-xs text-base-content/50">
        {total} oy
        {!authUserId && <span className="ml-1">· Oy vermek için giriş yapın</span>}
      </p>
    </div>
  );
}
