/** Tekrarlayan Post populate seçenekleri */
export const populateUser = { path: "user", select: "-password" };
export const populateCommentsUser = { path: "comments.user", select: "-password" };
export const populateCommentsRepliesUser = {
  path: "comments.replies.user",
  select: "-password",
};
export const populateOriginalPost = {
  path: "originalPost",
  populate: { path: "user", select: "-password" },
};
export const populateRetweetedBy = { path: "retweetedBy", select: "-password" };

export const standardPostPopulate = [
  populateUser,
  populateOriginalPost,
  populateRetweetedBy,
  populateCommentsUser,
];

export const singlePostPopulate = [
  populateUser,
  populateOriginalPost,
  populateRetweetedBy,
  populateCommentsUser,
  populateCommentsRepliesUser,
];
