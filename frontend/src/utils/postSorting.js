export const sortPostsByPinned = (posts) => {
  return [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

export const extractPostsFromData = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.posts || [];
};

export const getHasMoreFromData = (data) => {
  if (Array.isArray(data)) return false;
  return data?.hasMore || false;
};
