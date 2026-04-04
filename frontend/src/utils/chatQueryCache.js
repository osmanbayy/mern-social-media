import { qkMessages } from "../constants/queryKeys";

export function appendMessageToMessagesCache(queryClient, conversationId, msg) {
  const key = qkMessages(conversationId);
  queryClient.setQueryData(key, (old) => {
    const base = old || {
      messages: [],
      page: 1,
      totalPages: 1,
      total: 0,
    };
    const list = base.messages || [];
    if (list.some((m) => String(m._id) === String(msg._id))) {
      return base;
    }
    return {
      ...base,
      messages: [...list, msg],
      total: (base.total ?? list.length) + 1,
    };
  });
}

export function replaceMessageInMessagesCache(queryClient, conversationId, data) {
  const key = qkMessages(conversationId);
  queryClient.setQueryData(key, (old) => {
    const base = old || { messages: [], page: 1, totalPages: 1, total: 0 };
    const list = base.messages || [];
    const next = list.map((msg) =>
      String(msg._id) === String(data._id) ? { ...msg, ...data } : msg
    );
    return { ...base, messages: next };
  });
}
