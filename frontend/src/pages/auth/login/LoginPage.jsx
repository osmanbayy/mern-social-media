import { useState } from "react";
import { Link } from "react-router-dom";

import OSSvg from "../../../components/svgs/OS";
import { GoLock } from "react-icons/go";
import { FiUser, FiLogIn } from "react-icons/fi";
import { FaUserPlus } from "react-icons/fa6";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const queryClient = useQueryClient();
  const { mutate, isError, error, isPending } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const response = await fetch("api/auth/login", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Hay aksi. Bir şeyler yanlış gitti.");
        }
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: async() => {
      queryClient.invalidateQueries({ queryKey: ["authUser"]});
      toast.success("Hoşgeldin!");
      ;
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
    <div className="max-w-screen-xl mx-auto flex h-screen">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <OSSvg className="lg:w-2/3 " />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="flex gap-4 flex-col items-center"
          onSubmit={handleSubmit}
        >
          <OSSvg className="w-32 h-32 md:hidden" />
          <h1 className="login-title text-4xl font-extrabold">OnSekiz</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
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

          <label className="input input-bordered rounded flex items-center gap-2">
            <GoLock />
            <input
              type="password"
              className="grow"
              placeholder="Şifre"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <button className="btn rounded-full w-full btn-outline">
            <FiLogIn /> {isPending ? "Yükleniyor..." : "Giriş Yap"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-lg">Hesabın yok mu?</p>
          <Link to="/signup">
            <button className="btn rounded-full btn-outline w-full">
              <FaUserPlus /> Hesap Oluştur
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
