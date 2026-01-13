import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlineMail } from "react-icons/hi";
import { GoLock } from "react-icons/go";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import { requestPasswordReset, resetPassword } from "../api/auth.js";

const ResetPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const inputRefs = useRef([]);

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

  const onSubmitEmail = async (event) => {
    event.preventDefault();
    try {
      if (!email) {
        toast.error("Lütfen e-posta adresinizi girin.");
        return;
      }
      setIsSubmitting(true);
      const data = await requestPasswordReset(email);
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message || "E-posta gönderilemedi.");
      }
    } catch (error) {
      toast.error(error.message || "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitOTP = async (event) => {
    event.preventDefault();
    const otpArray = inputRefs.current.map((e) => e.value);
    const otpValue = otpArray.join("");
    
    if (otpValue.length !== 6) {
      toast.error("Lütfen 6 haneli doğrulama kodunu girin.");
      return;
    }
    
    setOtp(otpValue);
    setIsOtpSubmitted(true);
  };

  const onSubmitNewPassword = async (event) => {
    event.preventDefault();
    try {
      if (!otp || otp.length !== 6) {
        toast.error("Lütfen 6 haneli doğrulama kodunu girin.");
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        toast.error("Şifre en az 6 karakter olmalıdır.");
        return;
      }
      
      setIsSubmitting(true);
      const data = await resetPassword(email, otp, newPassword);
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message || "Şifre sıfırlama başarısız.");
        // Clear inputs on error
        inputRefs.current.forEach((input) => {
          if (input) input.value = "";
        });
        setOtp("");
        setIsOtpSubmitted(false);
      }
    } catch (error) {
      toast.error(error.message || "Bir hata oluştu.");
      // Clear inputs on error
      inputRefs.current.forEach((input) => {
        if (input) input.value = "";
      });
      setOtp("");
      setIsOtpSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-4 sm:top-10 sm:left-10 z-20 flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-800/50 rounded-full"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span className="text-sm font-medium">Geri</span>
      </button>

      <div className="relative z-10 w-full max-w-md">
        {/* Step 1: Email Form */}
        {!isEmailSent && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/25">
                <HiOutlineMail className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Şifreni <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Yenile</span>
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">
                Kayıt olduğun e-posta adresini gir. Şifre sıfırlama kodunu e-postana göndereceğiz.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-10">
              <form onSubmit={onSubmitEmail} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    E-Posta Adresi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HiOutlineMail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border-2 border-slate-600 text-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-slate-500"
                      placeholder="ornek@email.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

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
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <span>Kodu Gönder</span>
                  )}
                </button>
              </form>
            </div>
          </>
        )}

        {/* Step 2: OTP Form */}
        {!isOtpSubmitted && isEmailSent && (
          <>
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
                Doğrulama <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Kodu</span>
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">
                E-posta adresinize <span className="text-blue-400 font-medium">{email}</span> gönderdiğimiz 6 haneli doğrulama kodunu girin.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-10">
              <form onSubmit={onSubmitOTP} className="space-y-6">
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
                        className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-700/50 border-2 border-slate-600 text-white text-center text-2xl font-bold rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-500"
                        ref={(e) => (inputRefs.current[index] = e)}
                        onInput={(e) => handleInput(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Doğrula
                </button>
              </form>

              {/* Resend Code */}
              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm mb-2">
                  Doğrulama kodu almadınız mı?
                </p>
                <button
                  onClick={async () => {
                    try {
                      const data = await requestPasswordReset(email);
                      if (data.success) {
                        toast.success(data.message);
                      } else {
                        toast.error(data.message || "E-posta gönderilemedi.");
                      }
                    } catch (error) {
                      toast.error(error.message || "Bir hata oluştu.");
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors duration-200 inline-flex items-center gap-1"
                >
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
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: New Password Form */}
        {isOtpSubmitted && isEmailSent && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/25">
                <GoLock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Yeni <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Şifre</span>
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">
                Yeni şifrenizi belirleyin. Güvenliğiniz için en az 6 karakter olmalıdır.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-10">
              <form onSubmit={onSubmitNewPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <GoLock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border-2 border-slate-600 text-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-slate-500"
                      placeholder="Yeni şifrenizi girin"
                      required
                      minLength={6}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? (
                        <LuEyeClosed className="h-5 w-5" />
                      ) : (
                        <LuEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

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
                      <span>Şifre Sıfırlanıyor...</span>
                    </>
                  ) : (
                    <span>Şifreyi Sıfırla</span>
                  )}
                </button>
              </form>
            </div>
          </>
        )}

        {/* Help Text */}
        {isEmailSent && (
          <p className="text-center text-slate-500 text-xs mt-6">
            {!isOtpSubmitted
              ? "Kodunuzu bulamıyorsanız spam klasörünüzü kontrol edin"
              : "Şifrenizi güvenli bir yerde saklayın"}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
