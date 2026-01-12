const PostImageModal = ({ post }) => {
  return (
    <dialog
      id={`image_modal${post._id}`}
      className="modal border-none outline-none"
    >
      <div className="modal-box p-0 max-w-screen-sm">
        <img src={post.img} className="w-full object-contain" alt="Gönderi Resmi" />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button className="outline-none">Kapat</button>
      </form>
    </dialog>
  );
};

export default PostImageModal;
