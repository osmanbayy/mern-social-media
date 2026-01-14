import { useNavigate } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="absolute top-6 left-4 sm:top-10 sm:left-10 z-20 flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-800/50 rounded-full"
    >
      <LuArrowLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Geri</span>
    </button>
  );
};

export default BackButton;
