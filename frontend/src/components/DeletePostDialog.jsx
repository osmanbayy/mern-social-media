import { FaTimes } from "react-icons/fa";

const DeletePostDialog = ({ handleDeletePost }) => {
  return (
    <dialog id="delete_modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            <FaTimes />
          </button>
        </form>
        <h3 className="font-bold text-lg">Emin misin?</h3>
        <p className="py-4 mb-5">
          Gönderiyi silmek istediğinden emin misin? <br /> Bu işlem geri
          alınamaz!
        </p>
        <div className="absolute right-2 bottom-2 flex items-center gap-2 pt-5">
          <button
            onClick={() => document.getElementById("delete_modal").close()}
            className="btn btn-md btn-neutral"
          >
            İptal
          </button>
          <button
            onClick={async () => {
              await handleDeletePost();
              document.getElementById("delete_modal").close();
            }}
            className="btn btn-md btn-error text-white"
          >
            Sil
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default DeletePostDialog;
