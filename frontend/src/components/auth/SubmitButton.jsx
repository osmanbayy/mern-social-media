import { AiOutlineLoading } from "react-icons/ai";

const SubmitButton = ({ isLoading, loadingText, children, disabled, ...props }) => {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      {...props}
    >
      {isLoading ? (
        <>
          <AiOutlineLoading className="animate-spin h-5 w-5 text-white" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default SubmitButton;
