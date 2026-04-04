import toast from "react-hot-toast";
import { chatVisibleMessageText } from "./chatMessageModel";

export async function copyChatMessageToClipboard(m) {
  try {
    if (m.share?.kind === "post") {
      const pid = m.share.post?._id ?? m.share.post;
      if (pid) {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${pid}`);
        toast.success("Gönderi linki kopyalandı");
        return;
      }
    }
    if (m.share?.kind === "profile") {
      const u = m.share.profileUser;
      const un = typeof u === "object" && u?.username ? u.username : null;
      if (un) {
        await navigator.clipboard.writeText(`${window.location.origin}/profile/${un}`);
        toast.success("Profil linki kopyalandı");
        return;
      }
    }
    if (chatVisibleMessageText(m.text)) {
      await navigator.clipboard.writeText(chatVisibleMessageText(m.text));
      toast.success("Kopyalandı");
    }
  } catch {
    toast.error("Kopyalanamadı");
  }
}
