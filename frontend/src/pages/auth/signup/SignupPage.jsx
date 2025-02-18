import { Link } from "react-router-dom";
import { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { FiUser, FiLogIn } from "react-icons/fi";
import { GoLock } from "react-icons/go";
import { ImPencil2 } from "react-icons/im";
import OSSvg from "../../../components/svgs/OS";
import { FaUserPlus } from "react-icons/fa6";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = ({ refetchAuth }) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullname: "",
    password: "",
  });

  const { mutate, isError, error, isPending } = useMutation({
    mutationFn: async ({ email, username, fullname, password }) => {
      try {
        const response = await fetch("api/auth/signup", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ email, username, fullname, password }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Hay aksi. Bir şeyler yanlış gitti.");

        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: async() => {
      toast.success("Hesabın oluşturuldu.");
      await refetchAuth();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault(); // page won't reload
    mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden md:flex items-center  justify-center">
        <OSSvg className="lg:w-2/3" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col items-center"
          onSubmit={handleSubmit}
        >
          <OSSvg className="w-32 h-32 md:hidden" />
          <h1 className="signup-title text-4xl font-extrabold">OnSekiz</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
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

          <label className="input input-bordered rounded flex items-center gap-2">
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
          <label className="input input-bordered rounded flex items-center gap-2">
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
          <button className="btn rounded-full btn-outline w-full">
            <FaUserPlus /> {isPending ? "Yükleniyor..." : "Hesap Oluştur"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className=" text-lg">Zaten bir hesabın var mı?</p>
          <Link to="/login">
            <button className="btn rounded-full btn-outline w-full">
              <FiLogIn /> Giriş Yap
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
