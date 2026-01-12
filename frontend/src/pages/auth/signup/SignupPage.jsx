import { Link } from "react-router-dom";
import { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { FiUser, FiLogIn } from "react-icons/fi";
import { GoLock } from "react-icons/go";
import { ImPencil2 } from "react-icons/im";
import OSSvg from "../../../components/svgs/OS";
import { FaUserPlus } from "react-icons/fa6";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { signup } from "../../../api/auth";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullname: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isError, error, isPending } = useMutation({
    mutationFn: ({ email, username, fullname, password }) => 
      signup({ email, username, fullname, password }),
    onSuccess: async() => {
      toast.success("Hesabın oluşturuldu.");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
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
    <div className="max-w-screen-xl mx-auto flex h-screen px-10 lg:-mt-20">
      <div className="flex-1 hidden md:flex items-center justify-center">
        <OSSvg forceDark className="w-full max-w-md" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col items-center"
          onSubmit={handleSubmit}
        >
          <OSSvg forceDark className="w-32 h-32 md:hidden flex-shrink-0" />
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
                <img src="/src/assets/close-eye.svg" alt="Hide password" className="w-4 h-4" />
              ) : (
                <img src="/src/assets/open-eye.svg" alt="Show password" className="w-4 h-4" />
              )}
            </button>
          </label>
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
