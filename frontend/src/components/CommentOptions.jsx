import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaTrash } from "react-icons/fa";
import { TbEdit } from "react-icons/tb";
import LoadingSpinner from "./common/LoadingSpinner";

const CommentOptions = ({ 
  comment,
  postOwner,
  isMyComment,
  isPostOwner,
  isDeleting,
  isEditing,
  onEdit, 
  onDelete,
  theme 
}) => {
  const dropdownTriggerRef = useRef(null);

  return (
    <div className="flex flex-shrink-0">
      <div className="dropdown dropdown-left">
        <HiDotsHorizontal
          ref={dropdownTriggerRef}
          tabIndex={0}
          role="button"
          className="size-5 rounded-full hover:invert-50 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
        <ul
          tabIndex={0}
          className={`dropdown-content rounded-xl border border-base-300/50 menu bg-base-100/95 backdrop-blur-xl z-[100] font-semibold min-w-48 p-2 shadow-2xl transition-all duration-200 ease-out ${
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
          onClick={(e) => e.stopPropagation()}
        >
          {isMyComment && (
            <li 
              className="hover:bg-base-200/50 transition-colors duration-150 rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onEdit) {
                  onEdit();
                }
                if (dropdownTriggerRef.current) {
                  dropdownTriggerRef.current.blur();
                }
              }}
            >
              {isEditing ? (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <LoadingSpinner size="xs" /> <span className="text-xs">Düzenleniyor...</span>
                </div>
              ) : (
                <a className="rounded-none flex whitespace-nowrap cursor-pointer">
                  <TbEdit /> <span>Düzenle</span>
                </a>
              )}
            </li>
          )}
          
          {(isMyComment || isPostOwner) && (
            <li 
              className="hover:bg-red-500/10 hover:text-red-500 transition-colors duration-150 rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onDelete) {
                  onDelete();
                }
                if (dropdownTriggerRef.current) {
                  dropdownTriggerRef.current.blur();
                }
              }}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <LoadingSpinner size="xs" /> <span className="text-xs">Siliniyor...</span>
                </div>
              ) : (
                <a className="rounded-none flex whitespace-nowrap cursor-pointer text-red-500">
                  <FaTrash /> <span>Sil</span>
                </a>
              )}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommentOptions;
