import { LuLogOut, LuX } from "react-icons/lu";

const LogoutDialog = ({ handleLogout }) => {
  return (
    <dialog id="logout_modal" className="modal backdrop-blur-sm">
      <div className="modal-box bg-base-100/95 backdrop-blur-xl border border-base-300/50 shadow-2xl max-w-md p-0 overflow-hidden">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10 hover:bg-base-200/50 transition-all duration-200">
            <LuX className="w-4 h-4" />
          </button>
        </form>
        
        {/* Header with icon */}
        <div className="flex flex-col items-center pt-8 pb-6 px-6 bg-gradient-to-br from-error/10 via-error/5 to-transparent border-b border-base-300/30">
          <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-4 ring-4 ring-error/10">
            <LuLogOut className="w-8 h-8 text-error" />
          </div>
          <h3 className="font-bold text-xl text-base-content mb-2">Çıkış Yap</h3>
          <p className="text-sm text-base-content/70 text-center">
            Hesabından çıkış yapmak istediğinden emin misin?
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-base text-base-content/80 text-center mb-6">
            Çıkış yaptıktan sonra tekrar giriş yapman gerekecek.
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => document.getElementById("logout_modal").close()}
              className="btn btn-ghost flex-1 hover:bg-base-200/50 transition-all duration-200 font-medium"
            >
              İptal
            </button>
            <button
              onClick={() => {
                handleLogout();
                document.getElementById("logout_modal").close();
              }}
              className="btn btn-error flex-1 text-white hover:bg-error/90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <LuLogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default LogoutDialog;
