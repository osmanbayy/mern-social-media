import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoLock } from "react-icons/go";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import toast from "react-hot-toast";
import { resetPassword } from "../../api/auth.js";
import AuthCardShell from "./AuthCardShell.jsx";
import SubmitButton from "./SubmitButton.jsx";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator.jsx";
import { ERROR_MESSAGES, MIN_PASSWORD_LENGTH, OTP_LENGTH } from "../../constants/resetPassword.js";

const NewPasswordForm = ({ email, otp, footer }) => {
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

  const fieldError = passwordError ? "input-error" : "";

  return (
    <AuthCardShell
      title="Yeni şifre"
      titleHighlight="şifre"
      subtitle={`En az ${MIN_PASSWORD_LENGTH} karakter; güçlü bir şifre seç.`}
      footer={footer}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            className={`input input-bordered flex w-full items-center gap-2 rounded-xl focus-within:ring-2 focus-within:ring-accent/30 ${fieldError}`}
          >
            <GoLock />
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={handlePasswordChange}
              className="grow"
              placeholder="Yeni şifreni gir"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="btn btn-ghost btn-sm p-1"
            >
              {showPassword ? <LuEyeClosed className="h-5 w-5" /> : <LuEye className="h-5 w-5" />}
            </button>
          </label>
          <PasswordStrengthIndicator password={newPassword} />
        </div>

        <div className="space-y-2">
          <label
            className={`input input-bordered flex w-full items-center gap-2 rounded-xl focus-within:ring-2 focus-within:ring-accent/30 ${fieldError}`}
          >
            <GoLock />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="grow"
              placeholder="Şifreyi tekrar gir"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="btn btn-ghost btn-sm p-1"
            >
              {showConfirmPassword ? <LuEyeClosed className="h-5 w-5" /> : <LuEye className="h-5 w-5" />}
            </button>
          </label>
          {passwordError && <p className="text-sm text-error">{passwordError}</p>}
        </div>

        <SubmitButton isLoading={isSubmitting} loadingText="Şifre sıfırlanıyor...">
          Şifreyi sıfırla
        </SubmitButton>
      </form>
    </AuthCardShell>
  );
};

export default NewPasswordForm;
