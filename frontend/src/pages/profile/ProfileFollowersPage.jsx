import { useNavigate, useParams } from "react-router-dom";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import FollowListContent from "../../components/profile/followList/FollowListContent";
import FollowListNotFoundState from "../../components/profile/followList/FollowListNotFoundState";
import FollowListPageHeader from "../../components/profile/followList/FollowListPageHeader";
import FollowListTabs from "../../components/profile/followList/FollowListTabs";
import { useFollowListTab } from "../../hooks/useFollowListTab";
import { useProfileFollowLists } from "../../hooks/useProfileFollowLists";

const ProfileFollowersPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const { activeTab, setTab } = useFollowListTab(username);
  const {
    authUser,
    user,
    followers,
    followings,
    isUserLoading,
    isUserRefetching,
    isFollowersLoading,
    isFollowingLoading,
  } = useProfileFollowLists(username);

  const isSelf = authUser?._id === user?._id;
  const pageSubtitle =
    activeTab === "followers" ? "Takipçiler" : "Takip edilen hesaplar";

  if (isUserLoading || isUserRefetching) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-base-200/35 via-base-100 to-base-100 pb-20 dark:from-base-300/15 lg:pb-0">
        <ProfileHeaderSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full border-r border-base-300/40 bg-gradient-to-b from-base-200/35 via-base-100 to-base-100 pb-20 dark:from-base-300/15 lg:pb-0">
        <FollowListNotFoundState onGoHome={() => navigate("/")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full border-r border-base-300/40 bg-gradient-to-b from-base-200/35 via-base-100 to-base-100 pb-20 dark:from-base-300/15 lg:pb-0">
      <FollowListPageHeader
        displayName={user.fullname || user.username}
        subtitle={pageSubtitle}
        onBack={() => navigate(-1)}
      />

      <FollowListTabs activeTab={activeTab} onTabChange={setTab} />

      <main className="mx-auto max-w-2xl px-4 py-5 sm:px-5 sm:py-6">
        <FollowListContent
          activeTab={activeTab}
          followers={followers}
          followings={followings}
          isFollowersLoading={isFollowersLoading}
          isFollowingLoading={isFollowingLoading}
          authUser={authUser}
          isSelf={isSelf}
        />
      </main>
    </div>
  );
};

export default ProfileFollowersPage;
