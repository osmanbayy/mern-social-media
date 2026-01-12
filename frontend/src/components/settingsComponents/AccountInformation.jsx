import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../common/LoadingSpinner";
import EditProfileModal from "../modals/EditProfileModal";

const AccountInformation = () => {
  const { data: authUser, isLoading } = useQuery({ queryKey: ["authUser"] });

  if (isLoading) <LoadingSpinner size="md" />;
  return (
    <div className="min-h-screen w-full flex flex-col gap-2">
      <div className="flex items-center gap-2 border-b pb-5">
        <div className="flex flex-col gap-4">
          <div>
            <span>Ad Soyad:</span>{" "}
            <span className="opacity-65">{authUser.fullname}</span>
          </div>
          <div>
            <span>Kullanıcı Adı:</span>{" "}
            <span className="opacity-65">@{authUser.username}</span>
          </div>
          <div>
            <span>E-Posta:</span>{" "}
            <span className="opacity-65">@{authUser.email}</span>
          </div>
          <div>
            <span>Kullanıcı Adı:</span>{" "}
            <span className="opacity-65">@{authUser.username}</span>
          </div>
          <div>
            <span>Doğrulanmış Hesap:</span>{" "}
            <span className="opacity-65">
              {authUser.isAccountVerified
                ? "Doğrulanmış Profil"
                : "Doğrulanmamış"}
            </span>
          </div>
          <EditProfileModal />
        </div>
      </div>
    </div>
  );
};

export default AccountInformation;
