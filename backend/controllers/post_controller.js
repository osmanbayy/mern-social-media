import { asyncHandler } from "../lib/asyncHandler.js";
import { sendServiceResult } from "../lib/controllerHttp.js";
import * as postCrud from "../services/post/post.crud.service.js";
import * as postFeed from "../services/post/post.feed.service.js";
import * as postSocial from "../services/post/post.social.service.js";
import * as postComments from "../services/post/post.comments.service.js";
import * as postRetweet from "../services/post/post.retweet.service.js";
import * as postPoll from "../services/post/post.poll.service.js";

export const create_post = asyncHandler("post.create_post", async (req, res) => {
  const { text, img, poll, location } = req.body;
  const result = await postCrud.createPost({
    userId: req.user._id.toString(),
    text,
    img,
    poll,
    location,
  });
  return sendServiceResult(res, result);
});

export const delete_post = asyncHandler("post.delete_post", async (req, res) => {
  const result = await postCrud.deletePost({
    userId: req.user._id,
    postId: req.params.id,
  });
  return sendServiceResult(res, result);
});

export const edit_post = asyncHandler("post.edit_post", async (req, res) => {
  const { text, img, location } = req.body;
  const result = await postCrud.editPost({
    userId: req.user._id.toString(),
    postId: req.params.id,
    text,
    img,
    location,
    hasLocationField: Object.prototype.hasOwnProperty.call(req.body, "location"),
  });
  return sendServiceResult(res, result);
});

export const vote_poll = asyncHandler("post.vote_poll", async (req, res) => {
  const { optionIndex } = req.body;
  const result = await postPoll.votePoll({
    userId: req.user._id,
    postId: req.params.id,
    optionIndex,
  });
  return sendServiceResult(res, result);
});

export const comment_on_post = asyncHandler("post.comment_on_post", async (req, res) => {
  const result = await postComments.commentOnPost({
    userId: req.user._id,
    postId: req.params.id,
    text: req.body.text,
  });
  return sendServiceResult(res, result);
});

export const like_unlike_post = asyncHandler("post.like_unlike_post", async (req, res) => {
  const result = await postSocial.likeUnlikePost({
    userId: req.user._id,
    postId: req.params.id,
  });
  return sendServiceResult(res, result);
});

export const get_all_posts = asyncHandler("post.get_all_posts", async (req, res) => {
  const result = await postFeed.getAllPosts({
    userId: req.user._id,
    page: req.query.page,
    limit: req.query.limit,
  });
  return sendServiceResult(res, result);
});

export const get_liked_posts = asyncHandler("post.get_liked_posts", async (req, res) => {
  const result = await postFeed.getLikedPosts({ profileUserId: req.params.id });
  return sendServiceResult(res, result);
});

export const get_following_posts = asyncHandler("post.get_following_posts", async (req, res) => {
  const result = await postFeed.getFollowingPosts({ userId: req.user._id });
  return sendServiceResult(res, result);
});

export const get_single_post = asyncHandler("post.get_single_post", async (req, res) => {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Content-Type": "application/json",
  });
  const result = await postFeed.getSinglePost({ postId: req.params.id });
  return sendServiceResult(res, result);
});

export const get_user_posts = asyncHandler("post.get_user_posts", async (req, res) => {
  const result = await postFeed.getUserPostsByUsername({ username: req.params.username });
  return sendServiceResult(res, result);
});

export const search_posts = asyncHandler("post.search_posts", async (req, res) => {
  const result = await postFeed.searchPosts({
    userId: req.user._id,
    query: req.query.query,
    page: req.query.page,
    limit: req.query.limit,
  });
  return sendServiceResult(res, result);
});

export const get_posts_by_hashtag = asyncHandler("post.get_posts_by_hashtag", async (req, res) => {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Content-Type": "application/json",
  });
  const tag = req.params.tag;
  const result = await postFeed.getPostsByHashtag({
    userId: req.user._id,
    tag,
    page: req.query.page,
    limit: req.query.limit,
  });
  return sendServiceResult(res, result);
});

export const save_unsave_post = asyncHandler("post.save_unsave_post", async (req, res) => {
  const result = await postSocial.saveUnsavePost({
    userId: req.user._id,
    postId: req.params.id,
  });
  return sendServiceResult(res, result);
});

export const get_saved_posts = asyncHandler("post.get_saved_posts", async (req, res) => {
  const result = await postSocial.getSavedPosts({ profileUserId: req.params.id });
  return sendServiceResult(res, result);
});

export const hide_post = asyncHandler("post.hide_post", async (req, res) => {
  const result = await postSocial.hidePost({
    userId: req.user._id,
    postId: req.params.id,
  });
  return sendServiceResult(res, result);
});

export const unhide_post = asyncHandler("post.unhide_post", async (req, res) => {
  const result = await postSocial.unhidePost({
    userId: req.user._id,
    postId: req.params.id,
  });
  return sendServiceResult(res, result);
});

export const get_hidden_posts = asyncHandler("post.get_hidden_posts", async (req, res) => {
  const result = await postSocial.getHiddenPosts({ profileUserId: req.params.id });
  return sendServiceResult(res, result);
});

export const pin_unpin_post = asyncHandler("post.pin_unpin_post", async (req, res) => {
  const result = await postSocial.pinUnpinPost({
    userId: req.user._id,
    postId: req.params.id,
  });
  return sendServiceResult(res, result);
});

export const like_unlike_comment = asyncHandler("post.like_unlike_comment", async (req, res) => {
  const result = await postComments.likeUnlikeComment({
    userId: req.user._id,
    postId: req.params.postId,
    commentId: req.params.commentId,
  });
  return sendServiceResult(res, result);
});

export const reply_to_comment = asyncHandler("post.reply_to_comment", async (req, res) => {
  const result = await postComments.replyToComment({
    userId: req.user._id,
    postId: req.params.postId,
    commentId: req.params.commentId,
    text: req.body.text,
  });
  return sendServiceResult(res, result);
});

export const delete_comment = asyncHandler("post.delete_comment", async (req, res) => {
  const result = await postComments.deleteComment({
    userId: req.user._id,
    postId: req.params.postId,
    commentId: req.params.commentId,
  });
  return sendServiceResult(res, result);
});

export const edit_comment = asyncHandler("post.edit_comment", async (req, res) => {
  const result = await postComments.editComment({
    userId: req.user._id,
    postId: req.params.postId,
    commentId: req.params.commentId,
    text: req.body.text,
  });
  return sendServiceResult(res, result);
});

const retweetErrorBody = (error, res) => {
  res.status(500).json({ message: "Sunucu hatası.", error: error.message });
};

export const retweet_post = asyncHandler(
  "post.retweet_post",
  async (req, res) => {
    const result = await postRetweet.retweetPost({
      userId: req.user._id.toString(),
      postId: req.params.id,
    });
    return sendServiceResult(res, result);
  },
  { onError: retweetErrorBody }
);

export const quote_retweet = asyncHandler(
  "post.quote_retweet",
  async (req, res) => {
    const { text, img, poll, location } = req.body;
    const result = await postRetweet.quoteRetweet({
      userId: req.user._id.toString(),
      postId: req.params.id,
      text,
      img,
      poll,
      location,
    });
    return sendServiceResult(res, result);
  },
  { onError: retweetErrorBody }
);
