import {
  PAGE_SHELL_AUTH,
  PAGE_SHELL_SCROLL,
  PAGE_SHELL_SCROLL_BORDERED,
  SETTINGS_PAGE_ROOT,
} from "./pageShellClasses";

const VARIANT_CLASS = {
  scroll: PAGE_SHELL_SCROLL,
  scrollBordered: PAGE_SHELL_SCROLL_BORDERED,
  auth: PAGE_SHELL_AUTH,
  settings: SETTINGS_PAGE_ROOT,
};

export default function PageShell({
  variant = "scroll",
  className = "",
  as: Component = "div",
  children,
  ...rest
}) {
  const base = VARIANT_CLASS[variant] ?? VARIANT_CLASS.scroll;
  const merged = [base, className].filter(Boolean).join(" ");
  return (
    <Component className={merged} {...rest}>
      {children}
    </Component>
  );
}
