import { LuChevronRight } from "react-icons/lu";

export default function SettingsNavButton({ item, isActive, onSelectItem, className = "" }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelectItem(item.id)}
      className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200 ${className} ${
        isActive
          ? "bg-accent/12 font-semibold text-accent shadow-sm ring-1 ring-accent/20"
          : "text-base-content/75 hover:bg-base-200/60 hover:text-base-content"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
          isActive ? "bg-accent/15 text-accent" : "bg-base-200/70 text-base-content/65 group-hover:bg-base-300/60"
        }`}
      >
        <Icon className="h-[1.25rem] w-[1.25rem]" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px]">{item.label}</span>
      <LuChevronRight
        className={`h-4 w-4 shrink-0 transition-transform ${
          isActive ? "text-accent" : "text-base-content/25 group-hover:translate-x-0.5 group-hover:text-base-content/45"
        }`}
      />
    </button>
  );
}
