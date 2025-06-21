import Posts from "../components/common/Posts";
import { useQuery } from "@tanstack/react-query";

const BookmarkedPosts = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  if (!authUser) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Kaydedilen Gönderiler</h1>
      </div>
      <Posts feedType="saves" userId={authUser._id} />
    </div>
  );
};

export default BookmarkedPosts;
