import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft } from "react-icons/fa6";
import { LuUser, LuMail, LuLink, LuFileText, LuLock, LuEye, LuEyeOff } from "react-icons/lu";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { updateProfile, isUpdatingProfile } = useUpdateProfile();

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullname: authUser.fullname || "",
        username: authUser.username || "",
        email: authUser.email || "",
        bio: authUser.bio || "",
        link: authUser.link || "",
        newPassword: "",
        currentPassword: "",
      });
    }
  }, [authUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Ad Soyad gereklidir";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Kullanıcı adı gereklidir";
    } else if (formData.username.length < 3) {
      newErrors.username = "Kullanıcı adı en az 3 karakter olmalıdır";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-posta gereklidir";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin";
    }

    // Password validation
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Yeni şifre için mevcut şifrenizi girin";
      }
      if (!formData.newPassword) {
        newErrors.newPassword = "Yeni şifre girin";
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Şifre en az 6 karakter olmalıdır";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Lütfen formu kontrol edin");
      return;
    }

    try {
      await updateProfile(formData);
      navigate(`/profile/${formData.username}`);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (!authUser) {
    return (
      <div className="flex-[4_4_0] flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-[4_4_0] border-r border-base-300/50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-4 px-4 py-3 border-b border-base-300/50 bg-base-100/95 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-base-200 transition-colors"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight">Profili Düzenle</span>
          <span className="text-xs text-base-content/60">Bilgilerini güncelle</span>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fullname */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-base-content/80">
              <LuUser className="w-4 h-4" />
              Ad Soyad
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              className={`w-full input input-bordered rounded-xl transition-all duration-200 ${
                errors.fullname ? "input-error border-error" : "focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
              placeholder="Adınız ve soyadınız"
            />
            {errors.fullname && (
              <p className="text-xs text-error flex items-center gap-1">{errors.fullname}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-base-content/80">
              <LuUser className="w-4 h-4" />
              Kullanıcı Adı
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full input input-bordered rounded-xl transition-all duration-200 ${
                errors.username ? "input-error border-error" : "focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
              placeholder="@kullaniciadi"
            />
            {errors.username && (
              <p className="text-xs text-error flex items-center gap-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-base-content/80">
              <LuMail className="w-4 h-4" />
              E-posta
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full input input-bordered rounded-xl transition-all duration-200 ${
                errors.email ? "input-error border-error" : "focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
              placeholder="ornek@email.com"
            />
            {errors.email && (
              <p className="text-xs text-error flex items-center gap-1">{errors.email}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-base-content/80">
              <LuFileText className="w-4 h-4" />
              Biyografi
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              maxLength={160}
              rows={4}
              className="w-full textarea textarea-bordered rounded-xl resize-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Kendinizden bahsedin..."
            />
            <p className={`text-xs ${formData.bio.length >= 150 ? "text-warning" : "text-base-content/50"}`}>
              {formData.bio.length}/160 karakter
            </p>
          </div>

          {/* Link */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-base-content/80">
              <LuLink className="w-4 h-4" />
              Web Sitesi
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              className="w-full input input-bordered rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="https://example.com"
            />
          </div>

          {/* Password Section */}
          <div className="border-t border-base-300/50 pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <LuLock className="w-5 h-5 text-base-content/60" />
              <h3 className="font-semibold text-base">Şifre Değiştir</h3>
            </div>
            <p className="text-sm text-base-content/60">
              Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın.
            </p>

            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-base-content/70">
                Mevcut Şifre
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`w-full input input-bordered rounded-xl transition-all duration-200 pr-10 ${
                    errors.currentPassword ? "input-error border-error" : "focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  placeholder="Mevcut şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                >
                  {showCurrentPassword ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-error flex items-center gap-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-base-content/70">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full input input-bordered rounded-xl transition-all duration-200 pr-10 ${
                    errors.newPassword ? "input-error border-error" : "focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  placeholder="Yeni şifrenizi girin (min. 6 karakter)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                >
                  {showNewPassword ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-error flex items-center gap-1">{errors.newPassword}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-base-300/50">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline rounded-full flex-1"
              disabled={isUpdatingProfile}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-full flex-1 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Güncelleniyor...</span>
                </>
              ) : (
                "Değişiklikleri Kaydet"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
