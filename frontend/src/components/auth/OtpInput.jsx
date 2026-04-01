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

    const nextEmptyIndex =
      pasteArray.length < OTP_LENGTH ? pasteArray.length : OTP_LENGTH - 1;
    if (inputRefs.current[nextEmptyIndex]) {
      inputRefs.current[nextEmptyIndex].focus();
    }
  };

  const handleKeyDownForm = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const cellClass =
    "input input-bordered flex h-14 w-11 shrink-0 items-center justify-center rounded-xl border-base-300 bg-base-100 p-0 text-center text-xl font-bold tabular-nums focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 sm:h-16 sm:w-12 sm:text-2xl disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div onPaste={handlePaste} className="flex flex-wrap justify-center gap-2 sm:gap-3">
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
            className={cellClass}
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
