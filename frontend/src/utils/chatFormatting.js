export function formatChatMessageTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatChatDayLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Bugün";
  if (d.toDateString() === yesterday.toDateString()) return "Dün";
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export function formatChatLastSeen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} sa. önce`;
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
