/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const VerifyAccount = () => {
  const [otpSent, setOtpSent] = useState(false);
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
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (data.error) return null;
        if (!response.ok) {
          throw new Error(data.message || "Hay aksi. Bir şeyler yanlış gitti.");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  const userId = authUser?._id;

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        `http://localhost:5000/api/auth/send-verify-otp`,
        {
          userId,
        }
      );
      if (data.success) {
        toast.success(data.message);
        setOtpSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sentBefore = localStorage.getItem("otpSent");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");

      const { data } = await axios.post(
        `http://localhost:5000/api/auth/verify-account`,
        { userId, otp }
      );
      if (data.success) {
        authUser.isAccountVerified = true;
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (authUser && !sentBefore) {
      sendVerificationOtp();
      localStorage.setItem("otpSent", "true");
    }
  }, [authUser]);
  return (
    <div className="w-full flex flex-col items-center justify-center gap-10 min-h-screen px-6 sm:px-0 bg-gradient-to-br from-zinc-700 to-slate-700">
      <div className="text-white flex flex-col items-center justify-center">
        <p className="text-white">
          Merhaba{" "}
          <span className="text-lg italic font-semibold">
            {authUser.fullname}
          </span>
          !
        </p>
        <p className="text-center">
          Mail adresine 6 haneli bir kod gönderdik. OnSekiz&apos;e devam
          edebilmek için hesabını doğrulaman gerekiyor.{" "}
        </p>
      </div>

      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 mt-20 p-8 rounded-lg shadow-lg text-sm w-96"
      >
        <h1 className="text-white text-2xl text-center font-semibold mb-4">
          Hesabınızı Doğrulayın.
        </h1>
        <p className="text-indigo-300 mb-6 text-center">
          E-Postanıza gönderilen 6 haneli kodu giriniz.
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
        <button
          type="submit"
          className="w-full cursor-pointer py-2.5 bg-gradient-to-br transition duration-300 from-slate-500 to-slate-600 hover:from-slate-300 hover:to-slate-500 text-white rounded-full"
        >
          Hesabını Doğrula
        </button>
      </form>

      <p>
        Doğrulama kodu almadın mı?{" "}
        <span
          onClick={sendVerificationOtp}
          className="underline cursor-pointer"
        >
          Yeniden gönder
        </span>{" "}
      </p>
    </div>
  );
};

export default VerifyAccount;
