const ProfileHeaderSkeleton = () => {
  return (
    <div className="w-full bg-gradient-to-b from-base-200/30 via-base-100 to-base-100 pb-24 dark:from-base-300/12 lg:pb-0">
      <div className="sticky top-0 z-30 border-b border-base-300/60 bg-base-100/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5 sm:px-5">
          <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-5 w-40 max-w-[12rem] rounded-lg" />
            <div className="skeleton h-3 w-16 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-5">
        <div className="overflow-hidden rounded-2xl border border-base-300/40 bg-base-100/90 shadow-md ring-1 ring-black/[0.03]">
          <div className="skeleton h-40 w-full sm:h-44" />
          <div className="px-4 pb-5 pt-0 sm:px-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="-mt-12 sm:-mt-14">
                <div className="skeleton h-24 w-24 rounded-full border-4 border-base-100 sm:h-28 sm:w-28" />
              </div>
              <div className="skeleton h-9 w-32 self-end rounded-xl sm:mb-0.5" />
            </div>
            <div className="mt-5 space-y-3 border-t border-base-300/30 pt-5">
              <div className="skeleton h-7 w-48 rounded-lg" />
              <div className="skeleton h-4 w-28 rounded-lg" />
              <div className="skeleton h-4 w-full max-w-md rounded-lg" />
              <div className="flex gap-5 pt-2">
                <div className="skeleton h-4 w-16 rounded-lg" />
                <div className="skeleton h-4 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-base-200/45 p-1 ring-1 ring-base-300/30">
          <div className="flex gap-1">
            <div className="skeleton h-10 flex-1 rounded-lg" />
            <div className="skeleton h-10 flex-1 rounded-lg" />
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="skeleton h-28 w-full rounded-2xl" />
          <div className="skeleton h-28 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderSkeleton;
