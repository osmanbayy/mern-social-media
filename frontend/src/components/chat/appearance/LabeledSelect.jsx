const baseSelectClass = "select select-bordered w-full rounded-xl";

/**
 * Etiket + isteğe bağlı açıklama + seçenek haritasından `<select>`.
 * @param {Record<string, string>} options — value → görünen metin
 */
export default function LabeledSelect({
  id,
  /** `setAppearance` ile kullanıldığında: state alanı adı (`bubbleShape`, `messageDensity`, …) */
  fieldName,
  label,
  hint,
  value,
  onChange,
  options,
  /** `true`: üst sütunlardaki gibi `max-w-md` ile dar */
  narrow = false,
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-base-content" htmlFor={id}>
        {label}
      </label>
      {hint ? <p className="text-xs text-base-content/50">{hint}</p> : null}
      <select
        id={id}
        name={fieldName}
        className={narrow ? `${baseSelectClass} max-w-md` : baseSelectClass}
        value={value}
        onChange={onChange}
      >
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
