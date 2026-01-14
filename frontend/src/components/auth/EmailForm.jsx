import { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import toast from "react-hot-toast";
import { requestPasswordReset } from "../../api/auth.js";
import StepHeader from "./StepHeader.jsx";
import FormCard from "./FormCard.jsx";
import SubmitButton from "./SubmitButton.jsx";
import { ERROR_MESSAGES } from "../../constants/resetPassword.js";

const EmailForm = ({ onEmailSent }) => {
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
    <>
      <StepHeader
        icon={HiOutlineMail}
        title="Şifreni Yenile"
        highlightText="Yenile"
        description="Kayıt olduğun e-posta adresini gir. Şifre sıfırlama kodunu e-postana göndereceğiz."
      />

      <FormCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              E-Posta Adresi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiOutlineMail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border-2 border-slate-600 text-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-slate-500"
                placeholder="ornek@email.com"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <SubmitButton isLoading={isSubmitting} loadingText="Gönderiliyor...">
            Kodu Gönder
          </SubmitButton>
        </form>
      </FormCard>
    </>
  );
};

export default EmailForm;
