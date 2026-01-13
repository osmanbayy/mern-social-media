import { HiDotsHorizontal } from "react-icons/hi";
import { BsEmojiFrown } from "react-icons/bs";
import { SlUserFollow, SlUserUnfollow } from "react-icons/sl";
import { FaTrash } from "react-icons/fa";
import { TbEdit } from "react-icons/tb";
import { LuPin, LuEyeOff } from "react-icons/lu";
import { MdOutlineShowChart } from "react-icons/md";
import { GoBlocked, GoMute } from "react-icons/go";
import { CiFlag1 } from "react-icons/ci";
import LoadingSpinner from "./common/LoadingSpinner";
import useFollow from "../hooks/useFollow";

const PostOptions = ({ 
  post, 
  postOwner,
  isMyPost, 
  isHidden, 
  isDeleting, 
  isHiding, 
  isUnhiding, 
  onEdit, 
  onHide, 
  onUnhide,
  theme 
}) => {
  const { follow, isPending, amIFollowing } = useFollow(postOwner._id);

  return (
    <div className="flex flex-1 justify-end w-12">
      <div className="dropdown dropdown-left">
        <HiDotsHorizontal
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
          {isHidden && (
            <li 
              className=""
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
              onClick={() =>
                document.getElementById(`delete_modal_${post._id}`).showModal()
              }
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
            <li className="">
              <a href="">
                <LuPin /> <span>Profilde Başa Sabitle</span>
              </a>
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
            <li onClick={() => follow(postOwner._id)}>
              {isPending ? (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <LoadingSpinner size="xs" /> <span className="text-xs">Yükleniyor...</span>
                </div>
              ) : (
                <a className="rounded-none whitespace-nowrap">
                  {amIFollowing ? (
                    <>
                      <SlUserUnfollow /> Takipten Çık
                    </>
                  ) : (
                    <>
                      <SlUserFollow /> Takip et
                    </>
                  )}
                  <span className="text-gray-500">
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
            <li>
              <a href="" className="rounded-none whitespace-nowrap">
                <GoBlocked /> Engelle{" "}
                <span className="text-gray-500">
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
    </div>
  );
};

export default PostOptions; 