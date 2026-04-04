export const EDIT_PROFILE_BIO_MAX = 160;

const EMPTY_PASSWORD_FIELDS = {
  newPassword: "",
  confirmNewPassword: "",
  currentPassword: "",
};

export function createEditProfileFormFromUser(authUser) {
  if (!authUser) {
    return {
      fullname: "",
      username: "",
      email: "",
      bio: "",
      link: "",
      ...EMPTY_PASSWORD_FIELDS,
    };
  }

  return {
    fullname: authUser.fullname || "",
    username: authUser.username || "",
    email: authUser.email || "",
    bio: authUser.bio || "",
    link: authUser.link || "",
    ...EMPTY_PASSWORD_FIELDS,
  };
}
