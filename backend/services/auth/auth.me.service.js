import User from "../../models/user_model.js";
import { ok } from "../../lib/httpResult.js";

export async function getMe(userId) {
  const user = await User.findById(userId).select("-password");
  return ok(200, user);
}
