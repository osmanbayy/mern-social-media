import { useRef, useState } from "react";
import { LuRefreshCw } from "react-icons/lu";
import toast from "react-hot-toast";
import { requestPasswordReset, verifyResetOtp } from "../../api/auth.js";
import AuthCardShell from "./AuthCardShell.jsx";
import SubmitButton from "./SubmitButton.jsx";
import OtpInput from "./OtpInput.jsx";
import { ERROR_MESSAGES, OTP_LENGTH } from "../../constants/resetPassword.js";

const OtpForm = ({ email, onOtpSubmitted, footer }) => {
  const otpInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otpInputRef.current?.getValue() || "";

    if (otpValue.length !== OTP_LENGTH) {
      toast.error(ERROR_MESSAGES.INVALID_OTP_LENGTH);
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await verifyResetOtp(email, otpValue);
      if (data.success) {
        toast.success(data.message);
        onOtpSubmitted(otpValue);
      } else {
        toast.error(data.message || ERROR_MESSAGES.GENERIC_ERROR);
        otpInputRef.current?.clear();
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
      otpInputRef.current?.clear();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      const data = await requestPasswordReset(email);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || ERROR_MESSAGES.EMAIL_SEND_FAILED);
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsResending(false);
    }
  };

  const subtitle = (
    <>
      <span className="font-medium text-accent">{email}</span> adresine {OTP_LENGTH} haneli kod gönderdik.
    </>
  );

  return (
    <AuthCardShell
      title="Doğrulama kodu"
      titleHighlight="kodu"
      subtitle={subtitle}
      footer={footer}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <OtpInput ref={otpInputRef} disabled={isSubmitting} />

        <SubmitButton isLoading={isSubmitting} loadingText="Doğrulanıyor...">
          Doğrula
        </SubmitButton>
      </form>

      <div className="mt-4 text-center">
        <p className="mb-2 text-sm text-base-content/70">Kodu almadın mı?</p>
        <button
          type="button"
          onClick={handleResend}
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
    </AuthCardShell>
  );
};

export default OtpForm;
