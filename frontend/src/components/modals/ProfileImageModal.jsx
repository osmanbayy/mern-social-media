import { MdEdit } from "react-icons/md";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";

const ProfileImageModal = ({ user, isMyProfile, profileImgRef }) => {
  if (!user) return null;

  const handleEditClick = async () => {
    profileImgRef.current?.click();
    document.getElementById(`profile_image_modal${user._id}`).close();
  };

  return (
    <dialog
      id={`profile_image_modal${user._id}`}
      className="modal border-none outline-none"
    >
      <div className="modal-box p-0 max-w-screen-sm relative">
        <img
          src={user?.profileImage || defaultProfilePicture}
          className="w-full object-contain rounded-lg"
          alt="Profile"
        />
        {isMyProfile && (
          <button
            onClick={handleEditClick}
            className="absolute top-3 right-3 flex items-center gap-1 bg-neutral/80 hover:bg-neutral p-3 rounded-full text-white transition-all duration-200 hover:scale-110"
          >
            <MdEdit className="w-6 h-6" />
          </button>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button className="outline-none">close</button>
      </form>
    </dialog>
  );
};

export default ProfileImageModal;
