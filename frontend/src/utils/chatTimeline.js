/**
 * @param {unknown[]} messages
 * @returns {Array<{ kind: 'day', id: string, date: string } | { kind: 'msg', m: unknown, index: number }>}
 */
export function buildChatTimeline(messages) {
  const rows = [];
  let lastDay = null;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const day = m.createdAt ? new Date(m.createdAt).toDateString() : null;
    if (day && day !== lastDay) {
      rows.push({ kind: "day", id: `day-${day}-${i}`, date: m.createdAt });
      lastDay = day;
    }
    rows.push({ kind: "msg", m, index: i });
  }
  return rows;
}
