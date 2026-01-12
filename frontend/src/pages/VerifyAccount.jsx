/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { verifyAccount, sendVerifyOtp } from "../api/auth.js";

const VerifyAccount = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleInput = (e, index) => {
    if (!/^\d*$/.test(e.target.value)) {
      e.target.value = e.target.value.replace(/\D/g, ""); // clear the non-numeric characters
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

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const userId = authUser?._id;
  const sentBefore = localStorage.getItem("otpSent");

  const sendVerificationOtp = async () => {
    try {
      if (!userId) {
        toast.error("Kullanıcı bilgisi bulunamadı.");
        return;
      }

      setIsResending(true);
      const data = await sendVerifyOtp(userId);
      if (data.success) {
        toast.success(data.message);
        setOtpSent(true);
      } else {
        toast.error(data.message || "Doğrulama kodu gönderilemedi.");
      }
    } catch (error) {
      toast.error(error.message || "Bir hata oluştu.");
    } finally {
      setIsResending(false);
    }
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");

      if (!userId) {
        toast.error("Kullanıcı bilgisi bulunamadı.");
        return;
      }

      if (otp.length !== 6) {
        toast.error("Lütfen 6 haneli doğrulama kodunu girin.");
        return;
      }

      setIsSubmitting(true);
      const data = await verifyAccount(userId, otp);
      if (data.success) {
        authUser.isAccountVerified = true;
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message || "Doğrulama başarısız.");
        // Clear inputs on error
        inputRefs.current.forEach((input) => {
          if (input) input.value = "";
        });
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error(error.message || "Bir hata oluştu.");
      // Clear inputs on error
      inputRefs.current.forEach((input) => {
        if (input) input.value = "";
      });
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (authUser && !sentBefore) {
      sendVerificationOtp();
      localStorage.setItem("otpSent", "true");
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
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Merhaba, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{authUser.fullname}</span>!
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            E-posta adresinize <span className="text-blue-400 font-medium">{authUser.email}</span> 6 haneli bir doğrulama kodu gönderdik.
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
              E-postanıza gönderilen 6 haneli kodu giriniz
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-6">
            {/* OTP Inputs */}
            <div onPaste={handlePaste} className="flex justify-center gap-3 sm:gap-4 mb-8">
              {Array(6)
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
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
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
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
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
