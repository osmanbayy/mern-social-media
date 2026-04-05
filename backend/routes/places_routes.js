import express from "express";
import { protect_route } from "../middlewares/protect_route.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { get_nearby_places, search_places } from "../controllers/places_controller.js";
import * as pv from "../validators/places.validators.js";

const router = express.Router();

router.get("/search", protect_route, pv.searchPlacesQueryValidators, validateRequest, search_places);
router.get("/nearby", protect_route, pv.nearbyPlacesQueryValidators, validateRequest, get_nearby_places);

export default router;
