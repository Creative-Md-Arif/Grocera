import express from "express";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

import {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  toggleCampaignStatus,
  getAllCampaigns,
  getActiveCampaigns,
  getCampaignById,
  getCampaignProducts,
} from "../controllers/campaignController.js";

const router = express.Router();

// ---------------- Public routes ----------------
router.get("/active", getActiveCampaigns);
router.get("/:id", getCampaignById);
router.get("/:id/products", getCampaignProducts);

// ---------------- Admin routes ----------------
router.post("/", authenticate, authorizeAdmin, createCampaign);
router.get("/", authenticate, authorizeAdmin, getAllCampaigns);
router.put("/:id", authenticate, authorizeAdmin, updateCampaign);
router.delete("/:id", authenticate, authorizeAdmin, deleteCampaign);
router.patch("/:id/toggle", authenticate, authorizeAdmin, toggleCampaignStatus);

export default router;
