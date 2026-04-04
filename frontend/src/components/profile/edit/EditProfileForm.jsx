import { LuFileText, LuLink, LuLock, LuMail, LuUser } from "react-icons/lu";
import LabeledInput from "./LabeledInput";
import LabeledTextarea from "./LabeledTextarea";
import PasswordToggleField from "./PasswordToggleField";

export default function EditProfileForm({
  formData,
  errors,
  onChange,
  onSubmit,
  onCancel,
  isUpdating,
  showPassword,
  onTogglePasswordVisibility,
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24 md:pb-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <LabeledInput
          label="Ad Soyad"
          icon={LuUser}
          name="fullname"
          value={formData.fullname}
          onChange={onChange}
          error={errors.fullname}
          placeholder="Adınız ve soyadınız"
          autoComplete="name"
        />

        <LabeledInput
          label="Kullanıcı Adı"
          icon={LuUser}
          name="username"
          value={formData.username}
          onChange={onChange}
          error={errors.username}
          placeholder="@kullaniciadi"
          autoComplete="username"
        />

        <LabeledInput
          label="E-posta"
          icon={LuMail}
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          error={errors.email}
          placeholder="ornek@email.com"
          autoComplete="email"
        />

        <LabeledTextarea
          label="Biyografi"
          icon={LuFileText}
          name="bio"
          value={formData.bio}
          onChange={onChange}
          placeholder="Kendinizden bahsedin..."
        />

        <LabeledInput
          label="Web Sitesi"
          icon={LuLink}
          name="link"
          type="url"
          value={formData.link}
          onChange={onChange}
          placeholder="https://example.com"
          autoComplete="url"
        />

        <div className="space-y-4 border-t border-base-300/50 pt-6">
          <div className="flex items-center gap-2">
            <LuLock className="h-5 w-5 text-base-content/60" />
            <h3 className="text-base font-semibold">Şifre Değiştir</h3>
          </div>
          <p className="text-sm text-base-content/60">
            Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın.
          </p>

          <PasswordToggleField
            label="Mevcut Şifre"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={onChange}
            error={errors.currentPassword}
            visible={showPassword.current}
            onToggleVisible={() => onTogglePasswordVisibility("current")}
            placeholder="Mevcut şifrenizi girin"
            autoComplete="current-password"
          />

          <PasswordToggleField
            label="Yeni Şifre"
            name="newPassword"
            value={formData.newPassword}
            onChange={onChange}
            error={errors.newPassword}
            visible={showPassword.newPwd}
            onToggleVisible={() => onTogglePasswordVisibility("newPwd")}
            placeholder="Yeni şifrenizi girin (min. 6 karakter)"
            autoComplete="new-password"
          />

          <PasswordToggleField
            label="Yeni Şifreyi Tekrar Girin"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={onChange}
            error={errors.confirmNewPassword}
            visible={showPassword.confirm}
            onToggleVisible={() => onTogglePasswordVisibility("confirm")}
            placeholder="Yeni şifrenizi tekrar girin"
            autoComplete="new-password"
          />
        </div>

        <div className="flex gap-3 border-t border-base-300/50 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline flex-1 rounded-full"
            disabled={isUpdating}
          >
            İptal
          </button>
          <button
            type="submit"
            className="btn btn-primary flex flex-1 items-center justify-center gap-2 rounded-full text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                <span>Güncelleniyor...</span>
              </>
            ) : (
              "Değişiklikleri Kaydet"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
