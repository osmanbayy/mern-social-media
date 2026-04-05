import { query } from "express-validator";
import { LIMITS } from "../lib/securityConstants.js";

export const nearbyPlacesQueryValidators = [
  query("lat").isFloat({ min: -90, max: 90 }).withMessage("Geçersiz enlem."),
  query("lon").isFloat({ min: -180, max: 180 }).withMessage("Geçersiz boylam."),
];

export const searchPlacesQueryValidators = [
  query("q")
    .trim()
    .isLength({ min: 2, max: LIMITS.SEARCH_QUERY_MAX })
    .withMessage("Arama 2–200 karakter olmalı."),
  query("lat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Geçersiz enlem."),
  query("lon")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Geçersiz boylam."),
];
