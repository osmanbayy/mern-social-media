import Post from "../models/post_model.js";
import User from "../models/user_model.js";
import Notification from "../models/notification_model.js";
import { v2 as cloudinary } from "cloudinary";

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

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
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

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { text, img },
      { new: true }
    ).populate({
      path: "user",
      select: "-password",
    }).populate({
      path: "comments.user",
      select: "-password",
    });

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

    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();

    res.status(200).json(post);
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
    
    // Kullanıcının gizlediği gönderileri al
    const user = await User.findById(userId);
    const hiddenPostIds = user.hiddenPosts.map(id => id.toString());
    
    const posts = await Post.find({
      _id: { $nin: hiddenPostIds } // Gizlenen gönderileri hariç tut
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(posts);
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

    const feedPosts = await Post.find({ 
      user: { $in: following },
      _id: { $nin: hiddenPostIds } // Gizlenen gönderileri hariç tut
    })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
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

export const get_user_posts = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
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

export const save_unsave_post = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({ message: "Gönderiye ulaşılamıyor. Silinmiş veya arşivlenmiş olabilir."})
    }

    const userSavedPost = post.saves.includes(userId);
    if(userSavedPost){
      // remove post from saved posts
      await Post.updateOne({ _id: postId }, { $pull: { saves: userId } });
      await User.updateOne({ _id: userId }, { $pull: { savedPosts: postId }});

      const updatedSaves = post.saves.filter((id) => id .toString() !== userId.toString());
      res.status(200).json(updatedSaves);
    } else {
      // save post
      post.saves.push(userId);
      await User.updateOne({ _id: userId }, { $push: { savedPosts: postId }});
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