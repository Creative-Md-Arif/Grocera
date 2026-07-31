import express from "express";
import {
  createCuppon,
  getAllCuppons,
  getCupponById,
  updateCuppon,
  deleteCuppon,
  toggleCupponStatus,
  validateCuppon,
  getActiveCuppons,
  getCupponUsageStats,
} from "../controllers/cupponController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ============================================
//  PUBLIC / USER ROUTES
// ============================================

router.get("/active", getActiveCuppons);

router.post("/validate", authenticate, validateCuppon);

// ============================================
//  ADMIN ROUTES
// ============================================

router.post("/", authenticate, authorizeAdmin, createCuppon);

router.get("/", authenticate, authorizeAdmin, getAllCuppons);

router.get("/:id", authenticate, authorizeAdmin, getCupponById);

router.put("/:id", authenticate, authorizeAdmin, updateCuppon);

router.delete("/:id", authenticate, authorizeAdmin, deleteCuppon);

router.patch("/:id/toggle", authenticate, authorizeAdmin, toggleCupponStatus);

router.get("/:id/stats", authenticate, authorizeAdmin, getCupponUsageStats);

export default router;
