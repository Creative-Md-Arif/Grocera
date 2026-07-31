import express from "express";
const router = express.Router();

// controllers
import {
  createBanner,
  getAllBanners,
  getBannerById,
  getActiveBanners,
  getHeroBanners,
  getCategoryBanners,
  getPromotionalBanners,
  getPopupBanner,
  getTopBarBanner,
  getFooterBanners,
  getSidebarBanners,
  updateBanner,
  toggleBannerStatus,
  updateBannerPosition,
  incrementBannerClicks,
  deleteBanner,
  deleteMultipleBanners,
  getBannerStats,
} from "../controllers/bannerController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";

// ==================== PUBLIC ROUTES (No Auth Required) ====================

// সক্রিয় ব্যানার পাওয়া (ফ্রন্টএন্ডের জন্য)
router.get("/active", getActiveBanners);

// হিরো ব্যানার
router.get("/hero", getHeroBanners);

// ক্যাটাগরি ব্যানার
router.get("/category", getCategoryBanners);

// প্রমোশনাল ব্যানার
router.get("/promotional", getPromotionalBanners);

// পপ-আপ ব্যানার
router.get("/popup", getPopupBanner);

// টপ বার ব্যানার
router.get("/top-bar", getTopBarBanner);

// ফুটার ব্যানার
router.get("/footer", getFooterBanners);

// সাইডবার ব্যানার
router.get("/sidebar", getSidebarBanners);

// ক্লিক কাউন্ট বাড়ানো
router.post("/:id/click", checkId, incrementBannerClicks);

// ==================== PROTECTED ROUTES (Admin Only) ====================

// সব ব্যানার পাওয়া (অ্যাডমিন)
router.get("/", authenticate, authorizeAdmin, getAllBanners);

// ব্যানার স্ট্যাটিস্টিক্স
router.get("/stats/overview", authenticate, authorizeAdmin, getBannerStats);

// নতুন ব্যানার তৈরি
router.post("/", authenticate, authorizeAdmin, createBanner);

// একাধিক ব্যানার ডিলিট
router.post(
  "/delete-multiple",
  authenticate,
  authorizeAdmin,
  deleteMultipleBanners,
);

// নির্দিষ্ট ব্যানার রাউটস
router
  .route("/:id")
  .get(authenticate, authorizeAdmin, checkId, getBannerById)
  .put(authenticate, authorizeAdmin, checkId, updateBanner)
  .delete(authenticate, authorizeAdmin, checkId, deleteBanner);

// ব্যানার স্ট্যাটাস টগল
router.patch(
  "/:id/toggle-status",
  authenticate,
  authorizeAdmin,
  checkId,
  toggleBannerStatus,
);

// ব্যানার পজিশন আপডেট
router.patch(
  "/:id/position",
  authenticate,
  authorizeAdmin,
  checkId,
  updateBannerPosition,
);

export default router;
