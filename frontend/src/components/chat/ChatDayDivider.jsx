import { formatChatDayLabel } from "../../utils/chatFormatting";

export default function ChatDayDivider({ date, className }) {
  return (
    <div className="flex justify-center py-4 first:pt-0">
      <span className={className}>{formatChatDayLabel(date)}</span>
    </div>
  );
}
