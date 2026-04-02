/** Socket bağlı kullanıcı id’leri (tek süreç; çok sunucuda Redis gerekir) */
const onlineIds = new Set();

export const setUserOnline = (userId) => {
  if (userId != null) onlineIds.add(String(userId));
};

export const setUserOffline = (userId) => {
  if (userId != null) onlineIds.delete(String(userId));
};

export const isUserOnline = (userId) =>
  userId != null && onlineIds.has(String(userId));
