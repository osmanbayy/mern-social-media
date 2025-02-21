import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { POSTS } from "../../utils/db/dummy";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [feedType, setFeedType] = useState("posts");

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { username } = useParams();

  const { follow, isPending } = useFollow();

  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/user/profile/${username}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Bir hata oluştu.");
        }
        return data;
      } catch (error) {
        throw new Error(error.message || "Bir hata oluştu.");
      }
    },
  });

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/user/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coverImg,
            profileImage,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Bir hata oluştu.");
        }
        return data;
      } catch (error) {
        throw new Error(error.message || "Bir hata oluştu.");
      }
    },
    onSuccess: () => {
      toast.success("Profil güncellendi.");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["user"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isMyProfile = authUser._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  let amIFollowing = authUser?.following.includes(user?._id);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImage" && setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageClick = (e) => {
    e.stopPropagation();
    document.getElementById("profile_image_modal" + user._id).showModal();
  };

  const handleCoverImageClick = (e) => {
    e.stopPropagation();
    document.getElementById("cover_image_modal" + user._id).showModal();
  };

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  return (
    <>
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen ">
        {/* HEADER */}
        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
        {!isLoading && !isRefetching && !user && (
          <p className="text-center text-lg mt-4">Kullanıcı bulunamadı.</p>
        )}
        <div className="flex flex-col">
          {!isLoading && !isRefetching && user && (
            <>
              <div className="flex gap-10 px-4 py-2 items-center">
                <Link to="/">
                  <FaArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{user?.fullname}</p>
                  <span className="text-sm text-slate-500">
                    {POSTS?.length} gönderi
                  </span>
                </div>
              </div>
              {/* COVER IMG */}
              <div className="relative group/cover">
                <img
                  src={coverImg || user?.coverImg}
                  className="h-52 w-full object-cover"
                  alt="cover image"
                  onClick={handleCoverImageClick}
                />
                {isMyProfile && (
                  <div
                    className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                    onClick={() => coverImgRef.current.click()}
                  >
                    <MdEdit className="w-5 h-5 text-white" />
                  </div>
                )}

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />
                {/* USER AVATAR */}
                <div className="avatar absolute -bottom-16 left-4">
                  <div className="w-32 rounded-full relative group/avatar border-4">
                    <img src={profileImage || user?.profileImage} onClick={handleProfileImageClick} />
                    <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                      {isMyProfile && (
                        <MdEdit
                          className="w-4 h-4 text-white"
                          onClick={() => profileImgRef.current.click()}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end px-4 mt-5">
                {isMyProfile && <EditProfileModal authUser={authUser} />}
                {!isMyProfile && (
                  <button
                    className="btn btn-outline rounded-full btn-sm"
                    onClick={() => follow(user?._id)}
                  >
                    {isPending && <LoadingSpinner size="sm" />}
                    {!isPending && amIFollowing && "Takibi Bırak"}
                    {!isPending && !amIFollowing && "Takip Et"}
                  </button>
                )}
                {(coverImg || profileImage) && (
                  <button
                    className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
                    onClick={() => updateProfile()}
                  >
                    {isUpdatingProfile ? "Güncelleniyor..." : "Güncelle"}
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4 mt-14 px-4">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{user?.fullname}</span>
                  <span className="text-sm text-slate-500">
                    @{user?.username}
                  </span>
                  <span className="text-sm my-1">{user?.bio}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {user?.link && (
                    <div className="flex gap-1 items-center ">
                      <>
                        <FaLink className="w-3 h-3 text-slate-500" />
                        <a
                          href={user?.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          {user?.link}
                        </a>
                      </>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <IoCalendarOutline className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">
                      {memberSinceDate}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-xs">
                      {user?.following.length}
                    </span>
                    <span className="text-slate-500 text-xs">Takip</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-xs">
                      {user?.followers.length}
                    </span>
                    <span className="text-slate-500 text-xs">Takipçi</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full border-b border-gray-700 mt-4">
                <div
                  className="flex justify-center flex-1 p-3 transition duration-300 relative cursor-pointer"
                  onClick={() => setFeedType("posts")}
                >
                  Gönderiler
                  {feedType === "posts" && (
                    <div className="absolute bottom-0 bg-indigo-500 w-10 h-1 rounded-full" />
                  )}
                </div>
                <div
                  className="flex justify-center flex-1 p-3 transition duration-300 relative cursor-pointer"
                  onClick={() => setFeedType("likes")}
                >
                  Beğeniler
                  {feedType === "likes" && (
                    <div className="absolute bg-indigo-500 bottom-0 w-10 h-1 rounded-full" />
                  )}
                </div>
              </div>
            </>
          )}

          <Posts feedType={feedType} username={username} userId={user?._id} />
        </div>
      </div>

      {/* Profile Image Modal */}
      <dialog
        id={`profile_image_modal${user?._id}`}
        className="modal border-none outline-none"
      >
        <div className="modal-box p-0 max-w-screen-sm">
          <img src={user?.profileImage} className="w-full object-contain" alt="" />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>

      {/* Cover Image Modal */}
      <dialog
        id={`cover_image_modal${user?._id}`}
        className="modal border-none outline-none"
      >
        <div className="modal-box p-0 max-w-screen-sm">
          <img src={user?.coverImg} className="w-full object-contain" alt="" />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};
export default ProfilePage;
