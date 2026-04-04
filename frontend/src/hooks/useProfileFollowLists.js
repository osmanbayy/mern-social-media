import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { getFollowers, getFollowing, getUserProfile } from "../api/users";

export function useProfileFollowLists(username) {
  const { authUser } = useAuth();

  const userQuery = useQuery({
    queryKey: ["user", username],
    queryFn: () => getUserProfile(username),
    enabled: Boolean(username),
  });

  const followersQuery = useQuery({
    queryKey: ["followers", username],
    queryFn: () => getFollowers(username),
    enabled: Boolean(username),
  });

  const followingQuery = useQuery({
    queryKey: ["followings", username],
    queryFn: () => getFollowing(username),
    enabled: Boolean(username),
  });

  return {
    authUser,
    user: userQuery.data,
    followers: followersQuery.data,
    followings: followingQuery.data,
    isUserLoading: userQuery.isLoading,
    isUserRefetching: userQuery.isRefetching,
    isFollowersLoading: followersQuery.isLoading,
    isFollowingLoading: followingQuery.isLoading,
  };
}
