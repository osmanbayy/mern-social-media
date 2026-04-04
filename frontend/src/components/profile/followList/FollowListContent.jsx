import FollowListEmptyState from "./FollowListEmptyState";
import FollowListSkeleton from "./FollowListSkeleton";
import FollowListUserRow from "./FollowListUserRow";

export default function FollowListContent({
  activeTab,
  followers,
  followings,
  isFollowersLoading,
  isFollowingLoading,
  authUser,
  isSelf,
}) {
  const isFollowersTab = activeTab === "followers";
  const items = isFollowersTab ? followers : followings;
  const isLoading = isFollowersTab ? isFollowersLoading : isFollowingLoading;
  const emptyMessage = isFollowersTab ? "Henüz takipçi yok." : "Takip edilen hesap yok.";
  const showMutualLabel = isFollowersTab && isSelf;
  const showNotFollowingBackLabel = !isFollowersTab && isSelf;

  if (isLoading) {
    return <FollowListSkeleton />;
  }

  if (!items?.length) {
    return <FollowListEmptyState message={emptyMessage} />;
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0" role="list">
      {items.map((item) => (
        <li key={item._id}>
          <FollowListUserRow
            item={item}
            authUser={authUser}
            showMutualLabel={showMutualLabel}
            showNotFollowingBackLabel={showNotFollowingBackLabel}
          />
        </li>
      ))}
    </ul>
  );
}
