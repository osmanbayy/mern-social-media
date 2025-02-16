import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import profileImg from "../../assets/myProfile.jpeg";
import EmojiPicker from "emoji-picker-react";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiClick = (emojiObject) => {
    setText((prevText) => prevText + emojiObject.emoji);
  };

  const imgRef = useRef(null);

  const isPending = false;
  const isError = false;

  const data = {
    profileImg: profileImg,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Post created successfully");
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
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={data.profileImg || "../../assets/avatar-placeholder.png"} />
        </div>
      </div>
      <form className="relative flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
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
          <button className="btn btn-primary rounded-full btn-sm text-white px-4">
            {isPending ? "Paylaşılıyor..." : "Paylaş"}
          </button>
        </div>
        {isError && (
          <div className="text-red-500">Bir şeyler yanlış gitti.</div>
        )}
      </form>
    </div>
  );
};
export default CreatePost;
