import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { FiUser, FiLogIn } from "react-icons/fi";
import { GoLock } from "react-icons/go";
import { ImPencil2 } from "react-icons/im";
import OSSvg from "../../../components/svgs/OS";
import { FaUserPlus } from "react-icons/fa6";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { signup } from "../../../api/auth";
import { LuEye, LuEyeClosed, LuCheck, LuX } from "react-icons/lu";
import { calculatePasswordStrength } from "../../../utils/passwordStrength";

const SignUpPage = () => {
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

  // Password strength checker
  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(formData.password);
  }, [formData.password]);

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

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10 lg:-mt-20">
      <div className="flex-1 hidden md:flex items-center justify-center">
        <OSSvg forceDark className="w-full max-w-md" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="w-full lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col items-center"
          onSubmit={handleSubmit}
        >
          <OSSvg forceDark className="w-32 h-32 md:hidden flex-shrink-0" />
          <h1 className="signup-title text-4xl font-extrabold">OnSekiz</h1>
          <label className="input input-bordered rounded flex items-center gap-2 w-full">
            <HiOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="E-Posta"
              name="email"
              autoComplete="off"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2 w-full">
            <FiUser />
            <input
              type="text"
              className="grow "
              placeholder="Kullanıcı Adı"
              name="username"
              autoComplete="off"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2 w-full">
            <ImPencil2 />
            <input
              type="text"
              className="grow"
              placeholder="Ad Soyad"
              name="fullname"
              autoComplete="off"
              onChange={handleInputChange}
              value={formData.fullname}
            />
          </label>

          <div className="w-full">
            <label className="input input-bordered rounded flex items-center gap-2 w-full">
              <GoLock />
              <input
                type={showPassword ? "text" : "password"}
                className="grow"
                placeholder="Şifre"
                name="password"
                onChange={handleInputChange}
                value={formData.password}
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

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Strength Bar */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-base-content/70">
                      Şifre Güçlülüğü
                    </span>
                    <span
                      className={`text-xs font-semibold transition-colors duration-200 ${passwordStrength.strength === 1
                        ? "text-red-500"
                        : passwordStrength.strength === 2
                          ? "text-yellow-500"
                          : passwordStrength.strength === 3
                            ? "text-blue-500"
                            : "text-green-500"
                        }`}
                    >
                      {passwordStrength.level}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ease-out ${passwordStrength.strength === 1
                        ? "bg-red-500"
                        : passwordStrength.strength === 2
                          ? "bg-yellow-500"
                          : passwordStrength.strength === 3
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                      style={{
                        width: `${(passwordStrength.strength / 4) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div
                    className={`flex items-center gap-2 transition-all duration-200 ${passwordStrength.checks.length
                      ? "text-green-500"
                      : "text-base-content/50"
                      }`}
                  >
                    {passwordStrength.checks.length ? (
                      <LuCheck className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <LuX className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>En az 8 karakter</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 transition-all duration-200 ${passwordStrength.checks.lowercase
                      ? "text-green-500"
                      : "text-base-content/50"
                      }`}
                  >
                    {passwordStrength.checks.lowercase ? (
                      <LuCheck className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <LuX className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>Küçük harf</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 transition-all duration-200 ${passwordStrength.checks.uppercase
                      ? "text-green-500"
                      : "text-base-content/50"
                      }`}
                  >
                    {passwordStrength.checks.uppercase ? (
                      <LuCheck className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <LuX className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>Büyük harf</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 transition-all duration-200 ${passwordStrength.checks.number
                      ? "text-green-500"
                      : "text-base-content/50"
                      }`}
                  >
                    {passwordStrength.checks.number ? (
                      <LuCheck className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <LuX className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>Rakam</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 transition-all duration-200 sm:col-span-2 ${passwordStrength.checks.special
                      ? "text-green-500"
                      : "text-base-content/50"
                      }`}
                  >
                    {passwordStrength.checks.special ? (
                      <LuCheck className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <LuX className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>Özel karakter (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <label className="input input-bordered rounded flex items-center gap-2 w-full">
            <GoLock />
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="grow"
              placeholder="Şifreyi Tekrar Girin"
              name="confirmPassword"
              onChange={handleInputChange}
              value={formData.confirmPassword}
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

          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          <button className="btn btn-accent rounded-full btn-outline w-full">
            <FaUserPlus /> {isPending ? "Yükleniyor..." : "Hesap Oluştur"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
        <div className="flex flex-col w-full lg:w-2/3 gap-2 mt-4">
          <p className=" text-lg">Zaten bir hesabın var mı?</p>
          <Link to="/login">
            <button className="btn btn-primary rounded-full btn-outline w-full">
              <FiLogIn /> Giriş Yap
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
