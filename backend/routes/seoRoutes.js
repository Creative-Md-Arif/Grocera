import express from "express";
import {
  getSeoSettings,
  updateSeoSettings,
} from "../controllers/seoController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route to get settings
router.route("/").get(getSeoSettings);

// Admin protected route to update settings
router.route("/").put(authenticate, authorizeAdmin, updateSeoSettings);

export default router;
