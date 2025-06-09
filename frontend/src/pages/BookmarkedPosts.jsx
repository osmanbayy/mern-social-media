import { useParams } from "react-router-dom";
import Posts from "../components/common/Posts";
import { useQuery } from "@tanstack/react-query";
import { LuSettings } from "react-icons/lu";

const BookmarkedPosts = () => {
  const { username } = useParams();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Hay aksi. Bir şeyler yanlış gitti.");
      }
      return data;
    },

    retry: false,
  });
  console.log(authUser);
  return (
   
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen mb-14 md:mb-0">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 w-full">
          <p className="font-bold">Kaydedilenler</p>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="m-1">
              <LuSettings className="size-5 cursor-pointer" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-300 rounded-box w-52 absolute top-5 right-1"
            >
              <li>
                <a onClick={() =>  {}}>Tüm kaydedilenleri sil</a>
              </li>
            </ul>
          </div>
        </div>
        <Posts feedType={"saves"} username={username} userId={authUser._id} />
      </div>
    
  );
};

export default BookmarkedPosts;
