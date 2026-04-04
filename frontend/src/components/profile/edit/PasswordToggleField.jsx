import { LuEye, LuEyeOff } from "react-icons/lu";

const baseClass =
  "w-full input input-bordered rounded-xl pr-10 transition-all duration-200";
const okFocus = "focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function PasswordToggleField({
  label,
  name,
  value,
  onChange,
  error,
  visible,
  onToggleVisible,
  placeholder,
  autoComplete,
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-base-content/70">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`${baseClass} ${error ? "input-error border-error" : okFocus}`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 transition-colors hover:text-base-content"
          aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
        >
          {visible ? <LuEyeOff className="h-5 w-5" /> : <LuEye className="h-5 w-5" />}
        </button>
      </div>
      {error ? <p className="flex items-center gap-1 text-xs text-error">{error}</p> : null}
    </div>
  );
}
