import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { LuUser, LuAtSign, LuMail, LuBadgeCheck } from "react-icons/lu";
import { useAuth } from "../../contexts/AuthContext";

const AccountInformation = () => {
  const navigate = useNavigate();
  const { authUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
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
      label: "Kullanıcı adı",
      value: `@${authUser?.username || ""}`,
      icon: LuAtSign,
    },
    {
      label: "E-posta",
      value: authUser?.email || "Belirtilmemiş",
      icon: LuMail,
    },
    {
      label: "Hesap durumu",
      value: authUser?.isAccountVerified ? "Doğrulanmış" : "Doğrulanmamış",
      icon: LuBadgeCheck,
      isVerified: authUser?.isAccountVerified,
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-3xl border border-base-300/55 bg-gradient-to-b from-base-100 to-base-200/25 p-6 shadow-xl ring-1 ring-black/5 dark:to-base-300/15 dark:ring-white/5 md:p-8">
        <h3 className="mb-6 text-base font-bold text-base-content">Kayıtlı bilgiler</h3>
        <div className="flex flex-col gap-3">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-4 rounded-2xl border border-base-300/40 bg-base-100/60 p-4 transition hover:border-accent/25 hover:bg-base-100"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-base-content/45">
                    {item.label}
                  </p>
                  <p
                    className={`truncate text-sm font-semibold ${
                      item.isVerified
                        ? "text-success"
                        : item.isVerified === false
                          ? "text-warning"
                          : "text-base-content"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
                {item.isVerified && (
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-outline btn-accent rounded-full px-6 font-semibold shadow-sm"
          onClick={() => navigate("/edit-profile")}
        >
          Bilgilerini düzenle
        </button>
      </div>
    </div>
  );
};

export default AccountInformation;
