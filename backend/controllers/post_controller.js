import Post from "../models/post_model.js";
import User from "../models/user_model.js";
import Notification from "../models/notification_model.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// Helper function to parse mentions from text
const parseMentions = async (text, excludeUserId) => {
  if (!text) return [];

  // Match @username pattern (username can contain letters, numbers, underscores)
  const mentionRegex = /@(\w+)/g;
  const matches = [...text.matchAll(mentionRegex)];
  const usernames = [...new Set(matches.map(match => match[1]))]; // Remove duplicates

  if (usernames.length === 0) return [];

  // Find users by username
  const users = await User.find({
    username: { $in: usernames },
    _id: { $ne: excludeUserId } // Exclude the user who is mentioning
  }).select("_id");

  return users.map(user => user._id);
};

// Helper function to send mention notifications
const sendMentionNotifications = async (mentionedUserIds, fromUserId, postId, commentId = null, replyId = null) => {
  if (!mentionedUserIds || mentionedUserIds.length === 0) return;

  const notifications = mentionedUserIds.map(mentionedUserId => ({
    from: fromUserId,
    to: mentionedUserId,
    type: "mention",
    post: postId,
    comment: commentId || replyId || undefined,
  }));

  try {
    await Notification.insertMany(notifications);
  } catch (error) {
    console.log("Error creating mention notifications:", error.message);
  }
};

export const create_post = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    if (!text && !img) {
      return res.status(400).json({ message: "Gönderiniz boş olamaz." });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    // Parse mentions from text
    const mentions = await parseMentions(text, userId);

    const newPost = new Post({
      user: userId,
      text,
      img,
      mentions,
    });

    await newPost.save();

    // Send mention notifications
    await sendMentionNotifications(mentions, userId, newPost._id);

    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in create post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const delete_post = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        message: "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.",
      });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Gönderiyi silmek için giriş yapmalısınız." });
    }
    if (post.img) {
      const imageId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Gönderi silindi." });
  } catch (error) {
    console.log("Error in delete post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const edit_post = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const postId = req.params.id;
    const userId = req.user._id.toString();

    if (!text && !img) {
      return res.status(400).json({ message: "Gönderiniz boş olamaz." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.",
      });
    }

    if (post.user.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "Gönderiyi düzenlemek için yetkiniz yok." });
    }

    // Eğer yeni resim yüklendiyse, eski resmi sil
    if (img && img !== post.img) {
      if (post.img) {
        const oldImageId = post.img.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(oldImageId);
      }
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    // Parse mentions from text if text is updated
    let mentions = post.mentions;
    if (text) {
      mentions = await parseMentions(text, userId);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { text, img, mentions },
      { new: true }
    ).populate({
      path: "user",
      select: "-password",
    }).populate({
      path: "comments.user",
      select: "-password",
    });

    // Send mention notifications if mentions changed
    if (text && JSON.stringify(mentions.sort()) !== JSON.stringify(post.mentions.map(m => m.toString()).sort())) {
      await sendMentionNotifications(mentions, userId, postId);
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.log("Error in edit post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const comment_on_post = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Boş yorum yapılamaz." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.",
      });
    }

    // Parse mentions from comment text
    const commentMentions = await parseMentions(text, userId);

    const comment = {
      user: userId,
      text,
      mentions: commentMentions,
    };
    post.comments.push(comment);
    await post.save();

    // Kullanıcı kendi gönderisine yorum yapmıyorsa bildirim oluştur
    if (post.user.toString() !== userId.toString()) {
      try {
        const notification = new Notification({
          from: userId,
          to: post.user,
          type: "comment",
          post: postId,
        });
        await notification.save();
      } catch (error) {
        console.log("Error creating comment notification:", error.message);
      }
    }

    // Send mention notifications for comment
    const newComment = post.comments[post.comments.length - 1];
    await sendMentionNotifications(commentMentions, userId, postId, newComment._id);

    // Post'u populate ederek döndür
    const populatedPost = await Post.findById(postId)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(populatedPost);
  } catch (error) {
    console.log("Error in comment controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const like_unlike_post = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.",
      });
    }

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      // unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
      res.status(200).json(updatedLikes);
    } else {
      // like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
        post: postId,
      });

      await notification.save();

      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in like/unlike controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_all_posts = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Kullanıcının gizlediği gönderileri al
    const user = await User.findById(userId);
    const hiddenPostIds = user.hiddenPosts.map(id => id.toString());
    
    // Get blocked user IDs (users who blocked current user)
    const blockedByUsers = await User.find({
      blockedUsers: userId
    }).select("_id");

    const blockedByUserIds = blockedByUsers.map(u => u._id.toString());
    
    // Also exclude users that current user has blocked
    const blockedUserIds = user.blockedUsers.map(id => id.toString());

    // Get total count
    const totalPosts = await Post.countDocuments({
      _id: { $nin: hiddenPostIds },
      user: { $nin: [...blockedUserIds.map(id => new mongoose.Types.ObjectId(id)), ...blockedByUserIds.map(id => new mongoose.Types.ObjectId(id))] }
    });

    const posts = await Post.find({
      _id: { $nin: hiddenPostIds }, // Gizlenen gönderileri hariç tut
      user: { $nin: [...blockedUserIds.map(id => new mongoose.Types.ObjectId(id)), ...blockedByUserIds.map(id => new mongoose.Types.ObjectId(id))] } // Engellenen kullanıcıların postlarını hariç tut
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "originalPost",
        populate: {
          path: "user",
          select: "-password",
        },
      })
      .populate({
        path: "retweetedBy",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    const hasMore = skip + posts.length < totalPosts;

    res.status(200).json({
      posts,
      hasMore,
      page,
      limit,
      total: totalPosts
    });
  } catch (error) {
    console.log("Error in get all posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_liked_posts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in get liked posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_following_posts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const following = user.following;

    // Kullanıcının gizlediği gönderileri al
    const hiddenPostIds = user.hiddenPosts.map(id => id.toString());
    
    // Get blocked user IDs (users who blocked current user)
    const blockedByUsers = await User.find({
      blockedUsers: userId
    }).select("_id");

    const blockedByUserIds = blockedByUsers.map(u => u._id.toString());
    
    // Also exclude users that current user has blocked
    const blockedUserIds = user.blockedUsers.map(id => id.toString());
    
    // Filter following to exclude blocked users
    const followingFiltered = following.filter(
      (id) => !blockedUserIds.includes(id.toString()) && !blockedByUserIds.includes(id.toString())
    );

    const feedPosts = await Post.find({
      user: { $in: followingFiltered },
      _id: { $nin: hiddenPostIds }
    })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "originalPost",
        populate: {
          path: "user",
          select: "-password",
        },
      })
      .populate({
        path: "retweetedBy",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in get following posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_single_post = async (req, res) => {
  const { id } = req.params;

  try {
    // Disable caching for this endpoint
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Content-Type": "application/json",
    });

    if (!id) {
      return res.status(400).json({ message: "Post ID gerekli." });
    }

    const post = await Post.findById(id)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "originalPost",
        populate: {
          path: "user",
          select: "-password",
        },
      })
      .populate({
        path: "retweetedBy",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      })
      .populate({
        path: "comments.replies.user",
        select: "-password",
      });

    if (!post) {
      return res.status(404).json({
        message: "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir.",
      });
    }

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in get single post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_user_posts = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ isPinned: -1, createdAt: -1 }) // Pinned posts first, then by date
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "originalPost",
        populate: {
          path: "user",
          select: "-password",
        },
      })
      .populate({
        path: "retweetedBy",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in get user posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Search posts
export const search_posts = async (req, res) => {
  try {
    const { query, page = 1, limit = 5 } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length === 0) {
      return res.status(200).json({
        posts: [],
        hasMore: false,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    }

    const searchQuery = query.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user's hidden posts
    const user = await User.findById(userId);
    const hiddenPostIds = user.hiddenPosts.map(id => id.toString());
    
    // Get blocked user IDs (users who blocked current user)
    const blockedByUsers = await User.find({
      blockedUsers: userId
    }).select("_id");

    const blockedByUserIds = blockedByUsers.map(u => u._id.toString());
    
    // Also exclude users that current user has blocked
    const blockedUserIds = user.blockedUsers.map(id => id.toString());

    // Search posts by text content (case insensitive)
    const posts = await Post.find({
      _id: { $nin: hiddenPostIds },
      user: { $nin: [...blockedUserIds.map(id => new mongoose.Types.ObjectId(id)), ...blockedByUserIds.map(id => new mongoose.Types.ObjectId(id))] },
      $or: [
        { text: { $regex: searchQuery, $options: "i" } }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    // Get total count for hasMore
    const totalCount = await Post.countDocuments({
      _id: { $nin: hiddenPostIds },
      user: { $nin: [...blockedUserIds.map(id => new mongoose.Types.ObjectId(id)), ...blockedByUserIds.map(id => new mongoose.Types.ObjectId(id))] },
      $or: [
        { text: { $regex: searchQuery, $options: "i" } }
      ]
    });

    const hasMore = skip + posts.length < totalCount;

    res.status(200).json({
      posts,
      hasMore,
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalCount
    });
  } catch (error) {
    console.log("Error in search posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const save_unsave_post = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir." })
    }

    const userSavedPost = post.saves.includes(userId);
    if (userSavedPost) {
      // remove post from saved posts
      await Post.updateOne({ _id: postId }, { $pull: { saves: userId } });
      await User.updateOne({ _id: userId }, { $pull: { savedPosts: postId } });

      const updatedSaves = post.saves.filter((id) => id.toString() !== userId.toString());
      res.status(200).json(updatedSaves);
    } else {
      // save post
      post.saves.push(userId);
      await User.updateOne({ _id: userId }, { $push: { savedPosts: postId } });
      await post.save();

      const updatedSaves = post.saves;
      res.status(200).json(updatedSaves);
    }
  } catch (error) {
    console.log("Error in save/unsave controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
}

export const get_saved_posts = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const savedPosts = await Post.find({ _id: { $in: user.savedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(savedPosts);
  } catch (error) {
    console.log("Error in get saved posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const hide_post = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Gönderi zaten gizli mi kontrol et
    const isAlreadyHidden = user.hiddenPosts.includes(postId);
    if (isAlreadyHidden) {
      return res.status(400).json({ message: "Bu gönderi zaten gizli." });
    }

    // Gönderiyi gizle
    user.hiddenPosts.push(postId);
    await user.save();

    res.status(200).json({ message: "Gönderi gizlendi." });
  } catch (error) {
    console.log("Error in hide post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const unhide_post = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Gönderiyi gizliden çıkar
    user.hiddenPosts = user.hiddenPosts.filter(id => id.toString() !== postId.toString());
    await user.save();

    res.status(200).json({ message: "Gönderi görünür hale getirildi." });
  } catch (error) {
    console.log("Error in unhide post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const get_hidden_posts = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const hiddenPosts = await Post.find({ _id: { $in: user.hiddenPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(hiddenPosts);
  } catch (error) {
    console.log("Error in get hidden posts controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const pin_unpin_post = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Gönderi bulunamadı." });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bu gönderiyi sabitleme yetkiniz yok." });
    }

    // If unpinning, just set isPinned to false
    if (post.isPinned) {
      post.isPinned = false;
      await post.save();
      return res.status(200).json({ message: "Gönderi sabitlemeden kaldırıldı.", post });
    }

    // If pinning, first unpin all other pinned posts by this user
    await Post.updateMany(
      { user: req.user._id, isPinned: true },
      { isPinned: false }
    );

    // Then pin this post
    post.isPinned = true;
    await post.save();

    res.status(200).json({ message: "Gönderi başa sabitlendi.", post });
  } catch (error) {
    console.log("Error in pin/unpin post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Like/Unlike Comment
export const like_unlike_comment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Gönderi bulunamadı." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı." });
    }

    const userLikedComment = comment.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (userLikedComment) {
      // Unlike comment
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like comment
      comment.likes.push(userId);

      // Send notification if user is not liking their own comment
      if (comment.user.toString() !== userId.toString()) {
        try {
          const notification = new Notification({
            from: userId,
            to: comment.user,
            type: "like",
            post: postId,
            comment: commentId,
          });
          await notification.save();
        } catch (error) {
          console.log("Error creating comment like notification:", error.message);
        }
      }
    }

    await post.save();

    const populatedPost = await Post.findById(postId)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      })
      .populate({
        path: "comments.replies.user",
        select: "-password",
      });

    res.status(200).json(populatedPost);
  } catch (error) {
    console.log("Error in like/unlike comment controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Reply to Comment
export const reply_to_comment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Boş yanıt yapılamaz." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Gönderi bulunamadı." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı." });
    }

    // Parse mentions from reply text
    const replyMentions = await parseMentions(text, userId);

    const reply = {
      user: userId,
      text,
      mentions: replyMentions,
    };

    comment.replies.push(reply);
    await post.save();

    // Send notification to comment owner if not replying to own comment
    if (comment.user.toString() !== userId.toString()) {
      try {
        const notification = new Notification({
          from: userId,
          to: comment.user,
          type: "comment",
          post: postId,
          comment: commentId,
        });
        await notification.save();
      } catch (error) {
        console.log("Error creating reply notification:", error.message);
      }
    }

    // Send mention notifications for reply
    const newReply = comment.replies[comment.replies.length - 1];
    await sendMentionNotifications(replyMentions, userId, postId, commentId, newReply._id);

    const populatedPost = await Post.findById(postId)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      })
      .populate({
        path: "comments.replies.user",
        select: "-password",
      });

    res.status(200).json(populatedPost);
  } catch (error) {
    console.log("Error in reply to comment controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Delete Comment
export const delete_comment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Gönderi bulunamadı." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı." });
    }

    // Check permissions: user can delete if:
    // 1. They own the comment, OR
    // 2. They own the post (post owner can delete any comment on their post)
    const isCommentOwner = comment.user.toString() === userId.toString();
    const isPostOwner = post.user.toString() === userId.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ message: "Bu yorumu silme yetkiniz yok." });
    }

    post.comments.pull(commentId);
    await post.save();

    const populatedPost = await Post.findById(postId)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      })
      .populate({
        path: "comments.replies.user",
        select: "-password",
      });

    res.status(200).json(populatedPost);
  } catch (error) {
    console.log("Error in delete comment controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Edit Comment
export const edit_comment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Boş yorum yapılamaz." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Gönderi bulunamadı." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı." });
    }

    // Only comment owner can edit
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bu yorumu düzenleme yetkiniz yok." });
    }

    // Parse mentions from updated comment text
    const commentMentions = await parseMentions(text, userId);

    comment.text = text;
    comment.mentions = commentMentions;
    await post.save();

    // Send mention notifications if mentions changed
    await sendMentionNotifications(commentMentions, userId, postId, commentId);

    const populatedPost = await Post.findById(postId)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      })
      .populate({
        path: "comments.replies.user",
        select: "-password",
      });

    res.status(200).json(populatedPost);
  } catch (error) {
    console.log("Error in edit comment controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Retweet a post (direct retweet)
export const retweet_post = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id.toString();

    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({ message: "Gönderi bulunamadı." });
    }

    // Check if already retweeted (check if user has a retweet post for this)
    const existingRetweet = await Post.findOne({
      user: userId,
      originalPost: postId,
      isQuoteRetweet: false,
    });

    if (existingRetweet) {
      // Unretweet - delete the retweet post
      await Post.findByIdAndDelete(existingRetweet._id);
      
      // Remove from retweetedBy array
      originalPost.retweetedBy = originalPost.retweetedBy.filter(
        (id) => id.toString() !== userId
      );
      await originalPost.save();
      
      return res.status(200).json({ message: "Retweet geri alındı.", retweeted: false });
    } else {
      // Create retweet post
      const retweetPost = new Post({
        user: userId,
        originalPost: postId,
        isQuoteRetweet: false,
      });
      await retweetPost.save();

      // Add to retweetedBy array
      if (!originalPost.retweetedBy.includes(userId)) {
        originalPost.retweetedBy.push(userId);
        await originalPost.save();
      }

      // Create notification for original post owner (if not self)
      if (originalPost.user.toString() !== userId) {
        await Notification.findOneAndUpdate(
          {
            user: originalPost.user,
            type: "retweet",
            post: postId,
            from: userId,
          },
          {
            user: originalPost.user,
            type: "retweet",
            post: postId,
            from: userId,
            read: false,
          },
          { upsert: true, new: true }
        );
      }

      const populatedRetweet = await Post.findById(retweetPost._id)
        .populate({
          path: "user",
          select: "-password",
        })
        .populate({
          path: "originalPost",
          populate: {
            path: "user",
            select: "-password",
          },
        });

      return res.status(200).json({ message: "Gönderi retweet edildi.", retweeted: true, post: populatedRetweet });
    }
  } catch (error) {
    console.log("Error in retweet post controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Quote retweet (create new post with reference to original)
export const quote_retweet = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({ message: "Gönderi bulunamadı." });
    }

    if (!text && !img) {
      return res.status(400).json({ message: "Alıntı metni veya resim gereklidir." });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    // Parse mentions from text
    const mentions = await parseMentions(text, userId);

    // Create quote retweet post
    const quotePost = new Post({
      user: userId,
      text,
      img,
      mentions,
      originalPost: postId,
      isQuoteRetweet: true,
    });

    await quotePost.save();

    // Add to retweetedBy array of original post
    if (!originalPost.retweetedBy.includes(userId)) {
      originalPost.retweetedBy.push(userId);
      await originalPost.save();
    }

    // Send mention notifications
    await sendMentionNotifications(mentions, userId, quotePost._id);

    // Create notification for original post owner (if not self)
    if (originalPost.user.toString() !== userId) {
      await Notification.findOneAndUpdate(
        {
          user: originalPost.user,
          type: "quote_retweet",
          post: postId,
          from: userId,
        },
        {
          user: originalPost.user,
          type: "quote_retweet",
          post: postId,
          from: userId,
          read: false,
        },
        { upsert: true, new: true }
      );
    }

    const populatedPost = await Post.findById(quotePost._id)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "originalPost",
        populate: {
          path: "user",
          select: "-password",
        },
      });

    res.status(201).json(populatedPost);
  } catch (error) {
    console.log("Error in quote retweet controller", error.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};