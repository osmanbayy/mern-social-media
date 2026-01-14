import { useRef, useImperativeHandle, forwardRef } from "react";
import { OTP_LENGTH } from "../../constants/resetPassword.js";
import { isNumeric, removeNonNumeric } from "../../utils/otpHelpers.js";

const OtpInput = forwardRef(({ disabled = false }, ref) => {
  const inputRefs = useRef([]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return inputRefs.current.map((input) => input?.value || "").join("");
    },
    clear: () => {
      inputRefs.current.forEach((input) => {
        if (input) input.value = "";
      });
      inputRefs.current[0]?.focus();
    },
  }));

  const handleInput = (e, index) => {
    if (!isNumeric(e.target.value)) {
      e.target.value = removeNonNumeric(e.target.value);
      return;
    }
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("").slice(0, OTP_LENGTH);
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index] && isNumeric(char)) {
        inputRefs.current[index].value = char;
      }
    });
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = pasteArray.length < OTP_LENGTH ? pasteArray.length : OTP_LENGTH - 1;
    if (inputRefs.current[nextEmptyIndex]) {
      inputRefs.current[nextEmptyIndex].focus();
    }
  };

  const handleKeyDownForm = (e) => {
    // Prevent form submission on Enter key
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div onPaste={handlePaste} className="flex justify-center gap-3 sm:gap-4 mb-8">
      {Array(OTP_LENGTH)
        .fill(0)
        .map((_, index) => (
          <input
            type="text"
            maxLength="1"
            key={index}
            pattern="[0-9]*"
            inputMode="numeric"
            required
            disabled={disabled}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-700/50 border-2 border-slate-600 text-white text-center text-2xl font-bold rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            ref={(e) => (inputRefs.current[index] = e)}
            onInput={(e) => handleInput(e, index)}
            onKeyDown={(e) => {
              handleKeyDown(e, index);
              handleKeyDownForm(e);
            }}
          />
        ))}
    </div>
  );
});

OtpInput.displayName = "OtpInput";

export default OtpInput;
