const baseInputClass =
  "w-full input input-bordered rounded-xl transition-all duration-200";
const okFocus = "focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function LabeledInput({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-base-content/80">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`${baseInputClass} ${error ? "input-error border-error" : okFocus}`}
        placeholder={placeholder}
      />
      {error ? <p className="flex items-center gap-1 text-xs text-error">{error}</p> : null}
    </div>
  );
}
