import express from "express";
const router = express.Router();

import {
  trackOrderPublic,
  addTrackingEvent,
  getTrackingHistory,
} from "../controllers/orderTrackingController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router.route("/").get(trackOrderPublic);

router
  .route("/:orderId/events")
  .post(authenticate, authorizeAdmin, addTrackingEvent);

router.route("/:orderId").get(authenticate, authorizeAdmin, getTrackingHistory);

export default router;
