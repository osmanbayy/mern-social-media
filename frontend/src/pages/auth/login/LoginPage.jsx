import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import OSSvg from "../../../components/svgs/OS";
import { GoLock } from "react-icons/go";
import { FiUser, FiLogIn } from "react-icons/fi";
import { FaUserPlus } from "react-icons/fa6";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import { login } from "../../../api/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const queryClient = useQueryClient();
  const { mutate, isError, error, isPending } = useMutation({
    mutationFn: ({ username, password }) => login(username, password),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
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

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen lg:-mt-20 px-10">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <OSSvg forceDark className="w-full max-w-md" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="w-full lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col items-center"
          onSubmit={handleSubmit}
        >
          <OSSvg forceDark className="w-32 h-32 md:hidden flex-shrink-0" /> 
          <h1 className="login-title text-4xl font-extrabold">OnSekiz</h1>
          <label className="input input-bordered rounded flex items-center gap-2 w-full">
            <FiUser />
            <input
              type="text"
              className="grow"
              placeholder="Kullanıcı Adı"
              name="username"
              autoComplete="off"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

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
          <button className="btn btn-accent rounded-full w-full btn-outline">
            <FiLogIn /> {isPending ? "Yükleniyor..." : "Giriş Yap"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
        <div className="flex justify-end items-end w-full mt-3 lg:w-2/3">
          <p onClick={() => navigate("/reset-password")} className="text-sm cursor-pointer">Şifreni mi unuttun?</p>
        </div>
        <div className="flex flex-col w-full lg:w-2/3 gap-2 mt-4">
          <p className="text-lg">Hesabın yok mu?</p>
          <Link to="/signup">
            <button className="btn btn-primary rounded-full btn-outline w-full">
              <FaUserPlus /> Hesap Oluştur
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
