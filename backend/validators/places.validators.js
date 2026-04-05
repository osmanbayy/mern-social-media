import { query } from "express-validator";

export const nearbyPlacesQueryValidators = [
  query("lat").isFloat({ min: -90, max: 90 }).withMessage("Geçersiz enlem."),
  query("lon").isFloat({ min: -180, max: 180 }).withMessage("Geçersiz boylam."),
];
