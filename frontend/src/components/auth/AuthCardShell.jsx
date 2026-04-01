import OSSvg from "../svgs/OS";

/**
 * Same outer card as LoginPage / SignupPage: logo (mobile), title, subtitle, body.
 */
const AuthCardShell = ({ title, titleHighlight, subtitle, children, footer }) => {
  const renderTitle = () => {
    if (title != null && typeof title !== "string") {
      return <div className="w-full text-center">{title}</div>;
    }
    const t = title ?? "";
    if (titleHighlight) {
      const idx = t.indexOf(titleHighlight);
      if (idx === -1) {
        return <h1 className="text-center text-3xl font-extrabold text-base-content">{t}</h1>;
      }
      return (
        <h1 className="text-center text-3xl font-extrabold text-base-content">
          {t.slice(0, idx)}
          <span className="text-accent">{titleHighlight}</span>
          {t.slice(idx + titleHighlight.length)}
        </h1>
      );
    }
    return <h1 className="text-center text-3xl font-extrabold text-base-content">{t}</h1>;
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-base-300/60 bg-base-100 p-6 shadow-2xl md:p-8">
      <div className="mb-6 flex flex-col items-center gap-3">
        <OSSvg forceDark className="h-20 w-20 shrink-0 md:hidden" />
        {renderTitle()}
        {subtitle != null && (
          <div className="w-full text-center text-sm leading-relaxed text-base-content/70">{subtitle}</div>
        )}
      </div>
      {children}
      {footer}
    </div>
  );
};

export default AuthCardShell;
