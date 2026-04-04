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

/** React Query cache shape (array veya { users, hasMore }) için kullanıcıyı listeden çıkarır */
export const removeUserFromSuggestedCacheData = (oldData, userId) => {
  if (!oldData) return oldData;

  if (Array.isArray(oldData)) {
    return oldData.filter((user) => user._id !== userId);
  }

  if (oldData.users) {
    return {
      ...oldData,
      users: oldData.users.filter((user) => user._id !== userId),
      hasMore: oldData.hasMore || false,
    };
  }

  return oldData;
};
