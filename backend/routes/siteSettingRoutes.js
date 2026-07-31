import express from "express";
const router = express.Router();
import {
  getSiteSettings,
  updateSiteSettings,
} from "../controllers/siteSettingController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router
  .route("/")
  .get(getSiteSettings)
  .put(authenticate, authorizeAdmin, updateSiteSettings);

export default router;
