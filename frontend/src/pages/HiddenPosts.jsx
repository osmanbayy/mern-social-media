import Posts from "../components/common/Posts";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const HiddenPosts = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  if (!authUser) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen mb-14 md:mb-0">
      <div className="flex items-center gap-4 p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Gizlenenler</h1>
      </div>
      <Posts feedType="hidden" userId={authUser._id} />
    </div>
  );
};

export default HiddenPosts; 