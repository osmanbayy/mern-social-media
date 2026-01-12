import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { formatPostDate } from "../../utils/date";
import DeletePostDialog from "../modals/DeletePostDialog";
import EditPostDialog from "../modals/EditPostDialog";
import PostImageModal from "../modals/PostImageModal";
import PostOptions from "../PostOptions";
import PostActions from "./PostActions";
import { deletePost as deletePostAPI, likePost as likePostAPI, savePost as savePostAPI, hidePost as hidePostAPI, unhidePost as unhidePostAPI } from "../../api/posts";

const Post = ({ post, isHidden = false }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const navigate = useNavigate();
  const { data: authUser, isLoading } = useQuery({ queryKey: ["authUser"] });

  const queryClient = useQueryClient();

  // Get updated post from cache - check all posts queries
  // We need to force re-render when cache updates, so we'll use a state trigger
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // Subscribe to cache updates by checking queries on each render
  const postsQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
  
  // Get updated post from cache - check all posts queries
  const updatedPost = useMemo(() => {
    // Check all posts queries to find the updated post
    for (const [, postsData] of postsQueries) {
      if (postsData && Array.isArray(postsData)) {
        const cachedPost = postsData.find((p) => p._id === post._id);
        if (cachedPost) {
          return cachedPost;
        }
      }
    }
    return post;
  }, [post, postsQueries, updateTrigger]);
  
  // Force re-render when cache updates by listening to query cache changes
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === "posts") {
        setUpdateTrigger((prev) => prev + 1);
      }
    });
    return unsubscribe;
  }, [queryClient]);

  // Delete post mutation
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePostAPI(updatedPost._id),
    onSuccess: () => {
      toast.success("Gönderi silindi.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // Like post mutation with optimistic update
  const { mutate: likePost } = useMutation({
    mutationFn: () => likePostAPI(updatedPost._id),
    onMutate: async () => {
      // Cancel outgoing refetches for all posts queries
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous values for all posts queries
      const allPostsQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
      const previousQueries = new Map(allPostsQueries);

      // Optimistically update ALL posts queries
      allPostsQueries.forEach(([queryKey, oldData]) => {
        if (oldData && Array.isArray(oldData) && authUser?._id) {
          queryClient.setQueryData(queryKey, (currentData) => {
            if (!currentData || !Array.isArray(currentData)) return currentData;
            return currentData.map((oldPost) => {
              if (oldPost._id === updatedPost._id) {
                const isCurrentlyLiked = oldPost.likes.includes(authUser._id);
                const newLikes = isCurrentlyLiked
                  ? oldPost.likes.filter((id) => id.toString() !== authUser._id.toString())
                  : [...oldPost.likes, authUser._id];
                return { ...oldPost, likes: newLikes };
              }
              return oldPost;
            });
          });
        }
      });

      return { previousQueries };
    },
    onError: (error, variables, context) => {
      // Rollback on error for all queries
      if (context?.previousQueries) {
        context.previousQueries.forEach((oldData, queryKey) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      toast.error(error.message);
    },
    onSuccess: (updatedLikes) => {
      // Update cache with server response for ALL posts queries
      const allPostsQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
      allPostsQueries.forEach(([queryKey, oldData]) => {
        if (oldData && Array.isArray(oldData)) {
          queryClient.setQueryData(queryKey, (currentData) => {
            if (!currentData || !Array.isArray(currentData)) return currentData;
            return currentData.map((oldPost) => {
              if (oldPost._id === updatedPost._id) {
                return { ...oldPost, likes: updatedLikes };
              }
              return oldPost;
            });
          });
        }
      });
    },
  });

  // Save post mutation with optimistic update
  const { mutate: savePost } = useMutation({
    mutationFn: () => savePostAPI(updatedPost._id),
    onMutate: async () => {
      // Cancel outgoing refetches for all posts queries
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous values for all posts queries
      const allPostsQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
      const previousQueries = new Map(allPostsQueries);

      // Optimistically update ALL posts queries
      allPostsQueries.forEach(([queryKey, oldData]) => {
        if (oldData && Array.isArray(oldData) && authUser?._id) {
          queryClient.setQueryData(queryKey, (currentData) => {
            if (!currentData || !Array.isArray(currentData)) return currentData;
            return currentData.map((oldPost) => {
              if (oldPost._id === updatedPost._id) {
                const isCurrentlySaved = oldPost.saves.includes(authUser._id);
                const newSaves = isCurrentlySaved
                  ? oldPost.saves.filter((id) => id.toString() !== authUser._id.toString())
                  : [...oldPost.saves, authUser._id];
                return { ...oldPost, saves: newSaves };
              }
              return oldPost;
            });
          });
        }
      });

      return { previousQueries };
    },
    onError: (error, variables, context) => {
      // Rollback on error for all queries
      if (context?.previousQueries) {
        context.previousQueries.forEach((oldData, queryKey) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      toast.error(error.message);
    },
    onSuccess: (updatedSaves) => {
      // Update cache with server response for ALL posts queries
      const allPostsQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
      allPostsQueries.forEach(([queryKey, oldData]) => {
        if (oldData && Array.isArray(oldData)) {
          queryClient.setQueryData(queryKey, (currentData) => {
            if (!currentData || !Array.isArray(currentData)) return currentData;
            return currentData.map((oldPost) => {
              if (oldPost._id === updatedPost._id) {
                return { ...oldPost, saves: updatedSaves };
              }
              return oldPost;
            });
          });
        }
      });
    },
  });

  // Hide post mutation
  const { mutate: hidePost, isPending: isHiding } = useMutation({
    mutationFn: () => hidePostAPI(updatedPost._id),
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
    mutationFn: () => unhidePostAPI(updatedPost._id),
    onSuccess: () => {
      toast.success("Gönderi görünür hale getirildi.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });


  const postOwner = updatedPost?.user;
  const isLiked = authUser?._id ? updatedPost.likes.includes(authUser._id) : false;
  const isSaved = authUser?._id ? updatedPost.saves.includes(authUser._id) : false;

  const isMyPost = authUser?._id === updatedPost.user._id;

  const formattedDate = formatPostDate(updatedPost.createdAt);

  const theme = localStorage.getItem("theme");

  const handleDeletePost = () => {
    deletePost();
  };

  const handleEditPost = () => {
    setShowEditDialog(true);
    document.getElementById(`edit_post_modal_${updatedPost._id}`).showModal();
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    document.getElementById(`edit_post_modal_${updatedPost._id}`).close();
  };

  const handleOptions = (e) => {
    e.stopPropagation();
  };

  const handleLikePost = (e) => {
    e.stopPropagation();
    likePost();
  };

  const handleSavePost = (e) => {
    e.stopPropagation();
    savePost();
  };

  const handleRepost = (e) => {
    e.stopPropagation();
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    document.getElementById("image_modal" + updatedPost._id).showModal();
  };

  const handlePostClick = (e) => {
    e.stopPropagation();
    navigate(`/post/${updatedPost._id}`);
  };

  if (isLoading) return <LoadingSpinner size="md" />;

  return (
    <>
      {/* Post Body */}
      <div
        className="flex gap-2 items-start p-4 border-b transition cursor-pointer border-gray-700"
        onClick={handlePostClick}
      >
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.username}`}
            className="w-8 rounded-full overflow-hidden h-8"
            onClick={handleProfileClick}
          >
            <img src={postOwner.profileImage || defaultProfilePicture} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link
              to={`/profile/${postOwner.username}`}
              className="font-normal tracking-tighter md:tracking-normal md:font-bold text-sm md:text-base truncate"
              onClick={handleProfileClick}
            >
              {postOwner.fullname}
            </Link>
            <span className="text-gray-500 flex gap-1 text-xs md:text-sm">
              <Link to={`/profile/${postOwner.username}`}>
                @{postOwner.username}
              </Link>
              <span>·</span>
              <span className="text-gray-600 text-xs md:text-sm">{formattedDate}</span>
            </span>
            <div
              className="flex flex-1 justify-end w-12"
              onClick={handleOptions}
            >
              <PostOptions
                post={updatedPost}
                postOwner={postOwner}
                isMyPost={isMyPost}
                isHidden={isHidden}
                isDeleting={isDeleting}
                isHiding={isHiding}
                isUnhiding={isUnhiding}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
                onHide={hidePost}
                onUnhide={unhidePost}
                theme={theme}
              />
            </div>
          </div>
          {/* Post Content */}
          <div className="flex flex-col gap-3 overflow-hidden">
            <span className="text-sm md:text-base">{updatedPost.text}</span>
            {updatedPost.img && (
              <img
                src={updatedPost.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
                onClick={handleImageClick}
              />
            )}
          </div>
          {/* Post Actions */}
          <PostActions
            post={updatedPost}
            isLiked={isLiked}
            isSaved={isSaved}
            isLiking={false}
            isSaving={false}
            onLike={handleLikePost}
            onSave={handleSavePost}
            onComment={handlePostClick}
            onRepost={handleRepost}
            showCounts={true}
            variant="compact"
          />
        </div>
      </div>

      {/* Image Modal */}
      <PostImageModal post={updatedPost} />

      {/* Delete Post Modal */}
      <DeletePostDialog 
        modalId={`delete_modal_${updatedPost._id}`}
        handleDeletePost={handleDeletePost} 
      />

      {/* Edit Post Modal */}
      {showEditDialog && (
        <EditPostDialog 
          post={updatedPost} 
          onClose={handleCloseEditDialog}
          modalId={`edit_post_modal_${post._id}`}
        />
      )}
    </>
  );
};

export default Post;