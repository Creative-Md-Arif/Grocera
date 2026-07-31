import express from "express";
import {
  addProductReview,
  getProductReviews,
  getFeaturedReviews,
  toggleReviewFeature,
  replyToReview,
  deleteReviewReply,
  markReviewHelpful,
  getAllReviews,
  deleteReviewAdmin,
} from "../controllers/reviewController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";

const router = express.Router();

// ==========================================
// ⭐ Admin Routes (এগুলো সবার উপরে থাকবে)
// ==========================================

router.get("/admin/all", authenticate, authorizeAdmin, getAllReviews);

router.delete(
  "/admin/:id/:reviewId",
  authenticate,
  authorizeAdmin,
  deleteReviewAdmin,
);

// ==========================================
// Public & User Routes
// ==========================================

router.get("/featured", getFeaturedReviews);

router.get("/:id", getProductReviews);

router.post("/:id/reviews", authenticate, checkId, addProductReview);

router.put("/:id/:reviewId/helpful", authenticate, markReviewHelpful);

// ==========================================
// Admin Action Routes (Reply, Feature)
// ==========================================

router.put(
  "/:id/:reviewId/feature",
  authenticate,
  authorizeAdmin,
  toggleReviewFeature,
);

router.put("/:id/:reviewId/reply", authenticate, authorizeAdmin, replyToReview);

router.delete(
  "/:id/:reviewId/reply",
  authenticate,
  authorizeAdmin,
  deleteReviewReply,
);

export default router;
