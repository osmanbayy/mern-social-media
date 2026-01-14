import { useState } from "react";
import BackButton from "../components/auth/BackButton.jsx";
import EmailForm from "../components/auth/EmailForm.jsx";
import OtpForm from "../components/auth/OtpForm.jsx";
import NewPasswordForm from "../components/auth/NewPasswordForm.jsx";
import { HELP_TEXTS } from "../constants/resetPassword.js";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const handleEmailSent = (emailValue) => {
    setEmail(emailValue);
    setIsEmailSent(true);
  };

  const handleOtpSubmitted = (otpValue) => {
    setOtp(otpValue);
    setIsOtpSubmitted(true);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-base-100 overflow-y-auto">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <BackButton />

      <div className="relative z-10 w-full max-w-md">
        {!isEmailSent && <EmailForm onEmailSent={handleEmailSent} />}
        {!isOtpSubmitted && isEmailSent && (
          <OtpForm email={email} onOtpSubmitted={handleOtpSubmitted} />
        )}
        {isOtpSubmitted && isEmailSent && (
          <NewPasswordForm email={email} otp={otp} />
        )}

        {/* Help Text */}
        {isEmailSent && (
          <p className="text-center text-slate-500 text-xs mt-6">
            {!isOtpSubmitted ? HELP_TEXTS.CHECK_SPAM : HELP_TEXTS.SAVE_PASSWORD}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
