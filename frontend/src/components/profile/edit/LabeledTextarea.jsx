import { EDIT_PROFILE_BIO_MAX } from "../../../utils/editProfileFormDefaults";

const okFocus = "focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function LabeledTextarea({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  maxLength = EDIT_PROFILE_BIO_MAX,
  rows = 4,
  placeholder,
}) {
  const len = value?.length ?? 0;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-base-content/80">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        rows={rows}
        className={`textarea textarea-bordered w-full resize-none rounded-xl transition-all duration-200 ${okFocus}`}
        placeholder={placeholder}
      />
      <p className={`text-xs ${len >= 150 ? "text-warning" : "text-base-content/50"}`}>
        {len}/{maxLength} karakter
      </p>
    </div>
  );
}
