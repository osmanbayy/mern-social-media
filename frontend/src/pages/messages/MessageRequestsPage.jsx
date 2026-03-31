import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  getIncomingMessageRequests,
  acceptMessageRequest,
  declineMessageRequest,
} from "../../api/messages";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const MessageRequestsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({
    queryKey: ["messageRequests"],
    queryFn: getIncomingMessageRequests,
  });

  const { mutate: accept, isPending: accepting } = useMutation({
    mutationFn: acceptMessageRequest,
    onSuccess: (data, requestId) => {
      queryClient.setQueryData(["messageRequests"], (old) =>
        Array.isArray(old)
          ? old.filter((r) => String(r._id) !== String(requestId))
          : old
      );
      queryClient.invalidateQueries({ queryKey: ["messageRequests"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("İstek kabul edildi");
      if (data?.conversation?._id) {
        navigate(`/messages/chat/${data.conversation._id}`, { replace: true });
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const { mutate: decline, isPending: declining } = useMutation({
    mutationFn: declineMessageRequest,
    onSuccess: (_data, requestId) => {
      queryClient.setQueryData(["messageRequests"], (old) =>
        Array.isArray(old)
          ? old.filter((r) => String(r._id) !== String(requestId))
          : old
      );
      queryClient.invalidateQueries({ queryKey: ["messageRequests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("İstek reddedildi");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="w-full min-h-screen mb-14 md:mb-0">
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b border-base-300 bg-base-100/95 backdrop-blur-md">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-base-200"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">Mesaj istekleri</h1>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!isLoading && (!requests || requests.length === 0) && (
        <p className="text-center text-base-content/60 py-16 px-4">
          Bekleyen mesaj isteği yok.
        </p>
      )}

      {!isLoading && requests?.length > 0 && (
        <div className="flex flex-col divide-y divide-base-300/40">
          {requests.map((r) => (
            <div key={r._id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Link to={`/profile/${r.from?.username}`} className="avatar shrink-0">
                  <div className="w-12 h-12 rounded-full">
                    <img
                      src={r.from?.profileImage || defaultProfilePicture}
                      alt=""
                      className="object-cover w-full h-full rounded-full"
                    />
                  </div>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/profile/${r.from?.username}`}
                    className="font-semibold hover:underline"
                  >
                    {r.from?.fullname || r.from?.username}
                  </Link>
                  <p className="text-sm text-base-content/80 mt-1 whitespace-pre-wrap break-words">
                    {r.text}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  disabled={declining || accepting}
                  onClick={() => decline(r._id)}
                >
                  Reddet
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  disabled={accepting || declining}
                  onClick={() => accept(r._id)}
                >
                  Kabul et
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageRequestsPage;
