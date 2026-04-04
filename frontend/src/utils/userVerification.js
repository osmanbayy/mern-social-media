/** Kullanıcı nesnesinde e-posta / hesap doğrulaması (API: `isAccountVerified`) */
export function isUserVerified(user) {
  return Boolean(user?.isAccountVerified);
}
