import { MdEdit } from "react-icons/md";
import defaultCoverPicture from "../../assets/default-cover.jpg";

const CoverImageModal = ({ user, isMyProfile, coverImgRef, coverImg }) => {
  if (!user) return null;

  const handleEditClick = async () => {
    coverImgRef.current?.click();
    document.getElementById(`cover_image_modal${user._id}`).close();
  };

  return (
    <dialog
      id={`cover_image_modal${user._id}`}
      className="modal border-none outline-none"
    >
      <div className="modal-box p-0 max-w-screen-sm relative">
        <img
          src={coverImg || user?.coverImg || defaultCoverPicture}
          className="w-full object-contain rounded-lg"
          alt="Cover"
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

export default CoverImageModal;
