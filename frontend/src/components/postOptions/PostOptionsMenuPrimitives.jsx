import LoadingSpinner from "../common/LoadingSpinner";
import { POST_OPTIONS_ITEM_HOVER } from "./postOptionsTheme";

export function MenuRow({ children, onClick, className = "" }) {
  return (
    <li
      className={`${POST_OPTIONS_ITEM_HOVER} ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </li>
  );
}

export function MenuAnchorContent({ icon: Icon, label, extra }) {
  return (
    <span className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-none">
      {Icon ? <Icon /> : null}
      <span>{label}</span>
      {extra}
    </span>
  );
}

export function MenuLoadingInline({ message }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <LoadingSpinner size="xs" />
      <span className="text-xs">{message}</span>
    </div>
  );
}
