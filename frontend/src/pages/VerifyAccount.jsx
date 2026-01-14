/* eslint-disable react-hooks/exhaustive-deps */
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LuMail, LuRefreshCw } from "react-icons/lu";
import { AiOutlineLoading } from "react-icons/ai";
import { verifyAccount, sendVerifyOtp } from "../api/auth.js";
import {
  OTP_LENGTH,
  STORAGE_KEYS,
  ROUTES,
  ERROR_MESSAGES,
} from "../constants/verification.js";
import {
  clearOtpInputs,
  getOtpFromInputs,
  isNumeric,
  removeNonNumeric,
  isValidOtpLength,
} from "../utils/otpHelpers.js";

const VerifyAccount = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const userId = authUser?._id;
  const sentBefore = localStorage.getItem(STORAGE_KEYS.OTP_SENT);

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
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const validateUserId = () => {
    if (!userId) {
      toast.error(ERROR_MESSAGES.USER_NOT_FOUND);
      return false;
    }
    return true;
  };

  const sendVerificationOtp = async () => {
    if (!validateUserId()) return;

    try {
      setIsResending(true);
      const data = await sendVerifyOtp(userId);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || ERROR_MESSAGES.OTP_SEND_FAILED);
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerificationError = () => {
    clearOtpInputs(inputRefs);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateUserId()) return;

    const otp = getOtpFromInputs(inputRefs);
    if (!isValidOtpLength(otp)) {
      toast.error(ERROR_MESSAGES.INVALID_OTP_LENGTH);
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await verifyAccount(userId, otp);
      if (data.success) {
        // Update authUser in query cache instead of direct mutation
        queryClient.setQueryData(["authUser"], (oldData) => ({
          ...oldData,
          isAccountVerified: true,
        }));
        toast.success(data.message);
        navigate(ROUTES.HOME);
      } else {
        toast.error(data.message || ERROR_MESSAGES.VERIFICATION_FAILED);
        handleVerificationError();
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
      handleVerificationError();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (authUser && !sentBefore) {
      sendVerificationOtp();
      localStorage.setItem(STORAGE_KEYS.OTP_SENT, "true");
    }
  }, [authUser]);

  if (!authUser) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/25">
            <LuMail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Merhaba, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{authUser.fullname}</span>!
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            E-posta adresinize <span className="text-blue-400 font-medium">{authUser.email}</span> {OTP_LENGTH} haneli bir doğrulama kodu gönderdik.
            <br />
            OnSekiz&apos;e devam edebilmek için hesabınızı doğrulamanız gerekiyor.
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Hesabınızı Doğrulayın
            </h2>
            <p className="text-slate-400 text-sm">
              E-postanıza gönderilen {OTP_LENGTH} haneli kodu giriniz
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-6">
            {/* OTP Inputs */}
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
                    disabled={isSubmitting}
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-700/50 border-2 border-slate-600 text-white text-center text-2xl font-bold rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    ref={(e) => (inputRefs.current[index] = e)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <AiOutlineLoading className="animate-spin h-5 w-5 text-white" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <span>Hesabını Doğrula</span>
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm mb-2">
              Doğrulama kodu almadınız mı?
            </p>
            <button
              onClick={sendVerificationOtp}
              disabled={isResending}
              className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              {isResending ? (
                <>
                  <AiOutlineLoading className="animate-spin h-4 w-4" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <LuRefreshCw className="w-4 h-4" />
                  <span>Yeniden Gönder</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Kodunuzu bulamıyorsanız spam klasörünüzü kontrol edin
        </p>
      </div>
    </div>
  );
};

export default VerifyAccount;
