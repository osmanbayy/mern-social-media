import Posts from "../components/common/Posts";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";

const BookmarkedPosts = () => {
  const navigate = useNavigate();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  if (!authUser) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="flex-[4_4_0] border-r border-base-300/50 min-h-screen pb-20 lg:pb-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 flex justify-between items-center px-4 py-3 border-b border-base-300 bg-base-100/95 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-base-200 transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <p className="font-bold text-lg">Kaydedilen Gönderiler</p>
          </div>
        </div>
      </div>
      <Posts feedType="saves" userId={authUser._id} />
    </div>
  );
};

export default BookmarkedPosts;
