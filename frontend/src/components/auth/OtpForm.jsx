import { useRef, useState } from "react";
import { LuMail, LuRefreshCw } from "react-icons/lu";
import toast from "react-hot-toast";
import { requestPasswordReset, verifyResetOtp } from "../../api/auth.js";
import StepHeader from "./StepHeader.jsx";
import FormCard from "./FormCard.jsx";
import SubmitButton from "./SubmitButton.jsx";
import OtpInput from "./OtpInput.jsx";
import { ERROR_MESSAGES, OTP_LENGTH } from "../../constants/resetPassword.js";

const OtpForm = ({ email, onOtpSubmitted }) => {
  const otpInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const data = await requestPasswordReset(email);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || ERROR_MESSAGES.EMAIL_SEND_FAILED);
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
    }
  };

  return (
    <>
      <StepHeader
        icon={LuMail}
        title="Doğrulama Kodu"
        highlightText="Kodu"
        description={
          <>
            E-posta adresinize <span className="text-blue-400 font-medium">{email}</span> gönderdiğimiz {OTP_LENGTH} haneli doğrulama kodunu girin.
          </>
        }
      />

      <FormCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <OtpInput ref={otpInputRef} disabled={isSubmitting} />

          <SubmitButton isLoading={isSubmitting} loadingText="Doğrulanıyor...">
            Doğrula
          </SubmitButton>
        </form>

        {/* Resend Code */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm mb-2">
            Doğrulama kodu almadınız mı?
          </p>
          <button
            onClick={handleResend}
            className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors duration-200 inline-flex items-center gap-1"
          >
            <LuRefreshCw className="w-4 h-4" />
            <span>Yeniden Gönder</span>
          </button>
        </div>
      </FormCard>
    </>
  );
};

export default OtpForm;
