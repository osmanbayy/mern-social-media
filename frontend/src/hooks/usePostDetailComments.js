import { useCallback, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteComment, editComment, likeComment, replyToComment } from "../api/posts";
import useMention from "./useMention";

const MUTATION_ERROR = "Bir hata oluştu.";

export function usePostDetailComments(postId, { commentPost, isCommenting }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const commentTextareaRef = useRef(null);
  const replyTextareaRefs = useRef({});

  const mention = useMention(comment, setComment, commentTextareaRef);

  const setPostCache = useCallback(
    (data) => {
      queryClient.setQueryData(["post", postId], data);
    },
    [queryClient, postId]
  );

  const likeCommentMutation = useMutation({
    mutationFn: ({ commentId }) => likeComment(postId, commentId),
    onSuccess: setPostCache,
    onError: (error) => {
      toast.error(error.message || MUTATION_ERROR);
    },
  });

  const replyToCommentMutation = useMutation({
    mutationFn: ({ commentId, replyText }) => replyToComment(postId, commentId, replyText),
    onSuccess: (data, variables) => {
      setPostCache(data);
      setReplyingTo(null);
      setReplyTexts((prev) => ({ ...prev, [variables.commentId]: "" }));
      toast.success("Yanıt gönderildi.");
    },
    onError: (error) => {
      toast.error(error.message || MUTATION_ERROR);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ commentId }) => deleteComment(postId, commentId),
    onMutate: ({ commentId }) => {
      setDeletingCommentId(commentId);
    },
    onSuccess: (data) => {
      setPostCache(data);
      setDeletingCommentId(null);
      toast.success("Yorum silindi.");
    },
    onError: (error) => {
      toast.error(error.message || MUTATION_ERROR);
      setDeletingCommentId(null);
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, commentText }) => editComment(postId, commentId, commentText),
    onMutate: ({ commentId }) => {
      setEditingCommentId(commentId);
    },
    onSuccess: (data) => {
      setPostCache(data);
      setEditingCommentId(null);
      setEditingComment(null);
      toast.success("Yorum güncellendi.");
    },
    onError: (error) => {
      toast.error(error.message || MUTATION_ERROR);
      setEditingCommentId(null);
    },
  });

  const handlePostComment = useCallback(
    (e) => {
      e.preventDefault();
      if (isCommenting || !comment.trim()) return;
      commentPost(comment);
      setComment("");
    },
    [comment, commentPost, isCommenting]
  );

  const handleLikeComment = useCallback(
    (commentId, e) => {
      e.stopPropagation();
      likeCommentMutation.mutate({ commentId });
    },
    [likeCommentMutation]
  );

  const handleReplyToComment = useCallback((commentId, e) => {
    e.stopPropagation();
    setReplyingTo(commentId);
  }, []);

  const handleSubmitReply = useCallback(
    (commentId, e) => {
      e.preventDefault();
      e.stopPropagation();
      const replyText = replyTexts[commentId] || "";
      if (!replyText.trim()) return;
      replyToCommentMutation.mutate({ commentId, replyText });
    },
    [replyTexts, replyToCommentMutation]
  );

  const handleDeleteComment = useCallback(
    (commentId) => {
      deleteCommentMutation.mutate({ commentId });
    },
    [deleteCommentMutation]
  );

  const handleEditComment = useCallback((commentItem) => {
    setEditingComment({ ...commentItem, text: commentItem.text });
    setEditingCommentId(commentItem._id);
  }, []);

  const handleUpdateEditingComment = useCallback((updated) => {
    setEditingComment(updated);
  }, []);

  const handleSubmitEditComment = useCallback(
    (commentId, e) => {
      e.preventDefault();
      e.stopPropagation();
      const commentText = editingComment?.text || "";
      if (!commentText.trim()) return;
      editCommentMutation.mutate({ commentId, commentText });
    },
    [editCommentMutation, editingComment?.text]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingComment(null);
    setEditingCommentId(null);
  }, []);

  const handleCancelReply = useCallback((commentId) => {
    setReplyingTo(null);
    setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
  }, []);

  const setReplyTextForComment = useCallback((commentId, text) => {
    setReplyTexts((prev) => ({ ...prev, [commentId]: text }));
  }, []);

  const registerReplyTextareaRef = useCallback((commentId, el) => {
    if (el) replyTextareaRefs.current[commentId] = el;
  }, []);

  return {
    ...mention,
    comment,
    commentTextareaRef,
    handlePostComment,
    replyingTo,
    editingComment,
    replyTexts,
    deletingCommentId,
    editingCommentId,
    editCommentMutation,
    replyToCommentMutation,
    handleLikeComment,
    handleReplyToComment,
    handleSubmitReply,
    handleDeleteComment,
    handleEditComment,
    handleUpdateEditingComment,
    handleSubmitEditComment,
    handleCancelEdit,
    handleCancelReply,
    setReplyTextForComment,
    registerReplyTextareaRef,
  };
}
