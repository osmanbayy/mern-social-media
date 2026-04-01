import toast from "react-hot-toast";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LuBadgeCheck, LuRefreshCw } from "react-icons/lu";

import AuthFlowLayout from "../components/auth/AuthFlowLayout.jsx";
import AuthCardShell from "../components/auth/AuthCardShell.jsx";
import OtpInput from "../components/auth/OtpInput.jsx";
import SubmitButton from "../components/auth/SubmitButton.jsx";
import { verifyAccount, sendVerifyOtp } from "../api/auth.js";
import { OTP_LENGTH, ROUTES, ERROR_MESSAGES } from "../constants/verification.js";
import { isValidOtpLength } from "../utils/otpHelpers.js";

const VerifyAccount = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpInputRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const userId = authUser?._id;

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

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateUserId()) return;

    const otp = otpInputRef.current?.getValue() || "";
    if (!isValidOtpLength(otp)) {
      toast.error(ERROR_MESSAGES.INVALID_OTP_LENGTH);
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await verifyAccount(userId, otp);
      if (data.success) {
        queryClient.setQueryData(["authUser"], (oldData) => ({
          ...oldData,
          isAccountVerified: true,
        }));
        toast.success(data.message);
        navigate(ROUTES.HOME);
      } else {
        toast.error(data.message || ERROR_MESSAGES.VERIFICATION_FAILED);
        otpInputRef.current?.clear();
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
      otpInputRef.current?.clear();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authUser) {
    return null;
  }

  const subtitle = (
    <>
      Merhaba <span className="font-semibold text-base-content">{authUser.fullname}</span>,{" "}
      <span className="font-medium text-accent">{authUser.email}</span> adresine {OTP_LENGTH} haneli kod gönderdik.
      Akışa devam etmek için kodu aşağıya gir.
    </>
  );

  return (
    <AuthFlowLayout
      leftTitle="Son bir adım"
      leftDescription="Gelen kutuna gönderdiğimiz kodla hesabını doğrula; hemen paylaşmaya başla."
    >
      <AuthCardShell title="E-postanı doğrula" titleHighlight="doğrula" subtitle={subtitle}>
        <form className="flex flex-col gap-4" onSubmit={onSubmitHandler}>
          <OtpInput ref={otpInputRef} disabled={isSubmitting} />

          <SubmitButton isLoading={isSubmitting} loadingText="Doğrulanıyor...">
            <LuBadgeCheck className="h-5 w-5" />
            Hesabını doğrula
          </SubmitButton>
        </form>

        <div className="mt-4 text-center">
          <p className="mb-2 text-sm text-base-content/70">Kodu almadın mı?</p>
          <button
            type="button"
            onClick={sendVerificationOtp}
            disabled={isResending}
            className="btn btn-ghost btn-sm gap-1 text-accent"
          >
            {isResending ? (
              <>
                <LuRefreshCw className="h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <LuRefreshCw className="h-4 w-4" />
                Yeniden gönder
              </>
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-base-content/50">
          Kodu göremiyorsan spam klasörüne bak.
        </p>
      </AuthCardShell>
    </AuthFlowLayout>
  );
};

export default VerifyAccount;
