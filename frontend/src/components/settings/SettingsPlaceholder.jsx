import { LuSparkles } from "react-icons/lu";

/** Yakında gelecek ayar bölümleri için ortak kart */
const SettingsPlaceholder = ({ title, description }) => {
  return (
    <div className="rounded-3xl border border-base-300/55 bg-gradient-to-b from-base-100 to-base-200/20 p-8 text-center shadow-xl ring-1 ring-black/5 dark:from-base-100 dark:to-base-300/15 dark:ring-white/5">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/12 text-accent ring-4 ring-accent/10">
        <LuSparkles className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h3 className="text-lg font-bold tracking-tight text-base-content">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-base-content/60">{description}</p>
    </div>
  );
};

export default SettingsPlaceholder;
