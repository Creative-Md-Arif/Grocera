import express from "express";
import formidable from "express-formidable";
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  toggleBrandActive,
  toggleBrandFeatured,
  checkBrandName,
  reorderBrands,
} from "../controllers/brandController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getBrands);
router.get("/check", checkBrandName);
router.get("/:id", getBrandById);

// Admin routes
router.post("/", authenticate, authorizeAdmin, formidable(), createBrand);

router.put("/reorder", authenticate, authorizeAdmin, reorderBrands);

router.put("/:id", authenticate, authorizeAdmin, formidable(), updateBrand);

router.delete("/:id", authenticate, authorizeAdmin, deleteBrand);

router.put(
  "/:id/toggle-active",
  authenticate,
  authorizeAdmin,
  toggleBrandActive,
);

router.put(
  "/:id/toggle-featured",
  authenticate,
  authorizeAdmin,
  toggleBrandFeatured,
);

export default router;
