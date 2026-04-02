import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { FiUser, FiLogIn } from "react-icons/fi";
import { GoLock } from "react-icons/go";
import { ImPencil2 } from "react-icons/im";
import OSSvg from "../../../components/svgs/OS";
import { FaUserPlus } from "react-icons/fa6";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { signup } from "../../../api/auth";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import PasswordStrengthIndicator from "../../../components/auth/PasswordStrengthIndicator";
import StatusNotice from "../../../components/common/StatusNotice";

function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullname: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isRequestDelayed, setIsRequestDelayed] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isError, error, isPending } = useMutation({
    mutationFn: ({ email, username, fullname, password }) =>
      signup({ email, username, fullname, password }),
    onSuccess: async () => {
      toast.success("Hesabın oluşturuldu.");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault(); // page won't reload

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Şifreler eşleşmiyor");
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError("Şifre en az 6 karakter olmalıdır");
      return;
    }

    // Remove confirmPassword from data sent to backend
    const { confirmPassword, ...signupData } = formData;
    mutate(signupData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear password error when user starts typing
    if (name === "password" || name === "confirmPassword") {
      if (passwordError) {
        setPasswordError("");
      }
    }
  };

  const [signupErrorAnimate] = useAutoAnimate();
  const isFormInvalid =
    !formData.email.trim() ||
    !formData.username.trim() ||
    !formData.fullname.trim() ||
    !formData.password.trim() ||
    !formData.confirmPassword.trim();

  useEffect(() => {
    if (!isPending) {
      setIsRequestDelayed(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      setIsRequestDelayed(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isPending]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-base-200/35 via-base-100 to-base-100 dark:from-base-300/15">
      <div className="grid min-h-screen w-full lg:grid-cols-2">
        <div className="hidden h-full w-full lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-6 lg:px-10 lg:bg-gradient-to-br lg:from-base-200/45 lg:to-base-100 dark:lg:from-base-300/25 dark:lg:to-base-100">
          <OSSvg className="w-full max-w-md" />
          <div className="max-w-md space-y-2 text-center">
            <h2 className="text-2xl font-bold">Yeni nesil sosyal deneyim</h2>
            <p className="text-base-content/70">
              Dakikalar içinde hesabını oluştur ve topluluğa katıl.
            </p>
          </div>
        </div>
        <div className="flex h-full w-full items-center justify-center px-4 py-8 md:px-8">
          <div className="w-full max-w-md rounded-3xl border border-base-300/50 bg-base-100/95 p-6 shadow-xl ring-1 ring-black/[0.04] backdrop-blur-sm dark:border-base-300/50 dark:ring-white/[0.06] md:p-8">
            <div className="mb-6 flex flex-col items-center gap-3">
              <OSSvg className="h-20 w-20 shrink-0 md:hidden" />
              <h1 className="text-3xl font-extrabold">Hesap oluştur</h1>
              <p className="text-center text-sm text-base-content/70">
                Bilgilerini doldur, hemen başla.
              </p>
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="input input-bordered rounded-xl flex items-center gap-2 w-full focus-within:ring-2 focus-within:ring-accent/30">
                <HiOutlineMail />
                <input
                  type="email"
                  className="grow"
                  placeholder="E-posta"
                  name="email"
                  autoComplete="email"
                  onChange={handleInputChange}
                  value={formData.email}
                  required
                />
              </label>

              <label className="input input-bordered rounded-xl flex items-center gap-2 w-full focus-within:ring-2 focus-within:ring-accent/30">
                <FiUser />
                <input
                  type="text"
                  className="grow "
                  placeholder="Kullanıcı Adı"
                  name="username"
                  autoComplete="username"
                  onChange={handleInputChange}
                  value={formData.username}
                  required
                />
              </label>
              <label className="input input-bordered rounded-xl flex items-center gap-2 w-full focus-within:ring-2 focus-within:ring-accent/30">
                <ImPencil2 />
                <input
                  type="text"
                  className="grow"
                  placeholder="Ad Soyad"
                  name="fullname"
                  autoComplete="name"
                  onChange={handleInputChange}
                  value={formData.fullname}
                  required
                />
              </label>

              <label className="input input-bordered rounded-xl flex items-center gap-2 w-full focus-within:ring-2 focus-within:ring-accent/30">
                <GoLock />
                <input
                  type={showPassword ? "text" : "password"}
                  className="grow"
                  placeholder="Şifre"
                  name="password"
                  autoComplete="new-password"
                  onChange={handleInputChange}
                  value={formData.password}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-ghost btn-sm p-1"
                >
                  {showPassword ? (
                    <LuEye />
                  ) : (
                    <LuEyeClosed />
                  )}
                </button>
              </label>

              <div className="w-full">
                <label className="input input-bordered rounded-xl flex items-center gap-2 w-full focus-within:ring-2 focus-within:ring-accent/30">
                  <GoLock />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="grow"
                    placeholder="Şifreyi tekrar girin"
                    name="confirmPassword"
                    autoComplete="new-password"
                    onChange={handleInputChange}
                    value={formData.confirmPassword}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="btn btn-ghost btn-sm p-1"
                  >
                    {showConfirmPassword ? (
                      <LuEye />
                    ) : (
                      <LuEyeClosed />
                    )}
                  </button>
                </label>

                <div ref={signupErrorAnimate}>
                  <PasswordStrengthIndicator password={formData.password} />
                </div>
              </div>

              <div ref={signupErrorAnimate}>
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
              </div>
              <button
                className="btn btn-accent rounded-xl w-full"
                disabled={isPending || isFormInvalid}
              >
                <FaUserPlus /> {isPending ? "Hesap olusturuluyor..." : "Hesap Olustur"}
              </button>
              {/* Status Notice for request delay */}
              {isRequestDelayed && !isError && (
                <StatusNotice
                  title="Bağlantı gecikmesi algılandı"
                  message="İşlem şu anda normalden uzun sürüyor. Geçici bir servis sorunu olabilir; sorunu çözmeye çalışıyoruz. Lütfen kısa bir süre sonra tekrar deneyin."
                />
              )}
              {/* Error message animation */}
              <div ref={signupErrorAnimate}>
                {isError && <p className="text-red-500 text-sm">{error.message}</p>}
              </div>
            </form>
            <div className="divider my-6">veya</div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-base-content/70">Zaten bir hesabın var mı?</p>
              <Link to="/login">
                <button className="btn btn-outline rounded-xl w-full">
                  <FiLogIn /> Giriş Yap
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
