import { Navigate, useParams } from "react-router-dom";

export default function RedirectWriteToChat() {
  const { userId } = useParams();
  return <Navigate to={`/messages/chat/new/${userId}`} replace />;
}
