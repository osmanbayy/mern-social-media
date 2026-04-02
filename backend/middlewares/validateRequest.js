import { validationResult } from "express-validator";

/** express-validator zincirinden sonra çalışır; ilk hatayı döner */
export function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const first = result.array({ onlyFirstError: true })[0];
  return res.status(400).json({
    message: first.msg,
    field: first.path ?? first.param,
  });
}
