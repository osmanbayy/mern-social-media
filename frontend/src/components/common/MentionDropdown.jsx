import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { searchUsers } from "../../api/users";

const MentionDropdown = ({ 
  show, 
  position, 
  searchQuery, 
  onSelectUser, 
  onClose 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: show && searchQuery.length > 0,
    staleTime: 0,
  });

  // Reset selected index when users change
  useEffect(() => {
    setSelectedIndex(0);
  }, [users]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < users.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (users[selectedIndex]) {
          onSelectUser(users[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, users, selectedIndex, onSelectUser, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (dropdownRef.current && selectedIndex >= 0) {
      const selectedElement = dropdownRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!show || searchQuery.length === 0) return null;

  return (
    <div
      className="absolute z-[100] bg-base-100 border border-base-300 rounded-2xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar min-w-[280px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      ref={dropdownRef}
    >
      {isLoading ? (
        <div className="p-4 text-center text-base-content/60">
          <span className="loading loading-spinner loading-sm"></span>
        </div>
      ) : users.length === 0 ? (
        <div className="p-4 text-center text-base-content/60 text-sm">
          Kullanıcı bulunamadı
        </div>
      ) : (
        users.map((user, index) => (
          <div
            key={user._id}
            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
              index === selectedIndex
                ? "bg-primary/20 hover:bg-primary/30"
                : "hover:bg-base-200"
            }`}
            onClick={() => onSelectUser(user)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="avatar flex-shrink-0">
              <div className="w-10 h-10 rounded-full ring-2 ring-base-300">
                <img
                  src={user.profileImage || defaultProfilePicture}
                  alt={user.fullname || "Kullanıcı"}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-semibold text-sm truncate">
                {user.fullname || "Kullanıcı"}
              </span>
              <span className="text-xs text-base-content/60 truncate">
                @{user.username}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MentionDropdown;
