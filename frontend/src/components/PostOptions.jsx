import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiDotsHorizontal } from "react-icons/hi";
import { BsEmojiFrown } from "react-icons/bs";
import { SlUserFollow, SlUserUnfollow } from "react-icons/sl";
import { FaTrash } from "react-icons/fa";
import { TbEdit } from "react-icons/tb";
import { LuPin, LuEyeOff, LuShare2 } from "react-icons/lu";
import { MdOutlineShowChart } from "react-icons/md";
import { GoBlocked, GoMute } from "react-icons/go";
import { CiFlag1 } from "react-icons/ci";
import LoadingSpinner from "./common/LoadingSpinner";
import useFollow from "../hooks/useFollow";
import ShareModal from "./modals/ShareModal";
import BlockUserDialog from "./modals/BlockUserDialog";
import { blockUser } from "../api/users";
import { useQueryClient } from "@tanstack/react-query";

const PostOptions = ({ 
  post, 
  postOwner,
  isMyPost, 
  isHidden, 
  isDeleting, 
  isHiding, 
  isUnhiding,
  isPinning,
  onEdit, 
  onDelete,
  onHide, 
  onUnhide,
  onPin,
  theme 
}) => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { follow, unfollow, isPending } = useFollow(postOwner._id);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const dropdownTriggerRef = useRef(null);
  const queryClient = useQueryClient();
  
  // Check if current user is following the post owner
  const amIFollowing = authUser?.following?.some(
    (userId) => userId._id === postOwner._id || userId === postOwner._id
  ) || false;

  // Close dropdown when share modal opens
  useEffect(() => {
    if (showShareModal && dropdownTriggerRef.current) {
      dropdownTriggerRef.current.blur();
      // Force close by removing focus
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  }, [showShareModal]);

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close dropdown immediately
    if (dropdownTriggerRef.current) {
      dropdownTriggerRef.current.blur();
    }
    
    // Small delay to ensure dropdown closes before modal opens
    setTimeout(() => {
      setShowShareModal(true);
    }, 100);
  };

  const handleBlockClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close dropdown immediately
    if (dropdownTriggerRef.current) {
      dropdownTriggerRef.current.blur();
    }
    
    // Small delay to ensure dropdown closes before modal opens
    setTimeout(() => {
      setShowBlockDialog(true);
    }, 100);
  };

  const handleBlockConfirm = async () => {
    setIsBlocking(true);
    try {
      await blockUser(postOwner._id);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setShowBlockDialog(false);
    } catch (error) {
      console.error("Error blocking user:", error);
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <div className="flex flex-1 justify-end w-12">
      <div className="dropdown dropdown-left">
        <HiDotsHorizontal
          ref={dropdownTriggerRef}
          tabIndex={0}
          role="button"
          className="size-5 rounded-full hover:invert-50"
        />
        <ul
          tabIndex={0}
          className={`dropdown-content rounded-xl border border-base-300/50 menu bg-base-100/95 backdrop-blur-xl z-[100] font-semibold min-w-60 p-2 shadow-2xl transition-all duration-200 ease-out ${
            theme === "dark" 
              ? "shadow-black/40 ring-1 ring-white/10" 
              : "shadow-black/20 ring-1 ring-black/5"
          }`}
          style={{
            boxShadow: theme === "dark"
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)"
              : "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            animation: "dropdownFadeIn 0.2s ease-out"
          }}
        >
          {/* Share Option - Always visible */}
          <li 
            className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg"
            onClick={handleShareClick}
          >
            <a className="rounded-none flex whitespace-nowrap cursor-pointer">
              <LuShare2 /> <span>Paylaş</span>
            </a>
          </li>

          {isHidden && (
            <li 
              className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUnhide();
              }}
            >
              {isUnhiding ? (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <LoadingSpinner size="xs" /> <span className="text-xs">Görünür Hale Getiriliyor...</span>
                </div>
              ) : (
                <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                  <LuEyeOff /> Görünür Hale Getir
                </a>
              )}
            </li>
          )}
          
          {isMyPost && (
            <li
              className=""
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onDelete) {
                  onDelete();
                }
              }}
            >
              {!isDeleting && (
                <div>
                  <FaTrash /> <span>Gönderiyi Sil</span>
                </div>
              )}
              {isDeleting && <LoadingSpinner size="sm" />}
            </li>
          )}
          
          {isMyPost && (
            <li
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <TbEdit className="size-5" /> <span>Düzenle</span>
              </div>
            </li>
          )}
          
          {isMyPost && (
            <li 
              className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onPin) {
                  onPin();
                }
              }}
            >
              {isPinning ? (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <LoadingSpinner size="xs" /> <span className="text-xs">Yükleniyor...</span>
                </div>
              ) : (
                <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                  <LuPin /> <span>{post?.isPinned ? "Sabitlemeyi Kaldır" : "Profilde Başa Sabitle"}</span>
                </a>
              )}
            </li>
          )}
          
          {isMyPost && (
            <li className="">
              <a href="">
                <MdOutlineShowChart /> <span>Görünürlüğü Düzenle</span>
              </a>
            </li>
          )}
          
          {!isMyPost && !isHidden && (
            <li 
              className=""
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onHide();
              }}
            >
              {isHiding ? (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <LoadingSpinner size="xs" /> <span className="text-xs">Gizleniyor...</span>
                </div>
              ) : (
                <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                  <BsEmojiFrown /> Bu gönderi ilgimi çekmiyor
                </a>
              )}
            </li>
          )}
          
          {!isMyPost && (
            <li 
              className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (amIFollowing) {
                  unfollow();
                } else {
                  follow();
                }
              }}
            >
              {isPending ? (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <LoadingSpinner size="xs" /> <span className="text-xs">Yükleniyor...</span>
                </div>
              ) : (
                <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                  {amIFollowing ? (
                    <>
                      <SlUserUnfollow /> <span>Takipten Çık</span>
                    </>
                  ) : (
                    <>
                      <SlUserFollow /> <span>Takip et</span>
                    </>
                  )}
                  <span className="text-base-content/60 ml-1">
                    @{postOwner.username}
                  </span>
                </a>
              )}
            </li>
          )}
          
          {!isMyPost && (
            <li>
              <a href="" className="rounded-none whitespace-nowrap">
                <GoMute /> Sessize Al{" "}
                <span className="text-gray-500">
                  @{postOwner.username}
                </span>
              </a>
            </li>
          )}
          
          {!isMyPost && (
            <li 
              className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg"
              onClick={handleBlockClick}
            >
              <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                <GoBlocked /> Engelle{" "}
                <span className="text-base-content/60">
                  @{postOwner.username}
                </span>
              </a>
            </li>
          )}
          
          {!isMyPost && (
            <li>
              <a href="" className="rounded-none whitespace-nowrap">
                <CiFlag1 /> Bildir{" "}
              </a>
            </li>
          )}
        </ul>
      </div>

      {/* Share Modal */}
      <ShareModal
        post={post}
        postOwner={postOwner}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Block User Dialog */}
      {!isMyPost && (
        <BlockUserDialog
          isOpen={showBlockDialog}
          onClose={() => setShowBlockDialog(false)}
          onConfirm={handleBlockConfirm}
          userName={postOwner.username}
          isBlocking={isBlocking}
        />
      )}
    </div>
  );
};

export default PostOptions; 