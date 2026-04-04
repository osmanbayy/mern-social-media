export default function ChatMessageReactions({ reactions, mine }) {
  if (!Array.isArray(reactions) || reactions.length === 0) return null;
  const map = new Map();
  for (const r of reactions) {
    const e = r.emoji;
    map.set(e, (map.get(e) || 0) + 1);
  }
  return (
    <div
      className={`mt-1 flex max-w-full flex-wrap items-center gap-1 px-0.5 ${
        mine ? "justify-end" : "justify-start"
      }`}
    >
      {[...map.entries()].map(([emoji, count]) => (
        <span
          key={emoji}
          className="inline-flex items-baseline gap-0.5 text-lg leading-none"
          title={count > 1 ? `${count} tepki` : undefined}
        >
          <span aria-hidden>{emoji}</span>
          {count > 1 ? (
            <span className="text-[10px] font-medium tabular-nums text-base-content/50">
              {count}
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
