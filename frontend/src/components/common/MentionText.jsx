import { Link } from "react-router-dom";
import { parsePostTextSegments } from "../../utils/postTextSegments";

const MentionText = ({ text, className = "" }) => {
  if (!text) return null;

  const parts = parsePostTextSegments(text);

  if (!parts) {
    return <span className={`whitespace-pre-wrap break-words ${className}`}>{text}</span>;
  }

  return (
    <span className={`whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.content}</span>;
        }
        if (part.type === "mention") {
          return (
            <Link
              key={index}
              to={`/profile/${part.username}`}
              className="font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part.fullMatch}
            </Link>
          );
        }
        return (
          <Link
            key={index}
            to={`/hashtag/${encodeURIComponent(part.tag)}`}
            className="font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part.fullMatch}
          </Link>
        );
      })}
    </span>
  );
};

export default MentionText;
