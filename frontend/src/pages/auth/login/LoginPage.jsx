import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import OSSvg from "../../../components/svgs/OS";
import { GoLock } from "react-icons/go";
import { FiUser, FiLogIn } from "react-icons/fi";
import { FaUserPlus } from "react-icons/fa6";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import { login } from "../../../api/auth";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import StatusNotice from "../../../components/common/StatusNotice";
import { invalidateAuthUser } from "../../../utils/queryInvalidation";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isRequestDelayed, setIsRequestDelayed] = useState(false);

  const queryClient = useQueryClient();
  const { mutate, isError, error, isPending } = useMutation({
    mutationFn: ({ username, password }) => login(username, password),
    onSuccess: async () => {
      await invalidateAuthUser(queryClient);
      toast.success("Hoşgeldin!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [loginErrorAnimate] = useAutoAnimate();
  const isFormInvalid = !formData.username.trim() || !formData.password.trim();

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
            <h2 className="text-2xl font-bold">Topluluğunla anında bağlan</h2>
            <p className="text-base-content/70">
              OnSekiz ile paylaş, mesajlaş ve güncel kal.
            </p>
          </div>
        </div>
        <div className="flex h-full w-full items-center justify-center px-4 py-8 md:px-8">
          <div className="w-full max-w-md rounded-3xl border border-base-300/50 bg-base-100/95 p-6 shadow-xl ring-1 ring-black/[0.04] backdrop-blur-sm dark:border-base-300/50 dark:ring-white/[0.06] md:p-8">
            <div className="mb-6 flex flex-col items-center gap-3">
              <OSSvg className="h-20 w-20 shrink-0 md:hidden" />
              <h1 className="text-3xl font-extrabold">Tekrar hoş geldin</h1>
              <p className="text-center text-sm text-base-content/70">
                Hesabına giriş yaparak akışını kaldığın yerden devam ettir.
              </p>
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="input input-bordered rounded-xl flex items-center gap-2 w-full focus-within:ring-2 focus-within:ring-accent/30">
                <FiUser />
                <input
                  type="text"
                  className="grow"
                  placeholder="Kullanıcı Adı"
                  name="username"
                  autoComplete="username"
                  onChange={handleInputChange}
                  value={formData.username}
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
                  autoComplete="current-password"
                  onChange={handleInputChange}
                  value={formData.password}
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
              <button
                className="btn btn-accent rounded-xl w-full"
                disabled={isPending || isFormInvalid}
              >
                <FiLogIn /> {isPending ? "Giris yapiliyor..." : "Giris Yap"}
              </button>
              {/* Status Notice for request delay */}
              {isRequestDelayed && !isError && (
                <StatusNotice
                  title="Bağlantı gecikmesi algılandı"
                  message="İşlem şu anda normalden uzun sürüyor. Geçici bir servis sorunu olabilir; sorunu çözmeye çalışıyoruz. Lütfen kısa bir süre sonra tekrar deneyin."
                />
              )}
              {/* Error message animation */}
              <div ref={loginErrorAnimate}>
                {isError && <p className="text-red-500 text-sm">{error.message}</p>}
              </div>
            </form>
            <div className="mt-4 flex justify-end">
              <p
                onClick={() => navigate("/reset-password")}
                className="text-sm cursor-pointer text-base-content/70 hover:text-base-content transition-colors"
              >
                Şifreni mi unuttun?
              </p>
            </div>
            <div className="divider my-6">veya</div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-base-content/70">Hesabın yok mu?</p>
              <Link to="/signup">
                <button className="btn btn-outline rounded-xl w-full">
                  <FaUserPlus /> Hesap Oluştur
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
