import { useNavigate } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-base-content/80 transition-colors hover:bg-base-200 hover:text-base-content md:left-8 md:top-8"
    >
      <LuArrowLeft className="h-5 w-5" />
      Geri
    </button>
  );
};

export default BackButton;
