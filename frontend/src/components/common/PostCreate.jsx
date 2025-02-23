import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { LiaTelegram } from "react-icons/lia";
import EmojiPicker from "emoji-picker-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";

const PostCreate = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const [showPicker, setShowPicker] = useState(false);
  const imgRef = useRef(null);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const handleEmojiClick = (emojiObject) => {
    setText((prevText) => prevText + emojiObject.emoji);
  };

  const navigate = useNavigate();

  const { mutate: createPost,isPending, isError, error } = useMutation({
    mutationFn: async ({ text, img }) => {
      try {
        const response = await fetch("/api/post/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, img }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Hay aksi. Bir şeyler yanlış gitti.");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      setText("");
      setImg(null);
      toast.success("Gönderi paylaşıldı.");
      queryClient.invalidateQueries("posts");
      navigate("/");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost({ text, img });
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={authUser?.profileImage || defaultProfilePicture} />
        </div>
      </div>
      <form
        className="relative flex flex-col gap-2 w-full"
        onSubmit={handleSubmit}
      >
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none outline-none focus:outline-none border-gray-800"
          placeholder="Neler oluyor?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                imgRef.current.value = null;
              }}
            />
            <img
              src={img}
              className="w-full mx-auto h-72 object-cover rounded"
            />
          </div>
        )}

        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className=" w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill
              onClick={() => setShowPicker(!showPicker)}
              className="fill-yellow-200 w-5 h-5 cursor-pointer"
            />
            {showPicker && (
              <div className="absolute top-full right-0 z-10">
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <button className="btn btn-secondary rounded-full btn-sm text-white px-5">
            {isPending ? "Paylaşılıyor..." : "Paylaş"} <LiaTelegram className="w-4 h-4" />
          </button>
        </div>
        {isError && (
          <div className="text-red-500">{error.message}</div>
        )}
      </form>
    </div>
  );
};
export default PostCreate;
