import { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import toast from "react-hot-toast";
import { requestPasswordReset } from "../../api/auth.js";
import AuthCardShell from "./AuthCardShell.jsx";
import SubmitButton from "./SubmitButton.jsx";
import { ERROR_MESSAGES } from "../../constants/resetPassword.js";

const EmailForm = ({ onEmailSent, footer }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error(ERROR_MESSAGES.EMAIL_REQUIRED);
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await requestPasswordReset(email);
      if (data.success) {
        toast.success(data.message);
        onEmailSent(email);
      } else {
        toast.error(data.message || ERROR_MESSAGES.EMAIL_SEND_FAILED);
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCardShell
      title="Şifreni yenile"
      titleHighlight="yenile"
      subtitle="Kayıt olduğun e-posta adresini gir; sıfırlama kodunu oraya göndereceğiz."
      footer={footer}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="input input-bordered flex w-full items-center gap-2 rounded-xl focus-within:ring-2 focus-within:ring-accent/30">
          <HiOutlineMail />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="grow"
            placeholder="ornek@email.com"
            autoComplete="email"
            required
            disabled={isSubmitting}
          />
        </label>

        <SubmitButton isLoading={isSubmitting} loadingText="Gönderiliyor...">
          Kodu gönder
        </SubmitButton>
      </form>
    </AuthCardShell>
  );
};

export default EmailForm;
