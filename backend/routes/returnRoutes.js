import express from "express";
const router = express.Router();
import {
  requestOrderReturn,
  getReturnRequests,
  getMyReturns,
  reviewReturnRequest,
  markReturnPickedUp,
  processRefund,
} from "../controllers/returnController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router.route("/my").get(authenticate, getMyReturns);

router.route("/").get(authenticate, authorizeAdmin, getReturnRequests);

router.route("/:orderId").post(authenticate, requestOrderReturn);

router
  .route("/:id/review")
  .put(authenticate, authorizeAdmin, reviewReturnRequest);

router
  .route("/:id/pickup")
  .put(authenticate, authorizeAdmin, markReturnPickedUp);

router.route("/:id/refund").put(authenticate, authorizeAdmin, processRefund);

export default router;
