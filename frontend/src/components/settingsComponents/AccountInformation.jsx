import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { LuUser, LuAtSign, LuMail, LuBadgeCheck } from "react-icons/lu";

const AccountInformation = () => {
  const navigate = useNavigate();
  const { data: authUser, isLoading } = useQuery({ queryKey: ["authUser"] });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const infoItems = [
    {
      label: "Ad Soyad",
      value: authUser?.fullname || "Belirtilmemiş",
      icon: LuUser,
    },
    {
      label: "Kullanıcı Adı",
      value: `@${authUser?.username || ""}`,
      icon: LuAtSign,
    },
    {
      label: "E-Posta",
      value: authUser?.email || "Belirtilmemiş",
      icon: LuMail,
    },
    {
      label: "Hesap Durumu",
      value: authUser?.isAccountVerified ? "Doğrulanmış" : "Doğrulanmamış",
      icon: LuBadgeCheck,
      isVerified: authUser?.isAccountVerified,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Profile Card */}
      <div className="p-6 rounded-2xl bg-base-200/30 backdrop-blur-sm border border-base-300/50 shadow-lg">
        <h3 className="text-lg font-semibold mb-6 text-base-content">
          Hesap Bilgileri
        </h3>
        <div className="flex flex-col gap-4">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-base-100/50 hover:bg-base-100/70 transition-colors border border-base-300/30"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-base-content/60 mb-1">{item.label}</p>
                  <p
                    className={`text-sm font-medium truncate ${
                      item.isVerified
                        ? "text-emerald-500"
                        : item.isVerified === false
                        ? "text-amber-500"
                        : "text-base-content"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
                {item.isVerified && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="flex justify-end">
        <button
          className="btn btn-outline rounded-full btn-sm"
          onClick={() => navigate("/edit-profile")}
        >
          Bilgilerini Düzenle
        </button>
      </div>
    </div>
  );
};

export default AccountInformation;
