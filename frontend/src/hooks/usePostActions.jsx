import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  deletePost as deletePostAPI,
  likePost as likePostAPI,
  savePost as savePostAPI,
  hidePost as hidePostAPI,
  unhidePost as unhidePostAPI,
} from "../api/posts";

/**
 * Hook for post actions (like, save, delete, hide, unhide) with optimistic updates
 */
const usePostActions = (postId, updatedPost) => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  // Helper function to update all posts queries (handles both array and paginated formats)
  const updateAllPostsQueries = (updater) => {
    const allPostsQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
    allPostsQueries.forEach(([queryKey, oldData]) => {
      if (!oldData) return;
      
      // Handle paginated format: { posts: [], hasMore: true, page: 1, limit: 10 }
      if (oldData && typeof oldData === 'object' && 'posts' in oldData && Array.isArray(oldData.posts)) {
        queryClient.setQueryData(queryKey, (currentData) => {
          const updatedPosts = updater(currentData.posts);
          return {
            ...currentData,
            posts: updatedPosts
          };
        });
      }
      // Handle array format: []
      else if (Array.isArray(oldData)) {
        queryClient.setQueryData(queryKey, updater);
      }
    });
  };

  // Helper function to create optimistic update for likes
  const createLikeOptimisticUpdate = (isCurrentlyLiked) => {
    return (currentData) => {
      if (!currentData || !Array.isArray(currentData) || !authUser?._id) return currentData;
      return currentData.map((oldPost) => {
        if (oldPost._id === postId) {
          const newLikes = isCurrentlyLiked
            ? oldPost.likes.filter((id) => id.toString() !== authUser._id.toString())
            : [...oldPost.likes, authUser._id];
          return { ...oldPost, likes: newLikes };
        }
        return oldPost;
      });
    };
  };

  // Helper function to create optimistic update for saves
  const createSaveOptimisticUpdate = (isCurrentlySaved) => {
    return (currentData) => {
      if (!currentData || !Array.isArray(currentData) || !authUser?._id) return currentData;
      return currentData.map((oldPost) => {
        if (oldPost._id === postId) {
          const newSaves = isCurrentlySaved
            ? oldPost.saves.filter((id) => id.toString() !== authUser._id.toString())
            : [...oldPost.saves, authUser._id];
          return { ...oldPost, saves: newSaves };
        }
        return oldPost;
      });
    };
  };

  // Like post mutation with optimistic update
  const { mutate: likePost } = useMutation({
    mutationFn: () => likePostAPI(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const allPostsQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
      const previousQueries = new Map(allPostsQueries);

      const isCurrentlyLiked = updatedPost?.likes?.includes(authUser?._id);
      updateAllPostsQueries(createLikeOptimisticUpdate(isCurrentlyLiked));

      return { previousQueries };
    },
    onError: (error, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((oldData, queryKey) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      toast.error(error.message);
    },
    onSuccess: (updatedLikes) => {
      updateAllPostsQueries((currentData) => {
        if (!currentData || !Array.isArray(currentData)) return currentData;
        return currentData.map((oldPost) => {
          if (oldPost._id === postId) {
            return { ...oldPost, likes: updatedLikes };
          }
          return oldPost;
        });
      });
    },
  });

  // Save post mutation with optimistic update
  const { mutate: savePost } = useMutation({
    mutationFn: () => savePostAPI(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const allPostsQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
      const previousQueries = new Map(allPostsQueries);

      const isCurrentlySaved = updatedPost?.saves?.includes(authUser?._id);
      updateAllPostsQueries(createSaveOptimisticUpdate(isCurrentlySaved));

      return { previousQueries };
    },
    onError: (error, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((oldData, queryKey) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      toast.error(error.message);
    },
    onSuccess: (updatedSaves) => {
      updateAllPostsQueries((currentData) => {
        if (!currentData || !Array.isArray(currentData)) return currentData;
        return currentData.map((oldPost) => {
          if (oldPost._id === postId) {
            return { ...oldPost, saves: updatedSaves };
          }
          return oldPost;
        });
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

  // Hide post mutation
  const { mutate: hidePost, isPending: isHiding } = useMutation({
    mutationFn: () => hidePostAPI(postId),
    onSuccess: () => {
      toast.success("Gönderi gizlendi.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Unhide post mutation
  const { mutate: unhidePost, isPending: isUnhiding } = useMutation({
    mutationFn: () => unhidePostAPI(postId),
    onSuccess: () => {
      toast.success("Gönderi görünür hale getirildi.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    likePost,
    savePost,
    deletePost,
    hidePost,
    unhidePost,
    isDeleting,
    isHiding,
    isUnhiding,
  };
};

export default usePostActions;
