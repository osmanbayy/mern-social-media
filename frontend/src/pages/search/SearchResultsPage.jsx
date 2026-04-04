import Post from "../../components/common/Post";
import SearchNoQueryPrompt from "../../components/search/SearchNoQueryPrompt";
import SearchResultSection from "../../components/search/SearchResultSection";
import SearchResultsLayout from "../../components/search/SearchResultsLayout";
import SearchUserResultRow from "../../components/search/SearchUserResultRow";
import { useSearchInfiniteResults } from "../../hooks/useSearchInfiniteResults";
import { useSearchQueryInput } from "../../hooks/useSearchQueryInput";
import { LuFileText, LuUser } from "react-icons/lu";

const SearchResultsPage = () => {
  const { trimmedQuery, hasSearchQuery, input, setInput, submitSearch } = useSearchQueryInput();

  const {
    users,
    posts,
    fetchNextUsers,
    fetchNextPosts,
    hasMoreUsers,
    hasMorePosts,
    isPendingUsers,
    isPendingPosts,
    isFetchingNextUsers,
    isFetchingNextPosts,
  } = useSearchInfiniteResults(trimmedQuery);

  const showUserEmpty = hasSearchQuery && !isPendingUsers && users.length === 0;
  const showPostEmpty = hasSearchQuery && !isPendingPosts && posts.length === 0;

  return (
    <SearchResultsLayout
      searchInput={input}
      onSearchInputChange={setInput}
      onSubmit={submitSearch}
    >
      {!hasSearchQuery ? (
        <SearchNoQueryPrompt />
      ) : (
        <>
          <SearchResultSection
            title="Kullanıcılar"
            icon={LuUser}
            isPendingFirst={isPendingUsers}
            showEmpty={showUserEmpty}
            emptyMessage="Kullanıcı bulunamadı"
            hasMore={hasMoreUsers}
            onLoadMore={() => fetchNextUsers()}
            isFetchingMore={isFetchingNextUsers}
            loadMoreLabel="Daha fazla kullanıcı göster"
          >
            <div className="space-y-3">
              {users.map((user) => (
                <SearchUserResultRow key={user._id} user={user} />
              ))}
            </div>
          </SearchResultSection>

          <SearchResultSection
            title="Gönderiler"
            icon={LuFileText}
            isPendingFirst={isPendingPosts}
            showEmpty={showPostEmpty}
            emptyMessage="Gönderi bulunamadı"
            hasMore={hasMorePosts}
            onLoadMore={() => fetchNextPosts()}
            isFetchingMore={isFetchingNextPosts}
            loadMoreLabel="Daha fazla gönderi göster"
          >
            <div className="space-y-4">
              {posts.map((post) => (
                <Post key={post._id} post={post} />
              ))}
            </div>
          </SearchResultSection>
        </>
      )}
    </SearchResultsLayout>
  );
};

export default SearchResultsPage;
