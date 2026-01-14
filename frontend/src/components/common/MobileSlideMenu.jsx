import { Link } from "react-router-dom";
import { LuLogOut, LuX, LuChevronRight } from "react-icons/lu";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { MOBILE_MENU_ITEMS } from "../../constants/mobileMenuItems";

const MobileSlideMenu = ({ authUser, isOpen, onClose, onLogoutClick }) => {
  const getColorClasses = (color) => {
    const colors = {
      primary: {
        bg: "bg-primary/10",
        hover: "group-hover:bg-primary/20",
        text: "text-primary",
      },
      "amber-500": {
        bg: "bg-amber-500/10",
        hover: "group-hover:bg-amber-500/20",
        text: "text-amber-500",
      },
      "purple-500": {
        bg: "bg-purple-500/10",
        hover: "group-hover:bg-purple-500/20",
        text: "text-purple-500",
      },
    };
    return colors[color] || colors.primary;
  };

  const menuItems = MOBILE_MENU_ITEMS;

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    // Use setTimeout to ensure modal opens after menu closes and DOM updates
    if (onLogoutClick) {
      setTimeout(() => {
        onLogoutClick();
      }, 200);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden transition-all duration-500 ease-out ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-base-100/98 backdrop-blur-2xl border-l border-base-300/50 shadow-2xl z-[101] md:hidden transform transition-all duration-500 ease-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30">
              <img
                src={authUser?.profileImage || defaultProfilePicture}
                alt={authUser?.fullname}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-base">{authUser?.fullname}</p>
              <p className="text-sm text-base-content/60">@{authUser?.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-base-200 transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <div
          className="flex flex-col p-4 gap-2 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const colorClasses = getColorClasses(item.color);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-base-200/50 transition-all duration-200 group ${
                  isOpen ? `opacity-100 translate-x-0 ${item.delay}` : "opacity-0 translate-x-4"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${colorClasses.bg} ${colorClasses.hover} flex items-center justify-center transition-colors`}>
                  <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base">{item.label}</p>
                  <p className="text-xs text-base-content/50">{item.description}</p>
                </div>
                <LuChevronRight className="w-5 h-5 text-base-content/30 group-hover:text-base-content/60 transition-colors" />
              </Link>
            );
          })}

          <div className="h-px bg-base-300/50 my-2" />

          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group cursor-pointer w-full text-left ${
              isOpen ? "opacity-100 translate-x-0 delay-300" : "opacity-0 translate-x-4"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
              <LuLogOut className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base">Çıkış Yap</p>
              <p className="text-xs text-base-content/50">Hesabınızdan çıkış yapın</p>
            </div>
            <LuChevronRight className="w-5 h-5 text-base-content/30 group-hover:text-red-500/60 transition-colors" />
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileSlideMenu;
