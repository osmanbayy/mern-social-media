import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery } from "@tanstack/react-query";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner";

const RightPanel = () => {
  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/user/suggested");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Bir şeyler yanlış gitti");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  const { follow, isPending } = useFollow();

  if (suggestedUsers?.length === 0) <div className="md:w-64 w-0"></div>;

  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="p-4 rounded-md sticky top-2">
        <p className="font-bold mb-5">Kimi takip etmeli?</p>
        <div className="flex flex-col gap-4">
          {/* item */}
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isLoading &&
            suggestedUsers?.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={user.profileImage || defaultProfilePicture}
                        className="w-8 rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm tracking-tight truncate w-36">
                      {user.fullname}
                    </span>
                    <span className="text-sm text-slate-500">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                  >
                    {isPending ? <LoadingSpinner size="sm" /> : "Takip et"}
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
