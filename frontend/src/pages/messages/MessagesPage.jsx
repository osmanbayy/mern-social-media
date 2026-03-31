import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getConversations, getIncomingMessageRequests } from "../../api/messages";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const MessagesPage = () => {
  const navigate = useNavigate();
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });
  const { data: requests } = useQuery({
    queryKey: ["messageRequests"],
    queryFn: getIncomingMessageRequests,
  });

  return (
    <div className="w-full min-h-screen mb-14 md:mb-0">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b border-base-300 bg-base-100/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-base-200 md:hidden"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Mesajlar</h1>
        </div>
        <Link
          to="/messages/requests"
          className="btn btn-sm btn-ghost rounded-full"
        >
          İstekler
          {requests?.length > 0 && (
            <span className="badge badge-primary badge-sm ml-1">{requests.length}</span>
          )}
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!isLoading && (!conversations || conversations.length === 0) && (
        <div className="px-4 py-16 text-center text-base-content/60">
          <p>Henüz sohbet yok.</p>
          <p className="text-sm mt-2">Bir profilden mesaj göndererek başlayın.</p>
        </div>
      )}

      {!isLoading && conversations?.length > 0 && (
        <div className="flex flex-col">
          {conversations.map((c) => (
            <Link
              key={c._id}
              to={`/messages/chat/${c._id}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-base-300/40 hover:bg-base-200/40 transition-colors"
            >
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  <img
                    src={c.otherUser?.profileImage || defaultProfilePicture}
                    alt=""
                    className="object-cover w-full h-full rounded-full"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold truncate">
                  {c.otherUser?.fullname || c.otherUser?.username}
                </p>
                <p className="text-sm text-base-content/60 truncate">
                  {c.lastMessagePreview || " "}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
