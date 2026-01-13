const PostImageModal = ({ post }) => {
  if (!post || !post._id) return null;
  
  const modalId = `image_modal${post._id}`;
  
  return (
    <dialog
      id={modalId}
      className="modal border-none outline-none z-[9999]"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 'auto',
        maxWidth: '100vw',
        maxHeight: '100vh',
        padding: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent'
      }}
    >
      <div className="modal-box p-0 max-w-screen-sm w-full m-0" style={{ maxHeight: '100vh', overflow: 'auto', backgroundColor: 'transparent', border: 'none' }}>
        <img 
          src={post.img} 
          className="w-full h-auto object-contain" 
          alt="Gönderi Resmi"
          style={{ maxHeight: '100vh' }}
          draggable="false"
        />
      </div>
      <form method="dialog" className="modal-backdrop bg-black/80" style={{ position: 'fixed', inset: 0 }}>
        <button type="button" className="outline-none w-full h-full">Kapat</button>
      </form>
    </dialog>
  );
};

export default PostImageModal;
