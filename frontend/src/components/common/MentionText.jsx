import { Link } from "react-router-dom";
import { parseMentions } from "../../utils/mention";

// Render text with mentions as links
const MentionText = ({ text, className = "" }) => {
  if (!text) return null;

  const parts = parseMentions(text);

  if (!parts) {
    return <span className={`whitespace-pre-wrap break-words ${className}`}>{text}</span>;
  }

  return (
    <span className={`whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.content}</span>;
        } else {
          return (
            <Link
              key={index}
              to={`/profile/${part.username}`}
              className="text-primary hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part.fullMatch}
            </Link>
          );
        }
      })}
    </span>
  );
};

export default MentionText;
