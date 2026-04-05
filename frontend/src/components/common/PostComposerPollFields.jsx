import { HiOutlineChartBar } from "react-icons/hi2";

const MAX_OPTIONS = 4;
const MIN_OPTIONS = 2;

/**
 * Araç çubuğundaki anket ikonu — görsel / konum / emoji ile aynı hizada.
 * @param {{ enabled: boolean, disabled?: boolean, onToggle: (next: boolean) => void, buttonClassName?: string }} props
 */
export function PostComposerPollToggleButton({ enabled, disabled, onToggle, buttonClassName = "" }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label="Anket ekle"
      aria-pressed={enabled}
      onClick={() => onToggle(!enabled)}
      className={
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors " +
        (enabled
          ? "border-primary bg-primary/10 text-primary dark:bg-primary/15 "
          : "border-transparent bg-base-200/60 text-base-content/70 hover:bg-primary/15 hover:text-primary dark:bg-base-300/40 ") +
        buttonClassName
      }
    >
      <HiOutlineChartBar className="h-5 w-5" />
    </button>
  );
}

/**
 * Anket açıkken soru ve seçenek alanları (araç çubuğunun hemen altında).
 * @param {{
 *   question: string,
 *   onQuestionChange: (v: string) => void,
 *   options: string[],
 *   onOptionsChange: (v: string[]) => void,
 *   disabled?: boolean,
 * }} props
 */
export default function PostComposerPollFields({
  question,
  onQuestionChange,
  options,
  onOptionsChange,
  disabled,
}) {
  const setOption = (i, val) => {
    const next = [...options];
    next[i] = val;
    onOptionsChange(next);
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    onOptionsChange([...options, ""]);
  };

  const removeOption = () => {
    if (options.length <= MIN_OPTIONS) return;
    onOptionsChange(options.slice(0, -1));
  };

  return (
    <div className="mt-2 space-y-2 rounded-xl border border-base-300/50 bg-base-200/25 p-3 dark:bg-base-300/20">
      <input
        type="text"
        className="input input-bordered input-sm w-full border-base-300/60 bg-base-100/80 text-sm"
        placeholder="Anket sorusu (isteğe bağlı)"
        value={question}
        disabled={disabled}
        onChange={(e) => onQuestionChange(e.target.value)}
        maxLength={300}
      />
      {options.map((opt, i) => (
        <input
          key={i}
          type="text"
          className="input input-bordered input-sm w-full border-base-300/60 bg-base-100/80 text-sm"
          placeholder={`Seçenek ${i + 1}`}
          value={opt}
          disabled={disabled}
          onChange={(e) => setOption(i, e.target.value)}
          maxLength={100}
        />
      ))}
      <div className="flex flex-wrap gap-2 pt-1">
        {options.length < MAX_OPTIONS && (
          <button type="button" className="btn btn-ghost btn-xs" disabled={disabled} onClick={addOption}>
            Seçenek ekle
          </button>
        )}
        {options.length > MIN_OPTIONS && (
          <button
            type="button"
            className="btn btn-ghost btn-xs text-error/90"
            disabled={disabled}
            onClick={removeOption}
          >
            Son seçeneği sil
          </button>
        )}
      </div>
    </div>
  );
}
