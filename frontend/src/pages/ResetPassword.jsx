import { useState } from "react";
import { Link } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";

import AuthFlowLayout from "../components/auth/AuthFlowLayout.jsx";
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

  const cardFooter = (
    <>
      {isEmailSent && (
        <p className="mt-6 text-center text-xs text-base-content/50">
          {!isOtpSubmitted ? HELP_TEXTS.CHECK_SPAM : HELP_TEXTS.SAVE_PASSWORD}
        </p>
      )}
      <div className="divider my-6">veya</div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-base-content/70">Şifreni hatırladın mı?</p>
        <Link to="/login" className="btn btn-outline rounded-xl w-full">
          <FiLogIn /> Giriş sayfasına dön
        </Link>
      </div>
    </>
  );

  return (
    <AuthFlowLayout
      topLeft={<BackButton />}
      leftTitle="Şifreni sıfırla"
      leftDescription="E-postana gelen kodla yeni şifreni güvenle belirle."
    >
      {!isEmailSent && <EmailForm onEmailSent={handleEmailSent} footer={cardFooter} />}
      {!isOtpSubmitted && isEmailSent && (
        <OtpForm email={email} onOtpSubmitted={handleOtpSubmitted} footer={cardFooter} />
      )}
      {isOtpSubmitted && isEmailSent && (
        <NewPasswordForm email={email} otp={otp} footer={cardFooter} />
      )}
    </AuthFlowLayout>
  );
};

export default ResetPassword;
