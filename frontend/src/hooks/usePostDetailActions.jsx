import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  deletePost as deletePostAPI,
  likePost as likePostAPI,
  savePost as savePostAPI,
  commentPost as commentPostAPI,
  pinPost as pinPostAPI,
} from "../api/posts";

/**
 * Hook for post detail page actions (like, save, delete, comment) with optimistic updates
 */
const usePostDetailActions = (postId) => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  // Helper function to update single post and posts list
  const updatePostCache = (updater) => {
    // Update single post
    queryClient.setQueryData(["post", postId], updater);

    // Update posts list
    queryClient.setQueryData(["posts"], (oldData) => {
      if (!oldData || !Array.isArray(oldData)) return oldData;
      return oldData.map((oldPost) => {
        if (oldPost._id === postId) {
          return updater(oldPost);
        }
        return oldPost;
      });
    });
  };

  // Like post mutation with optimistic update
  const { mutate: likePost } = useMutation({
    mutationFn: () => likePostAPI(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPost = queryClient.getQueryData(["post", postId]);
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically update
      updatePostCache((oldPost) => {
        if (!oldPost) return oldPost;
        const isCurrentlyLiked = oldPost.likes.includes(authUser?._id);
        const newLikes = isCurrentlyLiked
          ? oldPost.likes.filter((id) => id.toString() !== authUser?._id.toString())
          : [...oldPost.likes, authUser?._id];
        return { ...oldPost, likes: newLikes };
      });

      return { previousPost, previousPosts };
    },
    onError: (error, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast.error(error.message);
    },
    onSuccess: (updatedLikes) => {
      updatePostCache((oldPost) => {
        if (!oldPost) return oldPost;
        return { ...oldPost, likes: updatedLikes };
      });
    },
  });

  // Save post mutation with optimistic update
  const { mutate: savePost } = useMutation({
    mutationFn: () => savePostAPI(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPost = queryClient.getQueryData(["post", postId]);
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically update
      updatePostCache((oldPost) => {
        if (!oldPost) return oldPost;
        const isCurrentlySaved = oldPost.saves.includes(authUser?._id);
        const newSaves = isCurrentlySaved
          ? oldPost.saves.filter((id) => id.toString() !== authUser?._id.toString())
          : [...oldPost.saves, authUser?._id];
        return { ...oldPost, saves: newSaves };
      });

      return { previousPost, previousPosts };
    },
    onError: (error, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast.error(error.message);
    },
    onSuccess: (updatedSaves) => {
      updatePostCache((oldPost) => {
        if (!oldPost) return oldPost;
        return { ...oldPost, saves: updatedSaves };
      });
    },
  });

  // Delete post mutation
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePostAPI(postId),
    onSuccess: () => {
      toast.success("Gönderi silindi.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Comment on post mutation
  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: (commentText) => commentPostAPI(postId, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message || "Yorum yapılırken bir hata oluştu.");
    },
  });

  // Pin/Unpin post mutation
  const { mutate: pinPost, isPending: isPinning } = useMutation({
    mutationFn: () => pinPostAPI(postId),
    onSuccess: (data) => {
      const message = data.post?.isPinned 
        ? "Gönderi başa sabitlendi." 
        : "Gönderi sabitlemeden kaldırıldı.";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    likePost,
    savePost,
    deletePost,
    commentPost,
    pinPost,
    isDeleting,
    isCommenting,
    isPinning,
  };
};

export default usePostDetailActions;
