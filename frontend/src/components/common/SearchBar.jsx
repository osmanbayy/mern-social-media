import { LuSearch } from "react-icons/lu";

const panelLabelClass =
  "input input-bordered flex h-11 w-full items-center gap-2 rounded-full border-base-300/60 bg-base-200/40 pl-1 pr-2 text-sm shadow-sm transition focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/20";

const pageWrapperClass = "relative";
const pageInputClass =
  "w-full rounded-full border border-base-300/50 bg-base-200/50 py-3 pl-10 pr-4 transition-all duration-200 placeholder:text-base-content/45 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50";
const pageIconClass =
  "pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40";

/**
 * Arama formu (controlled).
 * @param {"panel" | "page"} variant — panel: sağ panel stili; page: arama sonuçları (ikon solda)
 */
const SearchBar = ({
  variant = "panel",
  value,
  onChange,
  onSubmit,
  placeholder = "Ara…",
  formClassName = "relative w-full",
  labelClassName = panelLabelClass,
  inputClassName,
  iconClassName,
  icon: Icon = LuSearch,
  autoComplete = "off",
  inputProps = {},
}) => {
  if (variant === "page") {
    return (
      <form onSubmit={onSubmit} className={formClassName}>
        <div className={pageWrapperClass}>
          <Icon className={pageIconClass} aria-hidden />
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={inputClassName ?? pageInputClass}
            autoComplete={autoComplete}
            {...inputProps}
          />
        </div>
      </form>
    );
  }

  const defaultInputClass =
    inputClassName ?? "grow bg-transparent placeholder:text-base-content/45 focus:outline-none";
  const defaultIconClass =
    iconClassName ?? "ml-2 h-5 w-5 shrink-0 text-base-content/45";

  return (
    <form onSubmit={onSubmit} className={formClassName}>
      <label className={labelClassName}>
        <Icon className={defaultIconClass} aria-hidden />
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={defaultInputClass}
          autoComplete={autoComplete}
          {...inputProps}
        />
      </label>
    </form>
  );
};

export default SearchBar;
