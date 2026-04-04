import ConversationListItem from "./ConversationListItem";

export default function ConversationList({ conversations }) {
  return (
    <ul className="flex flex-col gap-2.5 sm:gap-3">
      {conversations.map((c) => (
        <ConversationListItem key={c._id} conversation={c} />
      ))}
    </ul>
  );
}
