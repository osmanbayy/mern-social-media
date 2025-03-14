import {
  LuBell,
  LuUser,
  LuSquarePlus,
  LuHouse,
  LuLogOut,
  LuBookmark,
} from "react-icons/lu";
import { Link, Navigate } from "react-router-dom";
import OSSvg from "../svgs/OS";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect } from "react";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Hay aksi. Bir şeyler yanlış gitti.");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Çıkış yapıldı.");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      window.location.reload();
    },
    onError: (error) => {
      console.error("Çıkış hatası:", error.message);
      toast.error(error.message || "Çıkış sırasında hata oluştu.");
    },
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  useEffect(() => {
    if (!authUser) {
      <Navigate to={"/login"} />;
    }
  }, [authUser]);

  return (
    <>
      {/* Sidebar - For Tablet and Desktop */}
      <div className="hidden md:flex flex-[2_2_0] max-w-18 md:max-w-52">
        <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-18 md:w-full">
          <Link to="/" className="flex justify-center md:justify-start mb-12">
            <OSSvg
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["posts"],
                })
              }
              className="px-2 w-12 h-12 rounded-full hover:bg-stone-900"
            />
          </Link>

          <div className="items-center flex gap-2 flex-col mb-16">
            <div>
              <Link to={`/profile/${authUser?.username}`}>
                <img
                  src={authUser.profileImage || defaultProfilePicture}
                  alt=""
                  className="object-cover w-32 h-32 rounded-full border-4 border-gray-500"
                />
              </Link>
            </div>
            <div className=" w-full flex flex-col items-center gap-2">
              <p>{authUser?.fullname}</p>
              <p className="whitespace-nowrap">{authUser?.bio}</p>
              <div className="flex gap-2">
                <p className="text-sm">
                  <span className="text-accent">
                    {authUser?.following.length || 0}
                  </span>{" "}
                  Takip
                </p>
                <p className="text-sm">
                  <span className="text-accent">
                    {authUser?.followers.length || 0}
                  </span>{" "}
                  Takipçi
                </p>
              </div>
            </div>
          </div>

          <ul className="flex flex-col gap-3 mt-4">
            <li className="flex justify-center md:justify-start">
              <Link
                to="/"
                className="flex gap-3 items-center hover:text-indigo-300 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
              >
                <LuHouse className="w-7 h-7" />
                <span className="text-lg hidden md:block">Anasayfa</span>
              </Link>
            </li>
            <li className="flex justify-center md:justify-start">
              <Link
                to="/notifications"
                className="flex gap-3 items-center hover:text-indigo-300 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
              >
                <LuBell className="w-7 h-7" />
                <span className="text-lg hidden md:block">Bildirimler</span>
              </Link>
            </li>
            <li className="flex justify-center md:justify-start">
              <Link
                to={`/profile/${authUser?.username}`}
                className="flex gap-3 items-center hover:text-indigo-300 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
              >
                <LuBookmark className="w-7 h-7" />
                <span className="text-lg hidden md:block">Kaydedilenler</span>
              </Link>
            </li>
            <li className="flex justify-center md:justify-start">
              <Link
                to={`/profile/${authUser?.username}`}
                className="flex gap-3 items-center hover:text-indigo-300 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
              >
                <LuUser className="w-7 h-7" />
                <span className="text-lg hidden md:block">Profil</span>
              </Link>
            </li>
          </ul>

          {authUser && (
            <Link
              to={`/profile/${authUser.username}`}
              className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full"
            >
              <div className="avatar hidden md:inline-flex">
                <div className="w-8 rounded-full">
                  <img
                    src={authUser?.profileImage || defaultProfilePicture}
                    className="w-8 rounded-full"
                  />
                </div>
              </div>
              <div className="flex justify-between flex-1 items-center">
                <div className="hidden md:block">
                  <p className="text-accent font-bold text-sm w-20 truncate">
                    {authUser?.fullname}
                  </p>
                  <p className="text-slate-500 text-sm">
                    @{authUser?.username}
                  </p>
                </div>
                <LuLogOut
                  className="w-5 h-5 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Navigation - For Mobile */}
      <div className="md:hidden z-10 fixed bottom-0 left-0 w-full bg-neutral border-t border-gray-600 py-5 rounded-t-2xl shadow-lg flex justify-around items-center">
        <Link to="/" className="flex flex-col items-center">
          <LuHouse className="w-7 h-7" />
        </Link>
        <Link to="/create-post" className="flex flex-col items-center ">
          <LuSquarePlus className="w-7 h-7" />
        </Link>
        <Link to="/notifications" className="flex flex-col items-center ">
          <LuBell className="w-7 h-7" />
        </Link>
        <Link
          to={`/profile/${authUser.username}`}
          className="flex flex-col items-center "
        >
          <LuUser className="w-7 h-7" />
        </Link>
        <Link
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
          className="flex flex-col items-center"
        >
          <LuLogOut className="w-7 h-7" />
        </Link>
      </div>
    </>
  );
};

export default Sidebar;
