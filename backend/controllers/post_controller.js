import { sendServiceResult } from "../lib/controllerHttp.js";
import * as postCrud from "../services/post/post.crud.service.js";
import * as postFeed from "../services/post/post.feed.service.js";
import * as postSocial from "../services/post/post.social.service.js";
import * as postComments from "../services/post/post.comments.service.js";
import * as postRetweet from "../services/post/post.retweet.service.js";

export const create_post = async (req, res) => {
  try {
    const { text, img } = req.body;
    const result = await postCrud.createPost({
      userId: req.user._id.toString(),
      text,
      img,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in create post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const delete_post = async (req, res) => {
  try {
    const result = await postCrud.deletePost({
      userId: req.user._id,
      postId: req.params.id,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in delete post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const edit_post = async (req, res) => {
  try {
    const { text, img } = req.body;
    const result = await postCrud.editPost({
      userId: req.user._id.toString(),
      postId: req.params.id,
      text,
      img,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in edit post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const comment_on_post = async (req, res) => {
  try {
    const result = await postComments.commentOnPost({
      userId: req.user._id,
      postId: req.params.id,
      text: req.body.text,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in comment controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const like_unlike_post = async (req, res) => {
  try {
    const result = await postSocial.likeUnlikePost({
      userId: req.user._id,
      postId: req.params.id,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in like/unlike controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_all_posts = async (req, res) => {
  try {
    const result = await postFeed.getAllPosts({
      userId: req.user._id,
      page: req.query.page,
      limit: req.query.limit,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in get all posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_liked_posts = async (req, res) => {
  try {
    const result = await postFeed.getLikedPosts({ profileUserId: req.params.id });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in get liked posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_following_posts = async (req, res) => {
  try {
    const result = await postFeed.getFollowingPosts({ userId: req.user._id });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in get following posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_single_post = async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Content-Type": "application/json",
    });
    const result = await postFeed.getSinglePost({ postId: req.params.id });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in get single post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_user_posts = async (req, res) => {
  try {
    const result = await postFeed.getUserPostsByUsername({ username: req.params.username });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in get user posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const search_posts = async (req, res) => {
  try {
    const result = await postFeed.searchPosts({
      userId: req.user._id,
      query: req.query.query,
      page: req.query.page,
      limit: req.query.limit,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in search posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const save_unsave_post = async (req, res) => {
  try {
    const result = await postSocial.saveUnsavePost({
      userId: req.user._id,
      postId: req.params.id,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in save/unsave controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_saved_posts = async (req, res) => {
  try {
    const result = await postSocial.getSavedPosts({ profileUserId: req.params.id });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in get saved posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const hide_post = async (req, res) => {
  try {
    const result = await postSocial.hidePost({
      userId: req.user._id,
      postId: req.params.id,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in hide post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const unhide_post = async (req, res) => {
  try {
    const result = await postSocial.unhidePost({
      userId: req.user._id,
      postId: req.params.id,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in unhide post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_hidden_posts = async (req, res) => {
  try {
    const result = await postSocial.getHiddenPosts({ profileUserId: req.params.id });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in get hidden posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const pin_unpin_post = async (req, res) => {
  try {
    const result = await postSocial.pinUnpinPost({
      userId: req.user._id,
      postId: req.params.id,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in pin/unpin post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const like_unlike_comment = async (req, res) => {
  try {
    const result = await postComments.likeUnlikeComment({
      userId: req.user._id,
      postId: req.params.postId,
      commentId: req.params.commentId,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in like/unlike comment controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const reply_to_comment = async (req, res) => {
  try {
    const result = await postComments.replyToComment({
      userId: req.user._id,
      postId: req.params.postId,
      commentId: req.params.commentId,
      text: req.body.text,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in reply to comment controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const delete_comment = async (req, res) => {
  try {
    const result = await postComments.deleteComment({
      userId: req.user._id,
      postId: req.params.postId,
      commentId: req.params.commentId,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in delete comment controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const edit_comment = async (req, res) => {
  try {
    const result = await postComments.editComment({
      userId: req.user._id,
      postId: req.params.postId,
      commentId: req.params.commentId,
      text: req.body.text,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in edit comment controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const retweet_post = async (req, res) => {
  try {
    const result = await postRetweet.retweetPost({
      userId: req.user._id.toString(),
      postId: req.params.id,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in retweet post controller", error);
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

export const quote_retweet = async (req, res) => {
  try {
    const { text, img } = req.body;
    const result = await postRetweet.quoteRetweet({
      userId: req.user._id.toString(),
      postId: req.params.id,
      text,
      img,
    });
    return sendServiceResult(res, result);
  } catch (error) {
    console.log("Error in quote retweet controller", error);
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};
