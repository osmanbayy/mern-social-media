/** Servis katmanından dönen { ok, status, data?, message? } sonucunu Express yanıtına yazar */
export function sendServiceResult(res, result) {
  if (!result.ok) {
    const { ok: _ok, status, message, ...rest } = result;
    return res.status(status).json({ message, ...rest });
  }
  return res.status(result.status).json(result.data);
}
