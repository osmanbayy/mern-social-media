import { AiOutlineLoading } from "react-icons/ai";

const SubmitButton = ({ isLoading, loadingText, children, disabled, ...props }) => {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className="btn btn-accent w-full gap-2 rounded-xl"
      {...props}
    >
      {isLoading ? (
        <>
          <AiOutlineLoading className="h-5 w-5 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default SubmitButton;
