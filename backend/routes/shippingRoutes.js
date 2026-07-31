import express from "express";
import {
  createShippingZone,
  getAllShippingZones,
  updateShippingZone,
  deleteShippingZone,
  getShippingCost,
} from "../controllers/shippingController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public/User Route
router.post("/calculate", getShippingCost);

// Admin Routes
router
  .route("/")
  .post(authenticate, authorizeAdmin, createShippingZone)
  .get(authenticate, authorizeAdmin, getAllShippingZones);

router
  .route("/:id")
  .put(authenticate, authorizeAdmin, updateShippingZone)
  .delete(authenticate, authorizeAdmin, deleteShippingZone);

export default router;
