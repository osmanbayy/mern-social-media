export const extractSuggestedUsers = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.users || [];
};

export const getHasMoreUsers = (data, limit) => {
  if (Array.isArray(data)) {
    return data.length > limit;
  }
  return data?.hasMore || false;
};

export const getDisplayedUsers = (users, limit) => {
  if (!users || users.length === 0) return [];
  return users.slice(0, limit);
};
