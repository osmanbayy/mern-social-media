const isDev = process.env.NODE_ENV === "development";

/**
 * @param {string} label
 * @param {unknown} error
 */
export function logControllerError(label, error) {
  const message = error?.message ?? String(error);
  if (isDev) {
    console.error(`[controller:${label}]`, message);
  } else {
    console.error(JSON.stringify({ scope: "controller", label, message }));
  }
}

/**
 * Express async handler: tek noktadan log + 500. İstemci yanıtı özelleştirmek için `onError` kullan.
 * @param {string} label
 * @param {(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<unknown>} handler
 * @param {{ onError?: (error: Error, res: import("express").Response) => void }} [options]
 */
export function asyncHandler(label, handler, options = {}) {
  const { onError } = options;
  return async (req, res, next) => {
    try {
      return await handler(req, res, next);
    } catch (error) {
      logControllerError(label, error);
      if (res.headersSent) return;
      if (typeof onError === "function") {
        return onError(error, res);
      }
      res.status(500).json({ message: "Sunucu hatası." });
    }
  };
}
