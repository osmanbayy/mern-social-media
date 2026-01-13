// Parse text and extract mentions
export const parseMentions = (text) => {
  if (!text) return null;

  // Match @username pattern (username can contain letters, numbers, underscores)
  const mentionRegex = /@(\w+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add mention
    parts.push({
      type: "mention",
      username: match[1],
      fullMatch: match[0],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
    });
  }

  // If no mentions found, return null to use original text
  if (parts.length === 1 && parts[0].type === "text") {
    return null;
  }

  return parts;
};
