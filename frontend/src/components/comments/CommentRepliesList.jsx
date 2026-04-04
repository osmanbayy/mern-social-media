import CommentReplyRow from "./CommentReplyRow";

export default function CommentRepliesList({ replies, authUser, defaultProfilePicture }) {
  if (!replies?.length) return null;

  return (
    <div className="mt-3 ml-4 space-y-3 border-l-2 border-base-300/30 pl-4">
      {replies.map((reply) => (
        <CommentReplyRow
          key={reply._id}
          reply={reply}
          authUser={authUser}
          defaultProfilePicture={defaultProfilePicture}
        />
      ))}
    </div>
  );
}
