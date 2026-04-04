const colorInputClass =
  "h-11 w-14 cursor-pointer rounded-lg border border-base-300/60 bg-base-100 p-1";
const hexInputClass = "input input-bordered input-sm flex-1 rounded-xl font-mono text-xs";

function ColorPairRow({ label, value, onChange, colorAriaLabel }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-base-content/80">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          className={colorInputClass}
          value={value}
          onChange={onChange}
          aria-label={colorAriaLabel}
        />
        <input
          type="text"
          className={hexInputClass}
          value={value}
          onChange={onChange}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

/** Özel balon teması: gönderdiğim / aldığım hex renkleri */
export default function CustomBubbleColorFields({ appearance, onCustomMine, onCustomTheirs }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ColorPairRow
        label="Gönderdiğim mesajlar"
        value={appearance.customMine}
        onChange={onCustomMine}
        colorAriaLabel="Gönderdiğim mesaj balon rengi"
      />
      <ColorPairRow
        label="Aldığım mesajlar"
        value={appearance.customTheirs}
        onChange={onCustomTheirs}
        colorAriaLabel="Aldığım mesaj balon rengi"
      />
    </div>
  );
}
