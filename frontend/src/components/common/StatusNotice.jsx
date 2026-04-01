import { FiAlertTriangle } from "react-icons/fi";

const StatusNotice = ({
  title,
  message,
  statusText = "Durum kontrol ediliyor",
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`max-w-md rounded-2xl border border-warning/40 bg-warning/10 p-4 text-left shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-warning/20 p-2 text-warning">
          <FiAlertTriangle className="h-4 w-4" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-warning-content">{title}</p>
          <p className="text-sm text-base-content/80 leading-relaxed">{message}</p>
          {statusText && (
            <div className="inline-flex items-center gap-2 text-xs text-base-content/70">
              <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              {statusText}
            </div>
          )}
          {actionLabel && onAction && (
            <button className="btn btn-sm btn-warning mt-1" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusNotice;
