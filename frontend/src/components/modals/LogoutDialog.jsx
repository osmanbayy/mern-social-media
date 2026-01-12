import { FaTimes } from "react-icons/fa";

const LogoutDialog = ({ handleLogout }) => {
  return (
    <dialog id="logout_modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            <FaTimes />
          </button>
        </form>
        <h3 className="font-bold text-lg">Çıkış Yap</h3>
        <p className="py-4 mb-5">Çıkış yapmak istiyor musun?</p>
        <div className="absolute right-2 bottom-2 flex items-center gap-2 pt-5">
          <button
            onClick={() => document.getElementById("logout_modal").close()}
            className="btn btn-md btn-neutral"
          >
            İptal
          </button>
          <button
            onClick={() => {
              handleLogout();
              document.getElementById("logout_modal").close();
            }}
            className="btn btn-md btn-error text-white"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default LogoutDialog;
