import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mail_icon from "../assets/mail_icon.svg";
import lock_icon from "../assets/lock_icon.svg";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import { requestPasswordReset, resetPassword } from "../api/auth.js";

const ResetPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(0);
  const [newPassword, setNewPassword] = useState("");
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
      const data = await requestPasswordReset(email);
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message || "E-posta gönderilemedi.");
      }
    } catch (error) {
      toast.error(error.message || "Bir hata oluştu.");
    }
  };

  const onSubmitOTP = async (event) => {
    event.preventDefault();
    const otpArray = inputRefs.current.map((e) => e.value);
    setOtp(otpArray.join(""));
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
      
      const data = await resetPassword(email, otp, newPassword);
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message || "Şifre sıfırlama başarısız.");
      }
    } catch (error) {
      toast.error(error.message || "Bir hata oluştu.");
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-zinc-700 to-slate-900">
      <div
        onClick={() => navigate(-1)}
        className="absolute top-10 left-10 flex items-center gap-3 text-lg cursor-pointer p-2 hover:bg-base-200 rounded-full"
      >
        <FaArrowLeft className="size-6" /> Geri
      </div>
      {/* email form */}

      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl text-center font-semibold mb-4">
            Şifreni Yenile
          </h1>
          <p className="text-indigo-300 mb-6 text-center">
            Kayıt olduğun mail hesabını gir.
          </p>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333a5c] select-none">
            <img src={mail_icon} alt="" className="w-4 h-4" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="bg-transparent border-0 outline-none w-full text-white"
              placeholder="Email"
            />
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r cursor-pointer from-slate-500 to-slate-600 hover:from-slate-300 hover:to-slate-500 text-white rounded-full mt-3">
            Gönder
          </button>
        </form>
      )}

      {!isOtpSubmitted && isEmailSent && (
        <form
          onSubmit={onSubmitOTP}
          className="bg-slate-900 p-8 rounded-lg shadow-lg text-sm w-96"
        >
          <h1 className="text-white text-2xl text-center font-semibold mb-4">
            Şifreni Yenile
          </h1>
          <p className="text-indigo-300 mb-6 text-center">
            E-Postana gönderdiğimiz 6 haneli kodu gir.
          </p>
          <div onPaste={handlePaste} className="flex justify-between mb-8">
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
                  className="w-12 h-12 bg-[#333a5c] text-white text-center text-xl rounded-md"
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <button className="w-full py-3 bg-gradient-to-br from-slate-500 to-slate-600 hover:from-slate-300 hover:to-slate-500 text-white rounded-full">
            Gönder
          </button>
        </form>
      )}

      {/* enter new password form */}
      {isOtpSubmitted && isEmailSent && (
        <form
          onSubmit={onSubmitNewPassword}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl text-center font-semibold mb-4">
            Yeni Şifre
          </h1>
          <p className="text-indigo-300 mb-6 text-center">
            Yeni şifrenizi girin.
          </p>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333a5c]">
            <img src={lock_icon} alt="" className="w-4 h-4" />
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              className="bg-transparent outline-none w-full text-white"
              placeholder="Password"
            />
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-300 hover:to-slate-500 text-white rounded-full mt-3">
            Gönder
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
