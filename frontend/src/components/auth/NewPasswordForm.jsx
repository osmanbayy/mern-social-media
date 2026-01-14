import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoLock } from "react-icons/go";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import toast from "react-hot-toast";
import { resetPassword } from "../../api/auth.js";
import StepHeader from "./StepHeader.jsx";
import FormCard from "./FormCard.jsx";
import SubmitButton from "./SubmitButton.jsx";
import { ERROR_MESSAGES, MIN_PASSWORD_LENGTH, OTP_LENGTH } from "../../constants/resetPassword.js";

const NewPasswordForm = ({ email, otp }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== OTP_LENGTH) {
      toast.error(ERROR_MESSAGES.INVALID_OTP_LENGTH);
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      setPasswordError(ERROR_MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(ERROR_MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await resetPassword(email, otp, newPassword);
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message || ERROR_MESSAGES.RESET_FAILED);
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (passwordError) {
      setPasswordError("");
    }
  };

  return (
    <>
      <StepHeader
        icon={GoLock}
        title="Yeni Şifre"
        highlightText="Şifre"
        description={`Yeni şifrenizi belirleyin. Güvenliğiniz için en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.`}
      />

      <FormCard>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={handlePasswordChange}
                className={`w-full pl-12 pr-12 py-3 bg-slate-700/50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-slate-500 ${
                  passwordError
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
                } text-white`}
                placeholder="Yeni şifrenizi girin"
                required
                minLength={MIN_PASSWORD_LENGTH}
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Yeni Şifreyi Tekrar Girin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <GoLock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full pl-12 pr-12 py-3 bg-slate-700/50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-slate-500 ${
                  passwordError
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
                } text-white`}
                placeholder="Yeni şifrenizi tekrar girin"
                required
                minLength={MIN_PASSWORD_LENGTH}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? (
                  <LuEyeClosed className="h-5 w-5" />
                ) : (
                  <LuEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
          </div>

          <SubmitButton isLoading={isSubmitting} loadingText="Şifre Sıfırlanıyor...">
            Şifreyi Sıfırla
          </SubmitButton>
        </form>
      </FormCard>
    </>
  );
};

export default NewPasswordForm;
