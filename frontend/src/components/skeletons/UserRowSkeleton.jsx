const UserRowSkeleton = () => {
  return (
    <div className="flex w-full items-center justify-between px-4 py-3 animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full bg-base-300"></div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 w-24 bg-base-300 rounded"></div>
          <div className="h-3 w-20 bg-base-300 rounded"></div>
        </div>
      </div>
      <div className="h-7 w-24 bg-base-300 rounded-full"></div>
    </div>
  );
};

export default UserRowSkeleton;
