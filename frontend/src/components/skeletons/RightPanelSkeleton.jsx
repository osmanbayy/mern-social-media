const RightPanelSkeleton = () => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="skeleton h-11 w-11 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="skeleton h-3.5 w-24 max-w-full rounded-full" />
          <div className="skeleton h-3 w-16 max-w-full rounded-full" />
        </div>
      </div>
      <div className="skeleton h-8 w-[72px] shrink-0 rounded-full" />
    </div>
  );
};

export default RightPanelSkeleton;
